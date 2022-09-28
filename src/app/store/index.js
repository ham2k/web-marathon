import { combineReducers, configureStore } from "@reduxjs/toolkit"
import { persistStore, persistReducer } from "redux-persist"
import localforage from "localforage"

import settingsReducer from "./settings"

const rootReducer = combineReducers({
  settings: settingsReducer,
})

const persistConfig = {
  key: "root",
  storage: localforage,
  whitelist: ["settings"],
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
