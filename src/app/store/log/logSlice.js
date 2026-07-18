import { useBuiltinCountryFile } from '@ham2k/lib-country-files'
import { createSlice } from '@reduxjs/toolkit'
import localforage from 'localforage'
import { setCurrentLogCalls } from '../entries'
import { setSettingsYear } from '../settings'
import { logDB } from './logDB'
import { annotateAndGroupLog } from './actions/annotateAndGroupLog'

useBuiltinCountryFile()

const CALL_LISTS_CACHE_KEY = 'callListsCache'
const CALL_LISTS_TTL_MS = 60 * 60 * 1000 // 1 hour

const initialState = {
  goodCalls: [],
  badCalls: [],
  year: undefined,
  qsos: undefined,
  yearQSOs: undefined,
  entityGroups: undefined,
  ourCalls: undefined
}

export const logSlice = createSlice({
  name: 'log',

  initialState,

  reducers: {
    setCurrentLogInfo: (state, action) => {
      state.qsos = action.payload.qsos
      state.yearQSOs = action.payload.yearQSOs
      state.entityGroups = action.payload.entityGroups
      state.ourCalls = action.payload.ourCalls
      state.year = action.payload.year
    },
    setCallLists: (state, action) => {
      state.goodCalls = action.payload.goodCalls
      state.badCalls = action.payload.badCalls
      if (action.payload.yearQSOs !== undefined) {
        state.yearQSOs = action.payload.yearQSOs
        state.entityGroups = action.payload.entityGroups
      }
    }
  }
})

export const { setCurrentLogInfo, setCallLists } = logSlice.actions

async function fetchCallListsFromNetwork () {
  const [goodData, badData] = await Promise.all([
    fetch('https://dxmarathon.com/resources/all-good-calls.json').then(res => res.json()).catch(() => ({ entries: [] })),
    fetch('https://dxmarathon.com/resources/all-bad-calls.json').then(res => res.json()).catch(() => ({ entries: [] }))
  ])
  return {
    goodCalls: goodData.entries || [],
    badCalls: badData.entries || []
  }
}

async function getCachedCallLists () {
  try {
    const cached = await localforage.getItem(CALL_LISTS_CACHE_KEY)
    if (cached && cached.timestamp && (Date.now() - cached.timestamp) < CALL_LISTS_TTL_MS) {
      return { goodCalls: cached.goodCalls, badCalls: cached.badCalls }
    }
  } catch (e) {
    // Ignore cache read errors
  }
  return null
}

async function cacheCallLists (goodCalls, badCalls) {
  try {
    await localforage.setItem(CALL_LISTS_CACHE_KEY, {
      goodCalls,
      badCalls,
      timestamp: Date.now()
    })
  } catch (e) {
    // Ignore cache write errors
  }
}

function fetchLogFromDB () {
  return new Promise((resolve, reject) => {
    logDB().then((db) => {
      const transaction = db.transaction('logs', 'readonly')
      const request = transaction.objectStore('logs').get('current')
      request.onsuccess = () => resolve(request.result || null)
      request.onerror = (event) => {
        console.error('IndexedDB Error', event, transaction)
        resolve(null)
      }
    }).catch(err => {
      console.error('IndexedDB Error', err)
      resolve(null)
    })
  })
}

// Coordinated startup: load log and call lists in parallel, annotate once, dispatch once
export const loadWorksheetData = () => async (dispatch) => {
  const [logRecord, callLists] = await Promise.all([
    fetchLogFromDB(),
    getCachedCallLists().then(cached => {
      if (cached) return { ...cached, fromCache: true }
      return fetchCallListsFromNetwork().then(lists => ({ ...lists, fromCache: false }))
    })
  ])

  if (!callLists.fromCache) {
    cacheCallLists(callLists.goodCalls, callLists.badCalls)
  }

  if (logRecord) {
    // Re-annotate the log with call lists in one pass
    const { yearQSOs, entityGroups } = annotateAndGroupLog(
      logRecord.qsos, callLists.goodCalls, callLists.badCalls, logRecord.year
    )

    dispatch(setCurrentLogInfo({
      qsos: logRecord.qsos,
      yearQSOs,
      entityGroups,
      ourCalls: logRecord.ourCalls,
      year: logRecord.year
    }))
    dispatch(setCurrentLogCalls(logRecord.ourCalls))
    dispatch(setSettingsYear({ year: logRecord.year }))
  }

  dispatch(setCallLists({
    goodCalls: callLists.goodCalls,
    badCalls: callLists.badCalls
  }))

  // If call lists came from cache, refresh in background for next load
  if (callLists.fromCache) {
    fetchCallListsFromNetwork().then(fresh => {
      cacheCallLists(fresh.goodCalls, fresh.badCalls)
      // If the log is loaded, re-annotate with fresh lists
      if (logRecord) {
        const { yearQSOs, entityGroups } = annotateAndGroupLog(
          logRecord.qsos, fresh.goodCalls, fresh.badCalls, logRecord.year
        )
        dispatch(setCallLists({
          goodCalls: fresh.goodCalls,
          badCalls: fresh.badCalls,
          yearQSOs,
          entityGroups
        }))
      } else {
        dispatch(setCallLists({
          goodCalls: fresh.goodCalls,
          badCalls: fresh.badCalls
        }))
      }
    })
  }
}

// Keep fetchCallLists for use after log imports (loadADIFLog reads goodCalls/badCalls from state)
export const fetchCallLists = () => async (dispatch, getState) => {
  const lists = await getCachedCallLists() || await fetchCallListsFromNetwork()
  if (!await getCachedCallLists()) {
    cacheCallLists(lists.goodCalls, lists.badCalls)
  }
  const { log: logState } = getState()
  if (logState.qsos && logState.year) {
    const { yearQSOs, entityGroups } = annotateAndGroupLog(
      logState.qsos, lists.goodCalls, lists.badCalls, logState.year
    )
    dispatch(setCallLists({ goodCalls: lists.goodCalls, badCalls: lists.badCalls, yearQSOs, entityGroups }))
  } else {
    dispatch(setCallLists({ goodCalls: lists.goodCalls, badCalls: lists.badCalls }))
  }
}

export const fetchCurrentLog = () => (dispatch) => {
  fetchLogFromDB().then((result) => {
    if (result) {
      dispatch(
        setCurrentLogInfo({
          qsos: result.qsos,
          yearQSOs: result.yearQSOs,
          entityGroups: result.entityGroups,
          ourCalls: result.ourCalls,
          year: result.year
        })
      )
      dispatch(setCurrentLogCalls(result.ourCalls))
      dispatch(setSettingsYear({ year: result.year }))
    }
  })
}

export const clearCurrentLog = () => (dispatch) => {
  return new Promise((resolve, reject) => {
    logDB().then((db) => {
      const transaction = db.transaction('logs', 'readwrite')
      const request = transaction.objectStore('logs').put({ key: 'current' })
      request.onsuccess = () => {
        dispatch(
          setCurrentLogInfo({
            qsos: undefined,
            ourCalls: undefined,
            yearQSOs: undefined,
            entityGroups: undefined,
            year: undefined
          })
        )
        dispatch(setCurrentLogCalls(undefined))
        resolve()
      }
      request.onerror = (event) => {
        console.error('IndexedDB Error', event, transaction)
      }
    })
  })
}

export const selectAllQSOs = (state) => {
  return state?.log?.qsos
}

export const selectYearQSOs = (state) => {
  return state?.log?.yearQSOs
}

const EMPTY_OBJECT = {}

export const selectEntityGroups = (state) => {
  return state?.log?.entityGroups ?? EMPTY_OBJECT
}

export default logSlice.reducer
