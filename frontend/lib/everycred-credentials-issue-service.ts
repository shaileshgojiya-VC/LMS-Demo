export interface IssueCredentialResult {
  status?: string
  data?: any
  message?: string
}

class EveryCREDCredentialsIssueService {
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

  async issueFromRecord(params: {
    record_id: number
    subject_id: number
    issuer_id: number
    email_to_holder?: boolean
  }): Promise<IssueCredentialResult> {
    const token = this.getAccessToken()
    const qs = new URLSearchParams({
      email_to_holder: String(params.email_to_holder ?? true),
    })
    const url = `${this.BASE_URL}/user/credentials/issue?${qs.toString()}`

    // Matches observed behavior: returns { data: { task_id } }
    // Most consistent payload includes identifiers.
    const payloadCandidates = [
      { records: [{ id: params.record_id }] },
      { records: [params.record_id] },
      { record_id: params.record_id, subject_id: params.subject_id, issuer_id: params.issuer_id },
      { record_id: params.record_id },
      { record_ids: [params.record_id] },
      { id: params.record_id },
    ]

    let lastError: any = null
    for (const body of payloadCandidates) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
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

        return text ? (JSON.parse(text) as IssueCredentialResult) : { status: "success" }
      } catch (e) {
        lastError = e
      }
    }

    throw lastError ?? new Error("Failed to issue certification.")
  }
}

export const everycredCredentialsIssueService = new EveryCREDCredentialsIssueService()

