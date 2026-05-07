export interface EveryCREDAuthUser {
  id: number
  uuid?: string
  client_id?: string
  name?: string
  full_name?: string
  email?: string
  profile_image?: string | null
  role_type?: string
  is_issuer?: boolean
  is_subject?: boolean
  activated_issuer_profile_id?: number
  [key: string]: unknown
}

export interface EveryCREDUserConfig {
  id: number
  user_id: number
  client_id?: string
  verifier_url?: string
  logo_image?: string
  theme?: string
  email_notification?: boolean
  sms_notification?: boolean
  language?: string
  time_zone?: string
  [key: string]: unknown
}

export interface EveryCREDRolePermissions {
  user_id: number
  role_type?: string
  resources_permissions?: unknown
  role_permissions?: unknown
  [key: string]: unknown
}

class EveryCREDUserService {
  private readonly BASE_URL = "https://demo-dcs-api-us.everycred.com/v1"

  private getAccessToken(): string {
    if (typeof window === "undefined") {
      throw new Error("Authentication is only available in the browser.")
    }

    const stored = localStorage.getItem("lms_auth_tokens")
    if (!stored) {
      throw new Error("No login token found. Please login again.")
    }

    try {
      const tokens = JSON.parse(stored)
      const token = tokens?.access_token
      if (!token) {
        throw new Error("Access token is missing. Please login again.")
      }
      return String(token)
    } catch {
      throw new Error("Invalid login token. Please login again.")
    }
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = this.getAccessToken()
    const response = await fetch(`${this.BASE_URL}${path}`, {
      ...init,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    })

    const responseText = await response.text().catch(() => "")
    if (!response.ok) {
      let message = responseText || `Request failed with status ${response.status}`
      try {
        const parsed = JSON.parse(responseText)
        message = parsed?.detail || parsed?.message || message
      } catch {
        // keep message as-is
      }
      throw new Error(message)
    }

    if (!responseText) {
      return {} as T
    }

    try {
      return JSON.parse(responseText) as T
    } catch {
      return {} as T
    }
  }

  async getAuthUser(): Promise<EveryCREDAuthUser | null> {
    const payload = await this.request<any>("/auth/user")
    return (payload?.data ?? payload?.user ?? null) as EveryCREDAuthUser | null
  }

  async getUserConfig(): Promise<EveryCREDUserConfig | null> {
    const payload = await this.request<any>("/user/config")
    return (payload?.data ?? payload ?? null) as EveryCREDUserConfig | null
  }

  async getRolePermissions(): Promise<EveryCREDRolePermissions | null> {
    const payload = await this.request<any>("/auth/role-permissions")
    return (payload?.data ?? payload ?? null) as EveryCREDRolePermissions | null
  }
}

export const everycredUserService = new EveryCREDUserService()

