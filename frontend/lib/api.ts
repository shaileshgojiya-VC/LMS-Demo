// API Service Layer
// Defines all API endpoints and data types for backend integration

import { apiClient } from "./api-client"

// ==================== Types ====================

export interface Student {
  id: number
  name: string
  email: string
  program?: string | null
  status?: "active" | "inactive" | "completed" | "suspended" | null
  course_id?: number | null
  enrollment_date?: string | null
  completion_date?: string | null
  created_at: string
  updated_at: string
}

export interface Course {
  id: number
  name: string
  description?: string | null
  instructor?: string | null
  students?: number | null
  duration?: number | null
  modules?: number | null
  status?: "active" | "inactive" | "completed" | "upcoming" | "ongoing" | "cancelled" | null
  created_at: string
  updated_at: string
}

export interface Credential {
  id: string
  credential_id: string
  credential_unique_id?: string
  student_id?: string
  student_name?: string
  student?: string
  student_email?: string
  degree: string
  program: string
  institution?: string
  issue_date?: string
  date?: string
  verification_url?: string
  status: "issued" | "pending" | "revoked"
  issued_at?: string
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
  student_name: string
  student_email: string
  degree: string
  program: string
  institution: string
  issue_date: string
  completion_date?: string
  course_id?: number
  enrollment_date?: string
}

export interface CredentialIssueResponse {
  credential_id: string
  verification_url: string
  status: "issued" | "pending"
  issued_at: string
}

// ==================== Subject Types ====================

export interface SubjectField {
  name: string
  title: string
  ftype: "STRING" | "EMAIL" | "FLOAT" | "DATE" | "INTEGER" | "BOOLEAN"
  is_required?: boolean
  is_mask?: boolean
  is_preview?: boolean
  is_default?: boolean
  description?: string
  hint_text?: string
  sample?: string
  error_message?: string
  pattern?: string
}

export interface CredFieldCreateRequest {
  name: string
  title: string
  ftype: "STRING" | "EMAIL" | "FLOAT" | "DATE" | "INTEGER" | "BOOLEAN"
  pattern?: string | null
  value?: string | null
  hint_text?: string | null
  description?: string | null
  sample?: string | null
  error_message?: string | null
  is_required?: boolean
  is_preview?: boolean
  is_mask?: boolean
}

export interface BulkCredFieldCreateRequest {
  fields_list: CredFieldCreateRequest[]
}

export interface CredFieldResponse {
  id: number
  name: string
  title: string
  ftype: string
  pattern?: string | null
  value?: string | null
  hint_text?: string | null
  description?: string | null
  sample?: string | null
  error_message?: string | null
  is_required: boolean
  is_preview: boolean
  is_mask: boolean
  created_at?: string
  updated_at?: string
}

export interface FieldEditPolicy {
  field_key: string
  is_editable: boolean
}

export interface SubjectCreateRequest {
  name: string
  title: string
  description?: string
  logo?: string
  group_id: number
  theme_id?: number
  template_id?: number | null
  subject_field_ids?: number[]  // Preferred: list of credential field IDs
  subject_fields?: SubjectField[]  // Legacy: full field definitions
  field_edit_policies?: FieldEditPolicy[]
}

export interface Group {
  id: number
  name: string
  user_id?: number
  issuer_id?: number
  created_at?: string
  updated_at?: string
}

export interface Theme {
  id: number
  user_id?: number
  theme_name: string
  theme_type: string
  theme_unique_id: string
  theme_img_path?: string
  theme_path?: string
  is_default?: boolean
  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

export interface SubjectResponse {
  id: number
  uuid: string
  service_subject_id?: number
  user_id?: number
  template_id?: number | null
  theme_id: number
  title: string
  name: string
  description?: string
  logo?: string
  status_type?: string
  did?: string
  profile_link?: string
  active_at?: string | null
  inactive_at?: string | null
  created_at: string
  updated_at: string
  templates?: any
  themes?: Theme
  groups?: Group[]
  badges?: any[]
  subject_fields?: SubjectField[]
  field_edit_policies?: FieldEditPolicy[]
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
    getAll: async (
      skip?: number,
      limit?: number,
      search?: string,
      course_id?: number,
      status?: string
    ): Promise<Student[]> => {
      const params = new URLSearchParams()
      if (skip !== undefined) params.append("skip", skip.toString())
      if (limit !== undefined) params.append("limit", limit.toString())
      if (search) params.append("search", search)
      if (course_id !== undefined) params.append("course_id", course_id.toString())
      if (status) params.append("status", status)
      const queryString = params.toString()
      const endpoint = `/v1/student${queryString ? `?${queryString}` : ""}`
      const response = await apiClient.get<StandardResponse<Student[]>>(endpoint)
      return response.data
    },

    getById: async (id: number): Promise<Student> => {
      const response = await apiClient.get<StandardResponse<Student>>(`/v1/student/${id}`)
      return response.data
    },

    create: async (student: Omit<Student, "id" | "created_at" | "updated_at">): Promise<Student> => {
      const response = await apiClient.post<StandardResponse<Student>>("/v1/student", student)
      return response.data
    },

    update: async (id: number, student: Partial<Omit<Student, "id" | "created_at" | "updated_at">>): Promise<Student> => {
      const response = await apiClient.put<StandardResponse<Student>>(`/v1/student/${id}`, student)
      return response.data
    },

    delete: async (id: number): Promise<void> => {
      await apiClient.delete<StandardResponse<null>>(`/v1/student/${id}`)
    },
  },

  // Courses
  courses: {
    getAll: async (skip?: number, limit?: number): Promise<Course[]> => {
      const params = new URLSearchParams()
      if (skip !== undefined) params.append("skip", skip.toString())
      if (limit !== undefined) params.append("limit", limit.toString())
      const queryString = params.toString()
      const endpoint = `/v1/course${queryString ? `?${queryString}` : ""}`
      const response = await apiClient.get<StandardResponse<Course[]>>(endpoint)
      return response.data
    },

    getList: async (
      page?: number,
      size?: number,
      orderBy?: string,
      groupId?: number
    ): Promise<StandardResponse<{ list: Course[]; total: number; pages: number; size: number | null; page: number }>> => {
      const params = new URLSearchParams()
      if (page !== undefined) params.append("page", page.toString())
      if (size !== undefined) params.append("size", size.toString())
      if (orderBy) params.append("order_by", orderBy)
      if (groupId !== undefined) params.append("group_id", groupId.toString())
      const queryString = params.toString()
      const endpoint = `/v1/course/list${queryString ? `?${queryString}` : ""}`
      return apiClient.get<StandardResponse<{ list: Course[]; total: number; pages: number; size: number | null; page: number }>>(endpoint)
    },

    getById: async (id: number): Promise<Course> => {
      const response = await apiClient.get<StandardResponse<Course>>(`/v1/course/${id}`)
      return response.data
    },

    create: async (course: Omit<Course, "id" | "created_at" | "updated_at">): Promise<Course> => {
      const response = await apiClient.post<StandardResponse<Course>>("/v1/course", course)
      return response.data
    },

    update: async (id: number, course: Partial<Omit<Course, "id" | "created_at" | "updated_at">>): Promise<Course> => {
      const response = await apiClient.put<StandardResponse<Course>>(`/v1/course/${id}`, course)
      return response.data
    },

    delete: async (id: number): Promise<void> => {
      await apiClient.delete<StandardResponse<null>>(`/v1/course/${id}`)
    },
  },

  // Credentials
  credentials: {
    getAll: async (): Promise<Credential[]> => {
      return apiClient.get<Credential[]>("/credentials")
    },

    getList: async (
      page?: number,
      size?: number,
      credential_status?: string,
      issuer_id?: number
    ): Promise<StandardResponse<{ credentials: Credential[]; total: number; page: number; size: number }>> => {
      const params = new URLSearchParams()
      if (page !== undefined) params.append("page", page.toString())
      if (size !== undefined) params.append("size", size.toString())
      if (credential_status) params.append("credential_status", credential_status)
      if (issuer_id !== undefined) params.append("issuer_id", issuer_id.toString())
      const queryString = params.toString()
      const endpoint = `/v1/credentials/list${queryString ? `?${queryString}` : ""}`
      return apiClient.get<StandardResponse<{ credentials: Credential[]; total: number; page: number; size: number }>>(endpoint)
    },

    getCourseCredentials: async (
      course_id: number,
      course_name: string,
      credential_status?: string,
      page?: number,
      size?: number
    ): Promise<StandardResponse<{ students: Student[]; total: number; course_id: number; course_name: string }>> => {
      const params = new URLSearchParams()
      params.append("course_name", course_name)
      if (credential_status) params.append("credential_status", credential_status)
      if (page !== undefined) params.append("page", page.toString())
      if (size !== undefined) params.append("size", size.toString())
      const queryString = params.toString()
      const endpoint = `/v1/credentials/course/${course_id}${queryString ? `?${queryString}` : ""}`
      return apiClient.get<StandardResponse<{ students: Student[]; total: number; course_id: number; course_name: string }>>(endpoint)
    },

    createSubject: async (request: SubjectCreateRequest): Promise<SubjectResponse> => {
      const response = await apiClient.post<StandardResponse<SubjectResponse>>(
        "/v1/credentials/subjects",
        request
      )
      // Extract data from StandardResponse format
      if (response && response.data) {
        return response.data
      }
      return response as unknown as SubjectResponse
    },

    createCredFields: async (request: BulkCredFieldCreateRequest): Promise<StandardResponse<{ fields: any; field_ids: number[] }>> => {
      return apiClient.post<StandardResponse<{ fields: any; field_ids: number[] }>>(
        "/v1/credentials/fields",
        request
      )
    },

    // Create a single credential field
    createSingleField: async (request: CredFieldCreateRequest): Promise<StandardResponse<CredFieldResponse>> => {
      return apiClient.post<StandardResponse<CredFieldResponse>>(
        "/v1/credentials/field",
        request
      )
    },

    updateCredField: async (fieldId: number, request: Partial<CredFieldCreateRequest>): Promise<CredFieldResponse> => {
      const response = await apiClient.put<StandardResponse<CredFieldResponse>>(
        `/v1/credentials/fields/${fieldId}`,
        request
      )
      if (response && response.data) {
        return response.data
      }
      return response as unknown as CredFieldResponse
    },

    deleteCredField: async (fieldId: number): Promise<void> => {
      await apiClient.delete<StandardResponse<null>>(`/v1/credentials/fields/${fieldId}`)
    },

    listCredFields: async (
      subject_uuid?: string,
      search?: string,
      page?: number,
      size?: number
    ): Promise<StandardResponse<{ list: CredFieldResponse[]; total: number; page: number; size: number }>> => {
      const params = new URLSearchParams()
      if (subject_uuid) params.append("subject_uuid", subject_uuid)
      if (search) params.append("search", search)
      if (page !== undefined) params.append("page", page.toString())
      if (size !== undefined) params.append("size", size.toString())
      const queryString = params.toString()
      const endpoint = `/v1/credentials/fields${queryString ? `?${queryString}` : ""}`
      return apiClient.get<StandardResponse<{ list: CredFieldResponse[]; total: number; page: number; size: number }>>(endpoint)
    },

    getGroupFields: async (
      search?: string
    ): Promise<StandardResponse<{ list: CredFieldResponse[]; total: number }>> => {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      const queryString = params.toString()
      const endpoint = `/v1/credentials/group-fields${queryString ? `?${queryString}` : ""}`
      return apiClient.get<StandardResponse<{ list: CredFieldResponse[]; total: number }>>(endpoint)
    },

    getById: async (id: string): Promise<Credential> => {
      return apiClient.get<Credential>(`/credentials/${id}`)
    },

    issue: async (request: CredentialIssueRequest): Promise<CredentialIssueResponse> => {
      const response = await apiClient.post<StandardResponse<CredentialIssueResponse>>(
        "/v1/credentials/issue",
        request
      )
      // Extract data from StandardResponse format
      if (response && response.data) {
        return response.data
      }
      return response as unknown as CredentialIssueResponse
    },

    verify: async (credentialId: string): Promise<{ valid: boolean; data?: unknown }> => {
      const response = await apiClient.get<StandardResponse<{ valid: boolean; data?: unknown }>>(
        `/v1/credentials/verify/${credentialId}`
      )
      if (response && response.data) {
        return response.data
      }
      return response as unknown as { valid: boolean; data?: unknown }
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

    getCurrentUser: async (): Promise<AuthUser> => {
      const response = await apiClient.get<StandardResponse<AuthUser>>(
        "/v1/auth/me"
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

