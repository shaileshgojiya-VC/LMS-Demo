export interface EveryCREDRecordField {
  id: string
  title: string
  type: string
  is_preview?: boolean
  order?: number
  items?: Array<{ id: string; title: string; is_preview?: boolean; is_disabled?: boolean }>
}

export interface EveryCREDRecordsListResponse {
  status?: string
  data?: {
    total?: number
    pages?: number
    page?: number
    size?: number
    list?: any[]
    headers?: {
      fields?: EveryCREDRecordField[]
    }
  }
  message?: string
}

class EveryCREDRecordsListService {
  private readonly BASE_URL = "https://demo-dcs-api-us.everycred.com/v1"

  private getAccessToken(): string {
    if (typeof window === "undefined") {
      throw new Error("Authentication is only available in the browser.")
    }
    const stored = localStorage.getItem("lms_auth_tokens")
    if (!stored) throw new Error("No login token found. Please login again.")
    try {
      const tokens = JSON.parse(stored)
      if (!tokens?.access_token) throw new Error("Access token missing. Please login again.")
      return String(tokens.access_token)
    } catch {
      throw new Error("Invalid login token. Please login again.")
    }
  }

  async listRecords(params: {
    page?: number
    size?: number
    subject_id?: number
    issuer_id: number
    status_filter?: string
  }): Promise<{
    total: number
    pages: number
    page: number
    size: number
    list: any[]
    fields: EveryCREDRecordField[]
  }> {
    const token = this.getAccessToken()
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      size: String(params.size ?? 10),
      issuer_id: String(params.issuer_id),
    })
    if (params.subject_id !== undefined && params.subject_id !== null) {
      qs.set("subject_id", String(params.subject_id))
    }
    if (params.status_filter) {
      qs.set("status_filter", params.status_filter)
    }
    const url = `${this.BASE_URL}/record?${qs.toString()}`

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const text = await res.text().catch(() => "")
    if (!res.ok) {
      let msg = text || `Request failed with status ${res.status}`
      try {
        const parsed = JSON.parse(text)
        msg = parsed?.detail || parsed?.message || msg
      } catch {}
      throw new Error(msg)
    }

    const payload: EveryCREDRecordsListResponse = text ? JSON.parse(text) : {}
    const list = payload.data?.list ?? []
    const fields = payload.data?.headers?.fields ?? []
    return {
      total: payload.data?.total ?? list.length,
      pages: payload.data?.pages ?? 1,
      page: payload.data?.page ?? (params.page ?? 1),
      size: payload.data?.size ?? (params.size ?? 10),
      list,
      fields,
    }
  }
}

export const everycredRecordsListService = new EveryCREDRecordsListService()

