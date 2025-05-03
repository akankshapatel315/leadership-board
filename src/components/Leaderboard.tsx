"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Trophy, Medal, Award, ChevronDown, RefreshCw, Search, Sparkles, Sun } from "lucide-react"
import { useGetLeaderboardQuery, useRecalculateLeaderboardMutation } from "../store/api"

type TimeFilter = "day" | "month" | "year"

const Leaderboard: React.FC = () => {
  // Pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Filter state
  const [userId, setUserId] = useState("")
  const [debouncedUserId, setDebouncedUserId] = useState("")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("day")
  const [showTimeFilterOptions, setShowTimeFilterOptions] = useState(false)

  // Debounce userId input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserId(userId)
    }, 500)

    return () => clearTimeout(timer)
  }, [userId])

  const {
    data: leaderboardData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetLeaderboardQuery({
    page,
    limit,
    userId: debouncedUserId || undefined,
    timeFilter,
  })

  const [recalculate, { isLoading: isRecalculating }] = useRecalculateLeaderboardMutation()

  const displayUsers = leaderboardData?.data?.entries || []
  const loading = isLoading || isFetching || isRecalculating

  // Handle pagination
  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (leaderboardData && page < leaderboardData.data.pagination.pages) {
      setPage(page + 1)
    }
  }

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value)
  }

  const handleTimeFilterChange = (filter: TimeFilter) => {
    setTimeFilter(filter)
    setShowTimeFilterOptions(false)
    // Reset to first page when changing filters
    setPage(1)
  }

  const handleRecalculate = async () => {
    try {
      await recalculate().unwrap()
      // Refetch the leaderboard data after recalculation
      refetch()
    } catch (error) {
      console.error("Failed to recalculate leaderboard:", error)
    }
  }

  const getTimeFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case "day":
        return "Today"
      case "month":
        return "This Month"
      case "year":
        return "This Year"
      default:
        return "Today"
    }
  }

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center text-yellow-500">
            <Trophy className="h-5 w-5 mr-1" />
            <span className="font-bold">#{rank}</span>
          </div>
        )
      case 2:
        return (
          <div className="flex items-center text-gray-400">
            <Medal className="h-5 w-5 mr-1" />
            <span className="font-bold">#{rank}</span>
          </div>
        )
      case 3:
        return (
          <div className="flex items-center text-amber-700">
            <Award className="h-5 w-5 mr-1" />
            <span className="font-bold">#{rank}</span>
          </div>
        )
      default:
        return <span className="font-medium">#{rank}</span>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-white to-amber-50 text-slate-800 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-100 to-sky-100 backdrop-blur-sm border-b border-amber-200 py-4 px-6 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-300 blur-md opacity-30"></div>
              <Trophy className="h-7 w-7 text-amber-500 relative z-10" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-500 to-sky-500 bg-clip-text text-transparent">
              Sunshine Leaderboard
            </h1>
          </div>
          <button
            onClick={handleRecalculate}
            className="bg-gradient-to-r from-amber-400 to-sky-400 hover:from-amber-500 hover:to-sky-500 text-white font-medium py-2 px-4 rounded-md flex items-center text-sm transition-all shadow-md hover:shadow-amber-200"
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRecalculating ? "animate-spin" : ""}`} />
            Recalculate
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sky-500" />
                <input
                  id="userId"
                  type="text"
                  value={userId}
                  onChange={handleUserIdChange}
                  className="bg-white/80 border border-amber-200 rounded-md py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-2 focus:ring-sky-300/50 transition-all text-slate-800 placeholder-slate-400 backdrop-blur-sm shadow-sm"
                  placeholder="Search by User ID"
                />
              </div>
            </div>
            <div className="relative min-w-[180px]">
              <button
                onClick={() => setShowTimeFilterOptions(!showTimeFilterOptions)}
                className="flex items-center justify-between w-full py-2 px-4 bg-white/80 border border-amber-200 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-300/50 transition-all backdrop-blur-sm shadow-sm"
              >
                <span>{getTimeFilterLabel(timeFilter)}</span>
                <ChevronDown className="h-4 w-4 text-sky-500" />
              </button>

              {showTimeFilterOptions && (
                <div className="absolute w-full mt-1 bg-white/90 border border-amber-200 rounded-md shadow-lg z-10 backdrop-blur-sm">
                  <ul className="py-1">
                    <li
                      className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-sm"
                      onClick={() => handleTimeFilterChange("day")}
                    >
                      Today
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-sm"
                      onClick={() => handleTimeFilterChange("month")}
                    >
                      This Month
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-sm"
                      onClick={() => handleTimeFilterChange("year")}
                    >
                      This Year
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">Failed to load leaderboard data. Please try again later.</span>
              <button
                onClick={() => refetch()}
                className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-1 px-3 rounded text-sm"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-md rounded-lg overflow-hidden border border-amber-200 shadow-lg">
              <div className="grid grid-cols-4 gap-4 p-4 text-sm text-slate-600 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-sky-50">
                <div>ID</div>
                <div>Name</div>
                <div>Points</div>
                <div>Rank</div>
              </div>

              <div className="divide-y divide-amber-100">
                {displayUsers.length > 0 ? (
                  displayUsers.map((user:any) => (
                    <div
                      key={user.userId}
                      className={`grid grid-cols-4 gap-4 p-4 hover:bg-sky-50 transition-colors ${
                        user.rank === 1
                          ? "bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-400"
                          : user.rank === 2
                            ? "bg-gradient-to-r from-sky-50 to-sky-100/50 border-l-2 border-sky-400"
                            : user.rank === 3
                              ? "bg-gradient-to-r from-purple-50 to-purple-100/50 border-l-2 border-purple-400"
                              : ""
                      }`}
                    >
                      <div className="text-slate-500">{user.userId}</div>
                      <div className="font-medium text-slate-800">{user.fullName}</div>
                      <div className="font-semibold text-slate-900">{user.totalPoints}</div>
                      <div>{getRankDisplay(user.rank)}</div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    {userId
                      ? "No users found matching your search criteria"
                      : "No users found for the selected time period"}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pagination controls */}
          {!loading && !error && leaderboardData && displayUsers.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">{Math.min(page * limit, leaderboardData.data.pagination.total)}</span> of{" "}
                <span className="font-medium">{leaderboardData.data.pagination.total}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={page >= leaderboardData.data.pagination.pages}
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Decorative elements */}
      <div className="fixed top-20 right-10 opacity-30 pointer-events-none">
        <Sparkles className="h-24 w-24 text-amber-400" />
      </div>
      <div className="fixed bottom-10 left-10 opacity-20 pointer-events-none">
        <Sun className="h-32 w-32 text-amber-300" />
      </div>
    </div>
  )
}

export default Leaderboard
