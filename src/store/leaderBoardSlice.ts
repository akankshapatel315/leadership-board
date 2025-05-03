import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface LeaderboardState {
  sortPeriod: "Day" | "Month" | "Year"
  userId: string
}

const initialState: LeaderboardState = {
  sortPeriod: "Day",
  userId: "",
}

export const leaderboardSlice = createSlice({
  name: "leaderboard",
  initialState,
  reducers: {
    setSortPeriod: (state, action: PayloadAction<"Day" | "Month" | "Year">) => {
      state.sortPeriod = action.payload
    },

    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload
    },
  },
})

export const { setSortPeriod, setUserId } = leaderboardSlice.actions

export default leaderboardSlice.reducer
