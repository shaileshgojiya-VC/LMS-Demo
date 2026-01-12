// EveryCRED Credentials Service
// Fetches credentials list directly from EveryCRED API

import { getEveryCREDConfig, isEveryCREDConfigured, type EveryCREDConfig } from "./everycred-config"

export interface EveryCREDCredential {
  id?: string
  credential_id?: string
  credential_unique_id?: string
  uuid?: string
  candidate_name?: string
  student?: string
  student_name?: string
  student_email?: string
  degree?: string
  program?: string
  date?: string
  issue_date?: string
  created_at?: string
  issued_at?: string
  verification_url?: string
  status?: string
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
    // Re-read config to ensure we have latest env vars
    const config = getEveryCREDConfig()
    
    if (!isEveryCREDConfigured(config)) {
      throw new Error("EveryCRED is not properly configured. Please check your environment variables.")
    }

    // Validate API token is present
    if (!config.apiToken || config.apiToken.trim() === "") {
      console.error("Config check:", {
        hasToken: !!config.apiToken,
        tokenLength: config.apiToken?.length || 0,
        envVar: process.env.NEXT_PUBLIC_EVERYCRED_API_TOKEN ? "exists" : "missing",
      })
      throw new Error("EVERYCRED_API_TOKEN is required but not configured or is empty. Please check your .env.local file and restart the Next.js server.")
    }

    const effectiveIssuerId = issuerId ?? config.issuerId
    if (!effectiveIssuerId) {
      throw new Error("EVERYCRED_ISSUER_ID is required but not configured.")
    }

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      credential_status: credentialStatus,
      issuer_id: effectiveIssuerId.toString(),
    })

    // Construct full URL
    const url = `${config.apiUrl}/credentials?${params.toString()}`

    // Prepare headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Add Authorization header with Bearer token
    const authToken = config.apiToken.trim()
    if (!authToken) {
      throw new Error("API token is empty. Please check NEXT_PUBLIC_EVERYCRED_API_TOKEN in your .env.local file.")
    }
    headers["Authorization"] = `Bearer ${authToken}`

    try {
      console.log("EveryCRED API Request:", {
        url,
        hasToken: !!authToken,
        tokenLength: authToken.length,
        tokenPrefix: authToken.substring(0, 20) + "...",
      })

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
            // Check if token might be expired
            try {
              const tokenParts = config.apiToken.split('.')
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]))
                const exp = payload.exp
                const now = Math.floor(Date.now() / 1000)
                
                if (exp && now > exp) {
                  errorMessage = `EveryCRED API token has expired. The token expired on ${new Date(exp * 1000).toISOString()}. Please update NEXT_PUBLIC_EVERYCRED_API_TOKEN in your .env.local file with a new token and restart the server.`
                } else {
                  errorMessage = `EveryCRED API authentication failed. Please verify that NEXT_PUBLIC_EVERYCRED_API_TOKEN in your .env.local file is correct and not expired. Error: ${errorJson.message || errorText}`
                }
              }
            } catch (e) {
              // If we can't parse the token, just use the original error
              errorMessage = `EveryCRED API authentication failed. Please verify that NEXT_PUBLIC_EVERYCRED_API_TOKEN in your .env.local file is correct. Error: ${errorJson.message || errorText}`
            }
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
    const credentialId = cred.credential_id ?? cred.id ?? ""

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
      (subjectFields.name as string) ??
      cred.student_name ??
      cred.student ??
      ""

    const studentEmail =
      (subjectFields.email as string) ??
      cred.student_email ??
      ""

    // Extract program
    const program =
      (subjectFields.program as string) ??
      cred.program ??
      ""

    // Extract degree (default to "Bachelor of Technology" if not found)
    const degree = cred.degree ?? "Bachelor of Technology"

    // Extract and format date
    let issueDate = cred.date ?? cred.issue_date ?? cred.created_at ?? cred.issued_at ?? ""
    if (issueDate && issueDate.includes("T")) {
      issueDate = issueDate.split("T")[0]
    }

    // Construct verification URL
    const verificationUrl = credentialUniqueId
      ? `https://stg-dcs-verifier-in.everycred.com/${credentialUniqueId}`
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

