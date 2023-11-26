import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import localforage from 'localforage'

import settingsReducer from './settings'
import logReducer from './log'
import entriesReducer from './entries'

const rootReducer = combineReducers({
  settings: settingsReducer,
  log: logReducer,
  entries: entriesReducer
})

const persistConfig = {
  key: 'root',
  storage: localforage,
  whitelist: ['settings', 'entries'] // Do not persist "log", as it is too large
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const reduxDevtoolsActionSanitizer = (action) => {
  if (action.type === 'log/setCurrentLogInfo' && action?.payload?.yearQSOs) {
    return {
      ...action,
      payload: {
        ...action.payload,
        qsos: `<<${action.payload.qsos?.length || 'no'} qsos>>`,
        yearQSOs: `<<${action.payload.yearQSOs?.length || 'no'} qsos>>`
      }
    }
  } else {
    return action
  }
}

const reduxDevtoolsStateSanitizer = (state) => {
  return {
    ...state,
    log: {
      ...state.log,
      qsos: `<<${state?.log?.qsos?.length || 'no'} qsos>>`,
      yearQSOs: `<<${state?.log?.yearQSOs?.length || 'no'} qsos>>`
    }
  }
}

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false
    }),
  devTools: {
    actionSanitizer: reduxDevtoolsActionSanitizer,
    stateSanitizer: reduxDevtoolsStateSanitizer
  }
})

export const testStore = configureStore({
  reducer: rootReducer
})

export const persistor = persistStore(store)
