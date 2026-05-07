"use client"

import * as React from "react"
import { AuthIssuerProvider } from "@/lib/auth/auth-issuer-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthIssuerProvider>{children}</AuthIssuerProvider>
}

