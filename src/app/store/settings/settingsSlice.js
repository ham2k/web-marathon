import { createSlice } from "@reduxjs/toolkit"
// import { REHYDRATE } from "redux-persist"
import guessCurrentYear from "../../tools/guessCurrentYear"

const initialState = {
  year: guessCurrentYear(),
}

export const settingsSlice = createSlice({
  name: "settings",

  initialState,

  reducers: {
    setSettingsYear: (state, action) => {
      if (!state) return { year: guessCurrentYear() }
      state.year = action.payload.year ?? guessCurrentYear()
    },
  },

  // extraReducers: (builder) => {
  //   builder
  //     .addCase(REHYDRATE, (state, action) => {
  //       const settings = action.payload?.settings ?? initialState

  //       if (!settings.year) settings.year = guessCurrentYear()

  //       return { ...state, ...settings }
  //     })
  //     .addDefaultCase((state, action) => {
  //       return null
  //     })
  // },
})

export const { setSettingsYear } = settingsSlice.actions

export const selectSettings = (state) => {
  return state?.settings
}

export default settingsSlice.reducer
