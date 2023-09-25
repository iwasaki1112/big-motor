import { configureStore } from "@reduxjs/toolkit";
import scoreReducer from "./features/scoreSlice"

export const store = configureStore({
  reducer: {
    scoreReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch