import { parseCallsign } from "@ham2k/data/callsigns"
import { annotateFromCountryFile } from "@ham2k/data/country-file"
import { useBuiltinCountryFile } from "@ham2k/data/country-file/builtinData"
import { adifToQSON } from "@ham2k/qson/adif"
import { qsoKey } from "@ham2k/qson/tools"
import { createSlice } from "@reduxjs/toolkit"

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
      state.zoneGroups = action.payload.zoneGroups
    },
  },
})

export const { setCurrentLogInfo } = logSlice.actions

export const loadADIFLog = (data) => (dispatch, getState) => {
  const { settings } = getState()
  const qson = adifToQSON(data)

  const yearStart = new Date(`${settings.year}-01-01T00:00:00Z`).valueOf()
  const yearEnd = new Date(`${settings.year}-12-31T23:59:59Z`).valueOf()

  const yearQSOs = qson.qsos.filter((qso) => qso.startMillis <= yearEnd && qso.endMillis >= yearStart)

  const ourCalls = {}
  yearQSOs.forEach((qso) => {
    ourCalls[qso.our.call] = ourCalls[qso.our.call] || 0 + 1
  })

  yearQSOs.forEach((qso) => {
    qso.our.guess = {}
    qso.their.guess = {}

    parseCallsign(qso.our.call, qso.our.guess)
    annotateFromCountryFile(qso.our.guess, { wae: true })

    parseCallsign(qso.their.call, qso.their.guess)
    annotateFromCountryFile({ dxccCode: qso.their.dxccCode }, { wae: true })
    annotateFromCountryFile(qso.their.guess, { wae: true })

    qso.key = qsoKey(qso)
  })

  const entityGroups = {}
  const zoneGroups = {}
  yearQSOs.forEach((qso) => {
    const prefix = qso.their.entityPrefix || qso.their.guess.entityPrefix
    const zone = qso.their.cqZone || qso.their.guess.cqZone
    entityGroups[prefix] = entityGroups[prefix] || []
    entityGroups[prefix].push(qso)

    zoneGroups[zone] = zoneGroups[zone] || []
    zoneGroups[zone].push(qso)
  })

  dispatch(setCurrentLogInfo({ qson, ourCalls, yearQSOs, entityGroups, zoneGroups }))
}

export const selectCurrentLog = (state) => {
  return state?.log?.qson
}

export const selectYearQSOs = (state) => {
  return state?.log?.yearQSOs
}

export const selectEntityGroups = (state) => {
  return state?.log?.entityGroups
}

export const selectZoneGroups = (state) => {
  return state?.log?.zoneGroups
}

export default logSlice.reducer
