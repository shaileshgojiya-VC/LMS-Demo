export interface EveryCREDIssuer {
  id: number
  uuid?: string
  name: string
  email?: string | null
  is_active?: boolean
}

export interface EveryCREDAuthUser {
  id: number
  name?: string
  full_name?: string
  email?: string
  is_active?: boolean
}

class EveryCREDIssuerService {
  private readonly BASE_URL = "https://demo-dcs-api-us.everycred.com/v1"

  private getAuthToken(): string {
    if (typeof window === "undefined") {
      throw new Error("Authentication is only available in the browser.")
    }

    const stored = localStorage.getItem("lms_auth_tokens")
    if (!stored) {
      throw new Error("No login token found. Please login again.")
    }

    try {
      const tokens = JSON.parse(stored)
      if (!tokens?.access_token) {
        throw new Error("Access token is missing. Please login again.")
      }
      return String(tokens.access_token)
    } catch {
      throw new Error("Invalid login token. Please login again.")
    }
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = this.getAuthToken()
    const response = await fetch(`${this.BASE_URL}${path}`, {
      ...init,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init.headers || {}),
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      let message = errorText || `Request failed with status ${response.status}`
      try {
        const parsed = JSON.parse(errorText)
        message = parsed?.detail || parsed?.message || message
      } catch {
        // Keep raw text when response is not JSON.
      }
      throw new Error(message)
    }

    const responseText = await response.text().catch(() => "")
    if (!responseText) {
      return {} as T
    }

    try {
      return JSON.parse(responseText) as T
    } catch {
      return {} as T
    }
  }

  async getCurrentUser(): Promise<EveryCREDAuthUser | null> {
    const payload = await this.request<any>("/auth/user")
    return (payload?.data ?? payload?.user ?? null) as EveryCREDAuthUser | null
  }

  async getIssuers(): Promise<EveryCREDIssuer[]> {
    const payload = await this.request<any>(
      "/user/issuer?type=all&order_by=latest&page=1&size=100"
    )

    const items =
      payload?.data?.list ??
      payload?.data?.issuers ??
      payload?.data?.items ??
      payload?.list ??
      payload?.issuers ??
      []

    if (!Array.isArray(items)) {
      return []
    }

    return items.map((item: any) => ({
      id: Number(item?.id ?? 0),
      uuid: item?.uuid,
      name: String(item?.name ?? "Unknown Issuer"),
      email: item?.email ?? null,
      is_active: Boolean(item?.is_active),
    }))
  }

  async getIssuerById(issuerId: number): Promise<EveryCREDIssuer | null> {
    const payload = await this.request<any>(`/user/issuer/${issuerId}`)
    const issuer = payload?.data ?? payload ?? null
    if (!issuer) return null

    return {
      id: Number(issuer?.id ?? issuerId),
      uuid: issuer?.uuid,
      name: String(issuer?.name ?? "Unknown Issuer"),
      email: issuer?.email ?? null,
      is_active: Boolean(issuer?.is_active),
    }
  }

  async activateIssuer(issuerId: number): Promise<void> {
    const path = `/user/issuer/profile/activate?issuer_id=${issuerId}`
    await this.request(path, {
      method: "PUT",
      // API validation requires `status`
      body: JSON.stringify({ status: "activated" }),
    })
  }
}

export const everycredIssuerService = new EveryCREDIssuerService()
