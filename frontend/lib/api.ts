// API Service Layer
// Defines all API endpoints and data types for backend integration

import { apiClient } from "./api-client"

// ==================== Types ====================

export interface Student {
  id: string
  name: string
  email: string
  program: string
  status: "active" | "inactive"
  progress: number
  enrollment_date?: string
  completion_date?: string
}

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  students: number
  duration: string
  modules: number
  status: "active" | "upcoming" | "completed"
}

export interface Credential {
  id: string
  credential_id: string
  student_id: string
  student_name: string
  degree: string
  program: string
  institution: string
  issue_date: string
  verification_url?: string
  status: "issued" | "pending" | "revoked"
  issued_at: string
}

export interface DashboardStats {
  total_students: number
  active_courses: number
  credentials_issued: number
  completion_rate: number
  students_change?: number
  courses_change?: number
  credentials_change?: number
  completion_change?: number
}

export interface Activity {
  id: string
  type: "credential" | "enrollment" | "registration" | "completion"
  user: string
  action: string
  detail: string
  time: string
  created_at: string
}

export interface CredentialIssueRequest {
  student_id: string
  student_name: string
  student_email?: string
  degree: string
  program: string
  institution: string
  issue_date: string
  metadata?: Record<string, unknown>
}

export interface CredentialIssueResponse {
  credential_id: string
  verification_url: string
  status: "issued" | "pending"
  issued_at: string
}

// ==================== Auth Types ====================

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  full_name: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface AuthUser {
  id: number
  email: string
  password?: string
  full_name: string
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  user: AuthUser
  tokens: AuthTokens
}

export interface StandardResponse<T> {
  status: "success" | "fail" | "error"
  data: T
  message: string
}

// ==================== API Functions ====================

export const api = {
  // Students
  students: {
    getAll: async (): Promise<Student[]> => {
      return apiClient.get<Student[]>("/students")
    },

    getById: async (id: string): Promise<Student> => {
      return apiClient.get<Student>(`/students/${id}`)
    },

    create: async (student: Omit<Student, "id">): Promise<Student> => {
      return apiClient.post<Student>("/students", student)
    },

    update: async (id: string, student: Partial<Student>): Promise<Student> => {
      return apiClient.put<Student>(`/students/${id}`, student)
    },

    delete: async (id: string): Promise<void> => {
      return apiClient.delete<void>(`/students/${id}`)
    },
  },

  // Courses
  courses: {
    getAll: async (): Promise<Course[]> => {
      return apiClient.get<Course[]>("/courses")
    },

    getById: async (id: string): Promise<Course> => {
      return apiClient.get<Course>(`/courses/${id}`)
    },

    create: async (course: Omit<Course, "id">): Promise<Course> => {
      return apiClient.post<Course>("/courses", course)
    },

    update: async (id: string, course: Partial<Course>): Promise<Course> => {
      return apiClient.put<Course>(`/courses/${id}`, course)
    },

    delete: async (id: string): Promise<void> => {
      return apiClient.delete<void>(`/courses/${id}`)
    },
  },

  // Credentials
  credentials: {
    getAll: async (): Promise<Credential[]> => {
      return apiClient.get<Credential[]>("/credentials")
    },

    getById: async (id: string): Promise<Credential> => {
      return apiClient.get<Credential>(`/credentials/${id}`)
    },

    issue: async (request: CredentialIssueRequest): Promise<CredentialIssueResponse> => {
      return apiClient.post<CredentialIssueResponse>("/credentials/issue", request)
    },

    verify: async (credentialId: string): Promise<{ valid: boolean; data?: unknown }> => {
      return apiClient.get<{ valid: boolean; data?: unknown }>(`/credentials/${credentialId}/verify`)
    },

    revoke: async (credentialId: string, reason?: string): Promise<void> => {
      return apiClient.post<void>(`/credentials/${credentialId}/revoke`, { reason })
    },
  },

  // Dashboard
  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      return apiClient.get<DashboardStats>("/dashboard/stats")
    },

    getRecentActivity: async (limit?: number): Promise<Activity[]> => {
      const params = limit ? `?limit=${limit}` : ""
      return apiClient.get<Activity[]>(`/dashboard/activity${params}`)
    },

    getIssuedCredentials: async (limit?: number): Promise<Credential[]> => {
      const params = limit ? `?limit=${limit}` : ""
      return apiClient.get<Credential[]>(`/dashboard/credentials${params}`)
    },
  },

  // Authentication
  auth: {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<StandardResponse<AuthResponse>>(
        "/v1/auth/login",
        credentials
      )
      return response.data
    },

    register: async (userData: RegisterRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<StandardResponse<AuthResponse>>(
        "/v1/auth/register",
        userData
      )
      return response.data
    },

    refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
      const response = await apiClient.post<StandardResponse<{ tokens: AuthTokens }>>(
        "/v1/auth/refresh",
        { refresh_token: refreshToken }
      )
      return response.data.tokens
    },

    forgetPassword: async (email: string): Promise<void> => {
      await apiClient.post<StandardResponse<null>>(
        "/v1/auth/forget-password",
        { email }
      )
    },

    resetPassword: async (token: string, newPassword: string): Promise<void> => {
      await apiClient.post<StandardResponse<null>>(
        "/v1/auth/reset-password",
        { token, new_password: newPassword }
      )
    },
  },
}

