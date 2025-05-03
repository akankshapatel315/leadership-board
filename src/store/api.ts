import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// Define the User type
export interface User {
  userId: string
  fullName: string
  totalPoints: number
  rank: number
  lastActivityDate?: string
}

// Define pagination info interface
interface PaginationInfo {
  total: number
  page: number
  limit: number
  pages: number
}

interface LeaderboardResponse {
  success: boolean
  data: {
    entries: User[]
    pagination: PaginationInfo
  }
}

interface LeaderboardQueryParams {
  page?: number
  limit?: number
  userId?: string
  timeFilter?: 'day' | 'month' | 'year'
}

// Define our API with endpoints
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000",
  }),
  tagTypes: ["Leaderboard"],
  endpoints: (builder) => ({
    getLeaderboard: builder.query<LeaderboardResponse, LeaderboardQueryParams | void>({
      query: (params = { page: 1, limit: 10 }) => {

        const queryParams = new URLSearchParams()

        if (params?.page) {
          queryParams.append("page", params.page.toString())
        }

        if (params?.limit) {
          queryParams.append("limit", params.limit.toString())
        }

        if (params?.userId) {
          queryParams.append("userId", params.userId)
        }
        
        if (params?.timeFilter) {
          queryParams.append("timeFilter", params.timeFilter)
        }

        const queryString = queryParams.toString()
        return `/api/leaderboard${queryString ? `?${queryString}` : ""}`
      },
      providesTags: ["Leaderboard"],
    }),

    // Recalculate leaderboard
    recalculateLeaderboard: builder.mutation<{ success: boolean; message: string }, void>({
      query: () => ({
        url: "/api/leaderboard/recalculate",
        method: "POST",
      }),
      invalidatesTags: ["Leaderboard"],
    }),
    
    getUserById: builder.query<User, string>({
      query: (userId) => `/api/leaderboard/user/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Leaderboard', id: userId }],
    }),
  }),
})

export const { 
  useGetLeaderboardQuery, 
  useRecalculateLeaderboardMutation,
  useGetUserByIdQuery
} = api
