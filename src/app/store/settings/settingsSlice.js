import { createSlice } from "@reduxjs/toolkit"
import { REHYDRATE } from "redux-persist"

const initialState = {
  year: guessCurrentYear(),
}

export const settingsSlice = createSlice({
  name: "settings",

  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(REHYDRATE, (state, action) => {
        const settings = action.payload?.settings || initialState

        if (!settings.year) settings.year = guessCurrentYear()

        return settings
      })
      .addDefaultCase((state, action) => {})
  },
})

function guessCurrentYear() {
  const today = new Date()
  const month = today.getMonth() + 1

  if (month === 1 || month === 2) {
    return today.getFullYear() - 1
  } else {
    return today.getFullYear()
  }
}

export const selectSettings = (state) => {
  return state?.settings
}

export default settingsSlice.reducer
