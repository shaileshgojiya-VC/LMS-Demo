// EveryCRED Service Layer
// Abstracted EveryCRED API integration for easy switching between mock and production

export interface CredentialPayload {
  student_name: string
  degree: string
  program: string
  institution: string
  issue_date: string
  student_email?: string
  metadata?: Record<string, unknown>
}

export interface CredentialResponse {
  credential_id: string
  verification_url: string
  status: "issued" | "pending" | "revoked"
  issued_at: string
}

export interface VerificationResult {
  valid: boolean
  credential_id: string
  recipient_name: string
  credential_type: string
  institution: string
  issue_date: string
  verified_at: string
}

class EveryCREDService {
  private apiUrl: string
  private apiToken: string
  private mockMode: boolean

  constructor() {
    this.apiUrl = process.env.EVERYCRED_API_URL || "https://api.everycred.com/v1"
    this.apiToken = process.env.EVERYCRED_API_TOKEN || ""
    this.mockMode = !process.env.EVERYCRED_API_TOKEN || process.env.EVERYCRED_MOCK_MODE === "true"
  }

  async issueCredential(payload: CredentialPayload): Promise<CredentialResponse> {
    if (this.mockMode) {
      return this.mockIssueCredential(payload)
    }

    const response = await fetch(`${this.apiUrl}/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify({
        recipient: {
          name: payload.student_name,
          email: payload.student_email,
        },
        credential: {
          type: payload.degree,
          program: payload.program,
          institution: payload.institution,
          issue_date: payload.issue_date,
        },
        metadata: payload.metadata,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to issue credential")
    }

    return response.json()
  }

  async verifyCredential(credentialId: string): Promise<VerificationResult> {
    if (this.mockMode) {
      return this.mockVerifyCredential(credentialId)
    }

    const response = await fetch(`${this.apiUrl}/credentials/${credentialId}/verify`, {
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Credential verification failed")
    }

    return response.json()
  }

  async revokeCredential(credentialId: string, reason: string): Promise<void> {
    if (this.mockMode) {
      console.log(`[Mock] Revoking credential: ${credentialId}, reason: ${reason}`)
      return
    }

    const response = await fetch(`${this.apiUrl}/credentials/${credentialId}/revoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiToken}`,
      },
      body: JSON.stringify({ reason }),
    })

    if (!response.ok) {
      throw new Error("Failed to revoke credential")
    }
  }

  // Mock implementations for demo mode
  private async mockIssueCredential(payload: CredentialPayload): Promise<CredentialResponse> {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    const credentialId = `EC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    return {
      credential_id: credentialId,
      verification_url: `https://verify.everycred.com/${credentialId}`,
      status: "issued",
      issued_at: new Date().toISOString(),
    }
  }

  private async mockVerifyCredential(credentialId: string): Promise<VerificationResult> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      valid: true,
      credential_id: credentialId,
      recipient_name: "Demo Student",
      credential_type: "Bachelor of Technology",
      institution: "Demo University",
      issue_date: new Date().toISOString().split("T")[0],
      verified_at: new Date().toISOString(),
    }
  }
}

// Export singleton instance
export const everycred = new EveryCREDService()
