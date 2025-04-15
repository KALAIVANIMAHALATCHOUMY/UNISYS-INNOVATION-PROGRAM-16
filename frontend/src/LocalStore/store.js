import { configureStore } from '@reduxjs/toolkit'
import enterpriseAgents  from './allSlice'

import storage from "redux-persist/lib/storage"; // Defaults to localStorage for web
import { persistReducer, persistStore } from "redux-persist";


const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, enterpriseAgents);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);