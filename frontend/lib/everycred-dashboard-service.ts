import { getEveryCREDConfig } from "./everycred-config"

export interface EveryCREDDashboardStat {
  key: string
  label: string
  value: number
}

export interface EveryCREDDashboardResponse {
  status: string
  data?: {
    stats?: EveryCREDDashboardStat[]
  }
  message?: string
}

class EveryCREDDashboardService {
  private readonly DASHBOARD_URL = "https://demo-dcs-api-us.everycred.com/v1/dashboard"

  private getAuthToken(): string {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("lms_auth_tokens")
        if (stored) {
          const tokens = JSON.parse(stored)
          if (tokens?.access_token) {
            return String(tokens.access_token)
          }
        }
      } catch (error) {
        console.warn("Failed to read login token from localStorage:", error)
      }
    }

    const config = getEveryCREDConfig()
    if (config.apiToken) {
      return config.apiToken
    }

    throw new Error("EveryCRED API token is missing. Please login again.")
  }

  async getDashboardStats(): Promise<EveryCREDDashboardStat[]> {
    const authToken = this.getAuthToken()

    const response = await fetch(this.DASHBOARD_URL, {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "")
      throw new Error(
        `Failed to fetch dashboard stats (${response.status}). ${errorText || response.statusText}`
      )
    }

    const payload: EveryCREDDashboardResponse = await response.json()
    return payload.data?.stats ?? (payload as any)?.stats ?? []
  }
}

export const everycredDashboardService = new EveryCREDDashboardService()
