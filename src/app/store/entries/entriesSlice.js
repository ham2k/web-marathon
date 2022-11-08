import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  selections: {},
}

export const entriesSlice = createSlice({
  name: "entries",

  initialState,

  reducers: {
    resetSelections: (state, action) => {
      state.selections = {}
    },
    setSelection: (state, action) => {
      state.selections = state.selections || {}
      state.selections[action.payload.prefix || action.payload.zone] = action.payload.key
    },
  },
})

export const { setSelection } = entriesSlice.actions

export const selectEntrySelections = (state) => {
  return state?.entries?.selections || {}
}

export default entriesSlice.reducer
