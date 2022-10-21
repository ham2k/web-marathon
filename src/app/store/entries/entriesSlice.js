import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  entities: {},
  zones: {},
}

export const entriesSlice = createSlice({
  name: "entries",

  initialState,

  reducers: {
    setEntryForEntity: (state, action) => {
      state.entities[action.payload.prefix] = action.payload.key
    },
    setEntryForZone: (state, action) => {
      state.zones[action.payload.zone] = action.payload.key
    },
  },
})

export const { setEntryForEntity, setEntryForZone } = entriesSlice.actions

export const selectEntityEntries = (state) => {
  return state?.entries?.entities || {}
}

export const selectZoneEntries = (state) => {
  return state?.entries?.zones || {}
}

export default entriesSlice.reducer
