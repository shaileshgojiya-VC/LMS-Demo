// Authentication Storage Service
// Manages JWT tokens and user session in localStorage

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface User {
  id: number
  email: string
  username: string
  full_name: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
}

const TOKEN_KEY = "lms_auth_tokens"
const USER_KEY = "lms_user"

class AuthStorage {
  /**
   * Store authentication tokens
   */
  setTokens(tokens: AuthTokens): void {
    if (typeof window === "undefined") return
    
    try {
      localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
    } catch (error) {
      console.error("Failed to save tokens:", error)
    }
  }

  /**
   * Get stored authentication tokens
   */
  getTokens(): AuthTokens | null {
    if (typeof window === "undefined") return null
    
    try {
      const stored = localStorage.getItem(TOKEN_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error("Failed to read tokens:", error)
      return null
    }
  }

  /**
   * Store user information
   */
  setUser(user: User): void {
    if (typeof window === "undefined") return
    
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch (error) {
      console.error("Failed to save user:", error)
    }
  }

  /**
   * Get stored user information
   */
  getUser(): User | null {
    if (typeof window === "undefined") return null
    
    try {
      const stored = localStorage.getItem(USER_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error("Failed to read user:", error)
      return null
    }
  }

  /**
   * Get access token for API requests
   */
  getAccessToken(): string | null {
    const tokens = this.getTokens()
    return tokens?.access_token || null
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.getTokens() !== null && this.getUser() !== null
  }

  /**
   * Clear authentication data (logout)
   */
  clearAuth(): void {
    if (typeof window === "undefined") return
    
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch (error) {
      console.error("Failed to clear auth:", error)
    }
  }
}

export const authStorage = new AuthStorage()

