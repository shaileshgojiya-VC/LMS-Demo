"use client"

import * as React from "react"
import {
  everycredUserService,
  type EveryCREDAuthUser,
  type EveryCREDRolePermissions,
  type EveryCREDUserConfig,
} from "@/lib/everycred-user-service"
import {
  everycredIssuerService,
  type EveryCREDIssuer,
} from "@/lib/everycred-issuer-service"

interface AuthIssuerState {
  authUser: EveryCREDAuthUser | null
  userConfig: EveryCREDUserConfig | null
  rolePermissions: EveryCREDRolePermissions | null
  issuers: EveryCREDIssuer[]
  activeIssuerId: number | null
  loading: boolean
  error: string | null
}

interface AuthIssuerActions {
  bootstrap: () => Promise<void>
  switchIssuer: (issuerId: number) => Promise<EveryCREDIssuer | null>
  signOut: () => void
}

type AuthIssuerContextValue = AuthIssuerState & AuthIssuerActions

const AuthIssuerContext = React.createContext<AuthIssuerContextValue | null>(null)

function computeActiveIssuerId(
  authUser: EveryCREDAuthUser | null,
  issuers: EveryCREDIssuer[]
): number | null {
  const fromUser = authUser?.activated_issuer_profile_id
  if (typeof fromUser === "number" && Number.isFinite(fromUser)) {
    return fromUser
  }
  const active = issuers.find((i) => i.is_active)
  return active?.id ?? null
}

export function AuthIssuerProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = React.useState<EveryCREDAuthUser | null>(null)
  const [userConfig, setUserConfig] = React.useState<EveryCREDUserConfig | null>(null)
  const [rolePermissions, setRolePermissions] = React.useState<EveryCREDRolePermissions | null>(null)
  const [issuers, setIssuers] = React.useState<EveryCREDIssuer[]>([])
  const [activeIssuerId, setActiveIssuerId] = React.useState<number | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const bootstrap = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [nextAuthUser, nextConfig, nextRolePerms, nextIssuers] =
        await Promise.all([
          everycredUserService.getAuthUser(),
          everycredUserService.getUserConfig(),
          everycredUserService.getRolePermissions(),
          everycredIssuerService.getIssuers(),
        ])

      setAuthUser(nextAuthUser)
      setUserConfig(nextConfig)
      setRolePermissions(nextRolePerms)
      setIssuers(nextIssuers)
      setActiveIssuerId(computeActiveIssuerId(nextAuthUser, nextIssuers))
    } catch (e: any) {
      const message = e?.message || "Failed to load account context."
      setError(message)
      // Keep previous state to avoid UI flicker; consumer can show error if needed.
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    // If the user is already logged in (token exists), hydrate on mount.
    if (typeof window === "undefined") return
    const tokens = localStorage.getItem("lms_auth_tokens")
    if (tokens) {
      bootstrap()
    }
  }, [bootstrap])

  const switchIssuer = React.useCallback(
    async (issuerId: number) => {
      await everycredIssuerService.activateIssuer(issuerId)
      await bootstrap()
      const issuer =
        issuers.find((i) => i.id === issuerId) ||
        issuers.find((i) => i.is_active) ||
        null
      return issuer
    },
    [bootstrap, issuers]
  )

  const signOut = React.useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lms_auth_tokens")
      localStorage.removeItem("lms_user")
    }
    setAuthUser(null)
    setUserConfig(null)
    setRolePermissions(null)
    setIssuers([])
    setActiveIssuerId(null)
    setError(null)
    setLoading(false)
  }, [])

  const value: AuthIssuerContextValue = React.useMemo(
    () => ({
      authUser,
      userConfig,
      rolePermissions,
      issuers,
      activeIssuerId,
      loading,
      error,
      bootstrap,
      switchIssuer,
      signOut,
    }),
    [
      authUser,
      userConfig,
      rolePermissions,
      issuers,
      activeIssuerId,
      loading,
      error,
      bootstrap,
      switchIssuer,
      signOut,
    ]
  )

  return (
    <AuthIssuerContext.Provider value={value}>
      {children}
    </AuthIssuerContext.Provider>
  )
}

export function useAuthIssuer(): AuthIssuerContextValue {
  const ctx = React.useContext(AuthIssuerContext)
  if (!ctx) {
    throw new Error("useAuthIssuer must be used within AuthIssuerProvider")
  }
  return ctx
}

