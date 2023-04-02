import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  loading: false,
  error: undefined,
  lastLoaded: undefined,
  cty: {}
}

export const clublogSlice = createSlice({
  name: 'clublog',

  initialState,

  reducers: {
    setClublogLoading: (state, action) => {
      state.cty = {}
      state.error = undefined
      state.loading = action.payload
      state.lastLoaded = undefined
    },
    setClublogError: (state, action) => {
      state.cty = {}
      state.error = action.payload
      state.loading = false
      state.lastLoaded = undefined
    },
    setClublogCtyData: (state, action) => {
      state.cty = action.payload
      state.error = undefined
      state.loading = false
      state.lastLoaded = new Date().valueOf()
    }
  }
})

export const { setClublogLoading, setClublogCtyData } = clublogSlice.actions

export const fetchClublogCtyData = () => (dispatch) => {
  dispatch(setClublogLoading(true))
  dispatch(setClublogLoading(false))
}

export default clublogSlice.reducer
