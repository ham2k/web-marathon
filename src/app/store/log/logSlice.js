import { parseCallsign } from "@ham2k/data/callsigns"
import { annotateFromCountryFile } from "@ham2k/data/country-file"
import { adifToQSON } from "@ham2k/qson/adif"
import { createSlice } from "@reduxjs/toolkit"

const initialState = {}

export const logSlice = createSlice({
  name: "log",

  initialState,

  reducers: {
    setCurrentLog: (state, action) => {
      console.log("reducer")
      state.current = action.payload
    },
  },
})

export const { setCurrentLog } = logSlice.actions

export const loadADIFLog = (data) => (dispatch) => {
  console.log("dispatch")
  const qson = adifToQSON(data)
  console.log("load")
  qson.qsos.forEach((qso) => {
    parseCallsign(qso.our.call, qso.our)
    annotateFromCountryFile(qso.our)
    parseCallsign(qso.their.call, qso.their)
    annotateFromCountryFile(qso.their)
  })
  dispatch(setCurrentLog(qson))
  console.log("done")
}

export const selectCurrentLog = (state) => {
  return state?.log?.current
}

export default logSlice.reducer
