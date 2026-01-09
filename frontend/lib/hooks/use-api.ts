// React hooks for API data fetching
// Provides loading states, error handling, and data management

import { useState, useEffect } from "react"
import { api } from "../api"

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApi<T>(
  fetchFn: () => Promise<T>,
  dependencies: unknown[] = []
): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
      setError(errorMessage)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

// Specific hooks for common data fetching
export function useStudents() {
  return useApi(() => api.students.getAll(), [])
}

export function useCourses() {
  return useApi(() => api.courses.getAll(), [])
}

export function useCredentials() {
  return useApi(() => api.credentials.getAll(), [])
}

export function useDashboardStats() {
  return useApi(() => api.dashboard.getStats(), [])
}

export function useRecentActivity(limit?: number) {
  return useApi(() => api.dashboard.getRecentActivity(limit), [limit])
}

export function useIssuedCredentials(limit?: number) {
  return useApi(() => api.dashboard.getIssuedCredentials(limit), [limit])
}

