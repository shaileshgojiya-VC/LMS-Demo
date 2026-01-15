// React hooks for API data fetching
// Provides loading states, error handling, and data management

import { useState, useEffect } from "react"
import { api, StandardResponse, Student, Group, Theme } from "../api"

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
export function useStudents(
  skip?: number,
  limit?: number,
  search?: string,
  course_id?: number,
  status?: string
) {
  return useApi(
    () => api.students.getAll(skip, limit, search, course_id, status),
    [skip, limit, search, course_id, status]
  )
}

export function useCourses(skip?: number, limit?: number) {
  return useApi(
    () => api.courses.getAll(skip, limit),
    [skip, limit]
  )
}

export function useCoursesList(
  page?: number,
  size?: number,
  orderBy?: string,
  groupId?: number
) {
  return useApi(
    () => api.courses.getList(page, size, orderBy, groupId),
    [page, size, orderBy, groupId]
  )
}

export function useCredentials() {
  return useApi(() => api.credentials.getAll(), [])
}

export function useCourseCredentials(
  course_id?: number,
  course_name?: string,
  credential_status?: string,
  page?: number,
  size?: number
) {
  return useApi(
    () => {
      if (!course_id || !course_name) {
        const emptyResponse: StandardResponse<{ students: Student[]; total: number; course_id: number; course_name: string }> = {
          status: "success",
          data: { students: [], total: 0, course_id: 0, course_name: "" },
          message: "No course selected",
        }
        return Promise.resolve(emptyResponse)
      }
      // issuer_id is hardcoded to 15 in backend
      return api.credentials.getCourseCredentials(course_id, course_name, credential_status, page, size)
    },
    [course_id, course_name, credential_status, page, size]
  )
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

export function useCurrentUser() {
  return useApi(() => api.auth.getCurrentUser(), [])
}

// Placeholder hooks for groups and themes - can be extended when backend endpoints are available
export function useGroups() {
  // For now, return empty array or mock data
  // TODO: Implement actual API call when endpoint is available
  return useApi(
    async () => {
      // Return empty array for now - groups can be fetched from EveryCred API directly if needed
      return [] as Group[]
    },
    []
  )
}

export function useThemes() {
  // For now, return default theme
  // TODO: Implement actual API call when endpoint is available
  return useApi(
    async () => {
      // Return default theme - themes can be fetched from EveryCred API directly if needed
      return [
        {
          id: 1,
          theme_name: "theme_1",
          theme_type: "DEFAULT",
          theme_unique_id: "default",
          is_default: true,
        } as Theme,
      ]
    },
    []
  )
}

