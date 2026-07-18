import { useBuiltinCountryFile } from '@ham2k/lib-country-files'
import { createSlice } from '@reduxjs/toolkit'
import { setCurrentLogCalls } from '../entries'
import { setSettingsYear } from '../settings'
import { logDB } from './logDB'
import { annotateAndGroupLog } from './actions/annotateAndGroupLog'

useBuiltinCountryFile()

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
      if (state.qsos && state.year) {
        const { yearQSOs, entityGroups } = annotateAndGroupLog(state.qsos, state.goodCalls, state.badCalls, state.year)
        state.yearQSOs = yearQSOs
        state.entityGroups = entityGroups
      }
    }
  }
})

export const { setCurrentLogInfo, setCallLists } = logSlice.actions

export const fetchCallLists = () => (dispatch) => {
  Promise.all([
    fetch('https://dxmarathon.com/resources/all-good-calls.json').then(res => res.json()).catch(() => ({ entries: [] })),
    fetch('https://dxmarathon.com/resources/all-bad-calls.json').then(res => res.json()).catch(() => ({ entries: [] }))
  ]).then(([goodData, badData]) => {
    dispatch(setCallLists({
      goodCalls: goodData.entries || [],
      badCalls: badData.entries || []
    }))
  })
}

export const fetchCurrentLog = () => (dispatch) => {
  logDB().then((db) => {
    const transaction = db.transaction('logs', 'readonly')
    const request = transaction.objectStore('logs').get('current')
    request.onsuccess = () => {
      if (request.result) {
        dispatch(
          setCurrentLogInfo({
            qsos: request.result.qsos,
            yearQSOs: request.result.yearQSOs,
            entityGroups: request.result.entityGroups,
            ourCalls: request.result.ourCalls,
            year: request.result.year
          })
        )
        dispatch(setCurrentLogCalls(request.result.ourCalls))
        dispatch(setSettingsYear({ year: request.result.year }))
      }
    }
    request.onerror = (event) => {
      console.error('IndexedDB Error', event, transaction)
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
