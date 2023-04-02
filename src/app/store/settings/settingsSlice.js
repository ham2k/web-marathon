import { createSlice } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'
// import { REHYDRATE } from "redux-persist"
import guessCurrentYear from '../../tools/guessCurrentYear'

const initialState = {
  year: guessCurrentYear()
}

export const settingsSlice = createSlice({
  name: 'settings',

  initialState,

  reducers: {
    setSettingsYear: (state, action) => {
      if (!state) return { year: guessCurrentYear() }
      state.year = action.payload.year ?? guessCurrentYear()
    },

    setQrzKey: (state, action) => {
      state.qrzKey = action.payload.qrzKey
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(REHYDRATE, (state, action) => {
        const settings = action.payload?.settings ?? initialState

        return { ...state, ...settings, year: guessCurrentYear() }
      })
      .addDefaultCase((state, action) => {
        return null
      })
  }
})

export const { setSettingsYear, setQrzKey } = settingsSlice.actions

export const selectSettings = (state) => {
  return state?.settings
}

export const selectCurrentYear = (state) => {
  return state?.settings?.year ?? guessCurrentYear()
}

export const selectQrzKey = (state) => {
  return state?.settings?.qrzKey
}

export default settingsSlice.reducer
