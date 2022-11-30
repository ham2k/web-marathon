import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import localforage from "localforage"

import settingsReducer from "./settings"
import logReducer from "./log"
import entriesReducer from "./entries"

const rootReducer = combineReducers({
  settings: settingsReducer,
  log: logReducer,
  entries: entriesReducer,
})

const persistConfig = {
  key: "root",
  storage: localforage,
  whitelist: ["settings", "entries"], // Do not persist "log", as it is too large
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
})

export const testStore = configureStore({
  reducer: rootReducer,
})

export const persistor = persistStore(store)
