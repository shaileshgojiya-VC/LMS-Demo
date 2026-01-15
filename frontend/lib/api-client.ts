// Centralized API Client for Backend Integration
// Handles all API communication with the backend server

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

interface ApiError {
  message: string
  status?: number
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL || '') {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null

    try {
      const stored = localStorage.getItem("lms_auth_tokens")
      if (!stored) return null
      const tokens = JSON.parse(stored)
      return tokens?.access_token || null
    } catch {
      return null
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    // Get auth token if available
    const token = this.getAuthToken()

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Add authorization header if token exists
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`,
        }))

        // Handle different error formats
        let errorMessage = `Request failed with status ${response.status}`

        // Handle StandardResponse error format
        if (errorData.message && typeof errorData.message === "string") {
          errorMessage = errorData.message
        }
        // Handle FastAPI validation errors (422)
        else if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Pydantic validation errors
            const validationErrors = errorData.detail
              .map((err: any) => {
                const field = err.loc && err.loc.length > 1 ? err.loc[err.loc.length - 1] : "field"
                return `${field}: ${err.msg || "Invalid value"}`
              })
              .join(", ")
            errorMessage = validationErrors || "Validation error"
          } else if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail
          }
        }

        const error: ApiError = {
          message: errorMessage,
          status: response.status,
        }
        throw error
      }

      // Handle empty responses
      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json()
        // Handle StandardResponse format - extract data if present
        if (data && typeof data === "object" && "data" in data && "status" in data && "message" in data) {
          return data as T
        }
        return data
      }

      return {} as T
    } catch (error) {
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        throw {
          message: "Unable to connect to the server. Please check if the backend is running.",
          status: 0,
        } as ApiError
      }
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

export const apiClient = new ApiClient()

