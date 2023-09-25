import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type InitialState = {
  value: number
}

const initialState = {
  value: 0
} as InitialState

export const score = createSlice({
  name: "score",
  initialState,
  reducers: {
    set: (state, value) => {
      state.value = value.payload
    }
  }
})

export const { set } = score.actions
export default score.reducer