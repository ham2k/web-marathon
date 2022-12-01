import { parseCallsign } from "@ham2k/data/callsigns"
import { annotateFromCountryFile } from "@ham2k/data/country-file"
import { useBuiltinCountryFile } from "@ham2k/data/country-file/builtinData"
import { adifToQSON } from "@ham2k/qson/adif"
import { qsoKey } from "@ham2k/qson/tools"
import { createSlice } from "@reduxjs/toolkit"
import qsoComparer from "../../tools/qsoComparer"
import qslSourceComparer from "../../tools/qslSourceComparer"
import guessCurrentYear from "../../tools/guessCurrentYear"
import { setSettingsYear } from "../settings"
import { logDB } from "./logDB"
import { fillDXCCfromCountryFile } from "libs/data/country-file/src/lib/analyzeFromCountryFile"

// Not sure why ESLint thinks this is a hook 🤷
useBuiltinCountryFile() // eslint-disable-line react-hooks/rules-of-hooks

const initialState = {}

export const logSlice = createSlice({
  name: "log",

  initialState,

  reducers: {
    setCurrentLogInfo: (state, action) => {
      state.qson = action.payload.qson
      state.yearQSOs = action.payload.yearQSOs
      state.entityGroups = action.payload.entityGroups
      state.ourCalls = action.payload.ourCalls
    },
  },
})

export const { setCurrentLogInfo } = logSlice.actions

function processOneQSO(qso) {
  qso.our.guess = {}
  qso.their.guess = {}
  if (qso.our.call) {
    parseCallsign(qso.our.call, qso.our.guess)
    annotateFromCountryFile(qso.our.guess, { wae: true, state: qso.our.state })
  }

  parseCallsign(qso.their.call, qso.their.guess)
  const iotaRef = qso.refs && qso.refs.find((ref) => ref.type === "iota")
  if (qso.their.dxccCode) fillDXCCfromCountryFile(qso.their.dxccCode, qso.their) // fill any missing dxcc info
  annotateFromCountryFile(qso.their.guess, { wae: true, state: qso.their.state, iota: iotaRef?.ref }) // guess dxcc from callsign

  qso.key = qsoKey(qso)

  // Sort QSL info by trust level
  qso.qsl = qso.qsl || {}
  qso.qsl.sources = (qso.qsl.sources || []).sort(qslSourceComparer)

  return qso
}

export const loadADIFLog = (data) => (dispatch, getState) => {
  return new Promise((resolve, reject) => {
    logDB().then((db) => {
      const { settings } = getState()

      const qson = adifToQSON(data)

      const year = settings?.year || guessCurrentYear()
      const yearStart = new Date(`${year}-01-01T00:00:00Z`).valueOf()
      const yearEnd = new Date(`${year}-12-31T23:59:59Z`).valueOf()

      const yearQSOs = qson.qsos.filter((qso) => qso.startMillis <= yearEnd && qso.endMillis >= yearStart)

      const ourCalls = {}
      const entityGroups = {}
      yearQSOs.forEach((qso) => {
        qso = processOneQSO(qso)

        if (qso.our.call) {
          ourCalls[qso.our.call] = (ourCalls[qso.our.call] || 0) + 1
        }

        const prefix = qso.their.entityPrefix || qso.their.guess.entityPrefix
        const zone = qso.their.cqZone || qso.their.guess.cqZone

        entityGroups[prefix] = entityGroups[prefix] || []
        entityGroups[prefix].push(qso)

        entityGroups[`Zone ${zone}`] = entityGroups[`Zone ${zone}`] || []
        entityGroups[`Zone ${zone}`].push(qso)
      })

      Object.keys(entityGroups).forEach((key) => {
        entityGroups[key] = entityGroups[key].sort(qsoComparer)
      })

      const transaction = db.transaction(["logs"], "readwrite")
      const request = transaction
        .objectStore("logs")
        .put({ key: "current", year, qson, ourCalls, yearQSOs, entityGroups })
      request.onsuccess = () => {
        dispatch(setCurrentLogInfo({ qson, ourCalls, yearQSOs, entityGroups }))
        dispatch(setSettingsYear({ year }))
        resolve()
      }
      request.onerror = (event) => {
        console.error("IndexedDB Error", event, transaction)
        reject("Error occured")
      }
    })
  })
}

export const fetchCurrentLog = () => (dispatch) => {
  logDB().then((db) => {
    const transaction = db.transaction("logs", "readonly")
    const request = transaction.objectStore("logs").get("current")
    request.onsuccess = () => {
      dispatch(setCurrentLogInfo(request.result))
      dispatch(setSettingsYear({ year: request.result.year }))
    }
  })
}

export const clearCurrentLog = () => (dispatch) => {
  logDB().then((db) => {
    const transaction = db.transaction("logs", "readwrite")
    transaction.objectStore("logs").put({ key: "current" })
    transaction.onsuccess = () => {
      dispatch(setCurrentLogInfo(undefined))
    }
  })
}

export const selectCurrentLog = (state) => {
  return state?.log?.qson
}

export const selectYearQSOs = (state) => {
  return state?.log?.yearQSOs || []
}

export const selectEntityGroups = (state) => {
  return state?.log?.entityGroups || {}
}

export const selectOurCalls = (state) => {
  return state?.log?.ourCalls || {}
}

export default logSlice.reducer
