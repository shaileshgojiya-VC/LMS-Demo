// Credential Storage Service
// Manages issued credentials in localStorage (temporary solution)
// In production, this should be replaced with backend API calls

export interface StoredCredential {
  id: string
  credential_id: string
  student_id: string
  student_name: string
  student_email?: string
  degree: string
  program: string
  institution: string
  issue_date: string
  verification_url?: string
  status: "issued" | "pending" | "revoked"
  issued_at: string
}

const STORAGE_KEY = "lms_issued_credentials"

class CredentialStorage {
  private getCredentials(): StoredCredential[] {
    if (typeof window === "undefined") return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Failed to read credentials from storage:", error)
      return []
    }
  }

  private saveCredentials(credentials: StoredCredential[]): void {
    if (typeof window === "undefined") return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials))
    } catch (error) {
      console.error("Failed to save credentials to storage:", error)
    }
  }

  /**
   * Store a newly issued credential
   */
  storeCredential(credential: Omit<StoredCredential, "id">): StoredCredential {
    const credentials = this.getCredentials()
    const newCredential: StoredCredential = {
      ...credential,
      id: `cred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
    
    credentials.unshift(newCredential) // Add to beginning for recent first
    this.saveCredentials(credentials)
    
    // Dispatch custom event for same-tab updates
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("credentialIssued"))
    }
    
    return newCredential
  }

  /**
   * Get all issued credentials
   */
  getAllCredentials(): StoredCredential[] {
    return this.getCredentials()
  }

  /**
   * Get recently issued credentials (most recent first)
   */
  getRecentCredentials(limit: number = 10): StoredCredential[] {
    const credentials = this.getCredentials()
    return credentials.slice(0, limit)
  }

  /**
   * Get credentials for a specific student
   */
  getCredentialsByStudent(studentId: string): StoredCredential[] {
    const credentials = this.getCredentials()
    return credentials.filter((cred) => cred.student_id === studentId)
  }

  /**
   * Get credentials for a specific course/program
   */
  getCredentialsByProgram(program: string): StoredCredential[] {
    const credentials = this.getCredentials()
    return credentials.filter((cred) => cred.program === program)
  }

  /**
   * Update credential status
   */
  updateCredentialStatus(credentialId: string, status: StoredCredential["status"]): boolean {
    const credentials = this.getCredentials()
    const index = credentials.findIndex((cred) => cred.credential_id === credentialId)
    
    if (index === -1) return false
    
    credentials[index].status = status
    this.saveCredentials(credentials)
    return true
  }

  /**
   * Delete a credential (for testing/cleanup)
   */
  deleteCredential(credentialId: string): boolean {
    const credentials = this.getCredentials()
    const filtered = credentials.filter((cred) => cred.credential_id !== credentialId)
    
    if (filtered.length === credentials.length) return false
    
    this.saveCredentials(filtered)
    return true
  }

  /**
   * Clear all credentials (for testing/cleanup)
   */
  clearAll(): void {
    this.saveCredentials([])
  }

  /**
   * Get total count of issued credentials
   */
  getTotalCount(): number {
    return this.getCredentials().length
  }
}

export const credentialStorage = new CredentialStorage()

