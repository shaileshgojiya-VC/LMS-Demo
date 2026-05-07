// EveryCRED Credentials Service
// Fetches credentials list directly from EveryCRED API

import { getEveryCREDConfig, isEveryCREDConfigured, type EveryCREDConfig } from "./everycred-config"

export interface EveryCREDCredential {
  id?: string
  credential_id?: string
  credential_unique_id?: string
  uuid?: string
  candidate_name?: string
  candidate_email?: string
  email?: string
  name?: string
  student?: string
  student_name?: string
  student_email?: string
  degree?: string
  program?: string
  subject_name?: string
  date?: string
  issue_date?: string
  created_at?: string
  issued_at?: string
  verification_url?: string
  status?: string
  record_slug?: Record<string, unknown>
  subject_fields?: {
    name?: string
    email?: string
    program?: string
    [key: string]: unknown
  } | string
  [key: string]: unknown
}

export interface EveryCREDCredentialsResponse {
  status?: string
  status_code?: number
  data?: {
    list?: EveryCREDCredential[]
    credentials?: EveryCREDCredential[]
    items?: EveryCREDCredential[]
    results?: EveryCREDCredential[]
    total?: number
    page?: number
    size?: number
  }
  credentials?: EveryCREDCredential[]
  total?: number
  message?: string
}

export interface FormattedCredential {
  id: string
  credential_id: string
  credential_unique_id?: string
  student: string
  student_email?: string
  degree: string
  program?: string
  date: string
  verification_url?: string
}

export interface CredentialsListResult {
  credentials: FormattedCredential[]
  total: number
  page: number
  size: number
}

class EveryCREDCredentialsService {
  private config: EveryCREDConfig | null = null

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

  /**
   * Get configuration, re-reading from environment variables each time
   * to ensure we have the latest values (important for Next.js hot reload)
   */
  private getConfig(): EveryCREDConfig {
    if (!this.config) {
      this.config = getEveryCREDConfig()
    }
    return this.config
  }

  /**
   * Fetch credentials list from EveryCRED API.
   * 
   * @param page - Page number (default: 1)
   * @param size - Page size (default: 10)
   * @param credentialStatus - Filter by status (default: "issued")
   * @param issuerId - Optional issuer ID override (uses config if not provided)
   * @returns Formatted credentials list
   */
  async getCredentialsList(
    page: number = 1,
    size: number = 10,
    credentialStatus: string = "issued",
    issuerId?: number
  ): Promise<CredentialsListResult> {
    const config = getEveryCREDConfig()
    
    if (!isEveryCREDConfigured(config)) {
      throw new Error("EveryCRED is not properly configured. Please check your environment variables.")
    }

    const accessToken = this.getAccessToken()

    // Build query parameters (issuer is inferred from activated issuer profile)
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      credential_status: credentialStatus,
    })

    // If an issuerId override is explicitly provided, include it.
    if (issuerId !== undefined && issuerId !== null) {
      params.set("issuer_id", String(issuerId))
    }

    // Credentials API lives under demo-dcs-api-us host.
    const baseUrl = "https://demo-dcs-api-us.everycred.com/v1"
    const url = `${baseUrl}/credentials?${params.toString()}`

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      accept: "application/json",
    }

    headers["Authorization"] = `Bearer ${accessToken}`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `EveryCRED API error: ${response.status} ${response.statusText}`
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage += `. ${errorJson.message || errorText}`
          
          // Check if it's an authentication error
          if (response.status === 401) {
            errorMessage = `EveryCRED API authentication failed. Please login again. Error: ${errorJson.message || errorText}`
          }
        } catch {
          errorMessage += `. ${errorText}`
        }
        
        throw new Error(errorMessage)
      }

      const data: EveryCREDCredentialsResponse = await response.json()

      // Extract credentials from response
      const credentials = this.extractCredentials(data)

      // Format credentials for frontend table
      const formattedCredentials = credentials.map((cred) =>
        this.formatCredential(cred)
      )

      // Extract total count
      const total =
        data.data?.total ??
        data.total ??
        formattedCredentials.length

      return {
        credentials: formattedCredentials,
        total,
        page: data.data?.page ?? page,
        size: data.data?.size ?? size,
      }
    } catch (error) {
      console.error("Error fetching credentials from EveryCRED:", error)
      throw error
    }
  }

  /**
   * Extract credentials array from EveryCRED API response.
   */
  private extractCredentials(
    response: EveryCREDCredentialsResponse
  ): EveryCREDCredential[] {
    // Check data.list (most common structure)
    if (response.data?.list && Array.isArray(response.data.list)) {
      return response.data.list
    }

    // Check data.credentials
    if (response.data?.credentials && Array.isArray(response.data.credentials)) {
      return response.data.credentials
    }

    // Check data.items
    if (response.data?.items && Array.isArray(response.data.items)) {
      return response.data.items
    }

    // Check data.results
    if (response.data?.results && Array.isArray(response.data.results)) {
      return response.data.results
    }

    // Check root level credentials
    if (response.credentials && Array.isArray(response.credentials)) {
      return response.credentials
    }

    // Check if data itself is an array
    if (Array.isArray(response.data)) {
      return response.data
    }

    // Return empty array if no credentials found
    console.warn("No credentials found in response structure:", response)
    return []
  }

  /**
   * Format a credential from EveryCRED API to match frontend table format.
   */
  private formatCredential(cred: EveryCREDCredential): FormattedCredential {
    // Extract credential_unique_id (uuid is the key field from EveryCRED API)
    const credentialUniqueId: string | undefined =
      (cred.credential_unique_id as string | undefined) ??
      (cred.uuid as string | undefined) ??
      (cred.unique_id as string | undefined) ??
      (cred.id as string | undefined)

    // Extract credential_id
    const credentialId =
      cred.credential_id ??
      cred.credential_unique_id ??
      cred.uuid ??
      cred.id ??
      ""

    // Extract subject fields
    let subjectFields: Record<string, unknown> = {}
    if (cred.subject_fields) {
      if (typeof cred.subject_fields === "string") {
        try {
          subjectFields = JSON.parse(cred.subject_fields)
        } catch {
          subjectFields = {}
        }
      } else {
        subjectFields = cred.subject_fields
      }
    }

    // Extract name and email from subject_fields or direct fields
    // Priority: candidate_name > subject_fields.name > student_name > student
    const studentName =
      cred.candidate_name ??
      cred.name ??
      (subjectFields.name as string) ??
      cred.student_name ??
      cred.student ??
      ""

    const studentEmail =
      (subjectFields.email as string) ??
      cred.candidate_email ??
      cred.email ??
      cred.student_email ??
      ""

    // Extract program
    const program =
      (subjectFields.program as string) ??
      cred.subject_name ??
      (cred.record_slug?.["training_title"] as string | undefined) ??
      (cred.record_slug?.["subject_name"] as string | undefined) ??
      cred.program ??
      ""

    // Extract degree (default to "Bachelor of Technology" if not found)
    const degree = cred.degree ?? "Bachelor of Technology"

    // Extract and format date
    let issueDate =
      cred.date ??
      cred.issue_date ??
      cred.created_at ??
      cred.issued_at ??
      ""
    if (issueDate && issueDate.includes("T")) {
      issueDate = issueDate.split("T")[0]
    }

    // Construct verification URL
    const verificationUrl = credentialUniqueId
      ? `https://demo-dcs-verifier-us.everycred.com/${credentialUniqueId}`
      : undefined

    return {
      id: (credentialUniqueId ?? credentialId ?? `cred_${Date.now()}`) as string,
      credential_id: credentialId,
      credential_unique_id: credentialUniqueId,
      student: studentName,
      student_email: studentEmail || undefined,
      degree,
      program,
      date: issueDate,
      verification_url: verificationUrl,
    }
  }
}

// Export singleton instance
export const everycredCredentialsService = new EveryCREDCredentialsService()

