import { createSlice } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'
// import { REHYDRATE } from "redux-persist"
import guessCurrentYear from '../../tools/guessCurrentYear'

const initialState = {
  year: guessCurrentYear(),
  marathonMode: 'regular'
}

export const settingsSlice = createSlice({
  name: 'settings',

  initialState,

  reducers: {
    setSettingsYear: (state, action) => {
      if (!state) return { year: guessCurrentYear(), marathonMode: 'regular' }
      state.year = action.payload.year ?? guessCurrentYear()
    },

    setQrzKey: (state, action) => {
      state.qrzKey = action.payload.qrzKey
    },

    setMarathonMode: (state, action) => {
      state.marathonMode = action.payload ?? 'regular'
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(REHYDRATE, (state, action) => {
        const settings = action.payload?.settings ?? initialState

        return { ...state, ...settings, year: guessCurrentYear() }
      })
      .addDefaultCase((state, action) => {
        return state
      })
  }
})

export const { setSettingsYear, setQrzKey, setMarathonMode } = settingsSlice.actions

export const selectSettings = (state) => {
  return state?.settings
}

export const selectCurrentYear = (state) => {
  return state?.settings?.year ?? guessCurrentYear()
}

export const selectQrzKey = (state) => {
  return state?.settings?.qrzKey
}

export const selectMarathonMode = (state) => {
  return state?.settings?.marathonMode ?? 'regular'
}

export default settingsSlice.reducer
