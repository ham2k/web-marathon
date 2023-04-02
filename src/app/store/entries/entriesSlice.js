import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  selections: {},
  calls: undefined
}

export const entriesSlice = createSlice({
  name: 'entries',

  initialState,

  reducers: {
    resetSelections: (state, action) => {
      state.selections = {}
      state.calls = undefined
    },
    setSelection: (state, action) => {
      state.selections = state.selections ?? {}
      state.selections[action.payload.prefix ?? action.payload.zone] = action.payload.key
    },
    setCurrentLogCalls: (state, action) => {
      state.calls = action.payload
    }
  }
})

export const { resetSelections, setSelection, setCurrentLogCalls } = entriesSlice.actions

export const selectEntrySelections = (state) => {
  return state?.entries?.selections ?? {}
}

export const selectOurCalls = (state) => {
  return state?.entries?.calls ?? {}
}

export default entriesSlice.reducer
