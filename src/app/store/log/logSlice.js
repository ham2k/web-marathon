import { useBuiltinCountryFile } from "@ham2k/data/country-file/builtinData"
import { createSlice } from "@reduxjs/toolkit"
import { setSettingsYear } from "../settings"
import { logDB } from "./logDB"

// Not sure why ESLint thinks this is a hook 🤷
useBuiltinCountryFile() // eslint-disable-line react-hooks/rules-of-hooks

const initialState = {}

export const logSlice = createSlice({
  name: "log",

  initialState,

  reducers: {
    setCurrentLogInfo: (state, action) => {
      state.qsos = action.payload.qsos
      state.yearQSOs = action.payload.yearQSOs
      state.entityGroups = action.payload.entityGroups
      state.ourCalls = action.payload.ourCalls
    },
  },
})

export const { setCurrentLogInfo } = logSlice.actions

export const fetchCurrentLog = () => (dispatch) => {
  logDB().then((db) => {
    const transaction = db.transaction("logs", "readonly")
    const request = transaction.objectStore("logs").get("current")
    request.onsuccess = () => {
      dispatch(setCurrentLogInfo(request.result))
      dispatch(setSettingsYear({ year: request.result.year }))
    }
    request.onerror = (event) => {
      console.error("IndexedDB Error", event, transaction)
    }
  })
}

export const clearCurrentLog = () => (dispatch) => {
  return new Promise((resolve, reject) => {
    logDB().then((db) => {
      const transaction = db.transaction("logs", "readwrite")
      const request = transaction.objectStore("logs").put({ key: "current" })
      request.onsuccess = () => {
        dispatch(
          setCurrentLogInfo({ qsos: undefined, ourCalls: undefined, yearQSOs: undefined, entityGroups: undefined })
        )
        resolve()
      }
      request.onerror = (event) => {
        console.error("IndexedDB Error", event, transaction)
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

export const selectEntityGroups = (state) => {
  return state?.log?.entityGroups ?? {}
}

export const selectOurCalls = (state) => {
  return state?.log?.ourCalls ?? {}
}

export default logSlice.reducer
