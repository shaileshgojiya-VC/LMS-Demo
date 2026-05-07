export interface EveryCREDSubject {
  id: number
  uuid: string
  issuer_id: number
  title: string
  name: string
  description?: string | null
  logo?: string | null
  status_type?: string
  issued_cred_count?: number
  draft_cred_count?: number
  scheduled_cred_count?: number
  created_at?: string
  updated_at?: string
  [key: string]: unknown
}

export interface EveryCREDSubjectsListResponse {
  status?: string
  data?: {
    total?: number
    pages?: number
    page?: number
    size?: number
    list?: EveryCREDSubject[]
  }
  message?: string
}

class EveryCREDSubjectsService {
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

  async listSubjects(params: {
    page?: number
    size?: number
    search?: string
    order_by?: string
    issuer_id: number
  }): Promise<{ list: EveryCREDSubject[]; total: number; pages: number; page: number; size: number }> {
    const token = this.getAccessToken()
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      size: String(params.size ?? 10),
      search: params.search ?? "",
      order_by: params.order_by ?? "newest",
      issuer_id: String(params.issuer_id),
    })

    const url = `${this.BASE_URL}/subject?${qs.toString()}`
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

    const payload: EveryCREDSubjectsListResponse = text ? JSON.parse(text) : {}
    const list = payload.data?.list ?? []
    return {
      list,
      total: payload.data?.total ?? list.length,
      pages: payload.data?.pages ?? 1,
      page: payload.data?.page ?? (params.page ?? 1),
      size: payload.data?.size ?? (params.size ?? 10),
    }
  }

  async getSubject(subjectId: number): Promise<EveryCREDSubject | null> {
    const token = this.getAccessToken()
    const url = `${this.BASE_URL}/subject/${subjectId}`
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

    const payload = text ? JSON.parse(text) : {}
    return (payload?.data ?? payload ?? null) as EveryCREDSubject | null
  }
}

export const everycredSubjectsService = new EveryCREDSubjectsService()

