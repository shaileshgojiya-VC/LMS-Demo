"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { GlassBadge } from "@/components/ui/glass-badge"
import { GlassButton } from "@/components/ui/glass-button"
import { motion } from "framer-motion"
import { ShieldCheck, ExternalLink } from "lucide-react"

interface IssuedCredential {
  id: string
  credential_id: string
  student: string
  degree: string
  date: string
  verification_url?: string
}

interface IssuedCredentialsProps {
  credentials: IssuedCredential[]
}

export function IssuedCredentials({ credentials }: IssuedCredentialsProps) {
  const handleVerify = (credential: IssuedCredential) => {
    // Redirect to verification URL if available, otherwise use correct verifier base URL
    const verifyUrl = credential.verification_url || `https://stg-dcs-verifier-in.everycred.com/${credential.credential_id}`
    window.open(verifyUrl, "_blank", "noopener,noreferrer")
  }

  if (credentials.length === 0) {
    return (
      <GlassCard interactive={false} className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground">No credentials issued yet</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard interactive={false} className="p-0 overflow-hidden">
      <div className="divide-y divide-border/30">
        {credentials.map((cred, index) => (
          <motion.div
            key={cred.id}
            className="p-4 hover:bg-muted/30 transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{cred.student}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{cred.degree}</p>
                  </div>
                  <GlassBadge variant="success">Issued</GlassBadge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <code className="text-xs text-muted-foreground font-mono truncate mr-2">{cred.credential_id}</code>
                  <span className="text-xs text-muted-foreground shrink-0">{cred.date}</span>
                </div>
              </div>
              <div className="shrink-0">
                <GlassButton
                  variant="primary"
                  size="sm"
                  icon={<ShieldCheck className="h-4 w-4" />}
                  onClick={() => handleVerify(cred)}
                  className="whitespace-nowrap"
                >
                  Verify
                </GlassButton>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}

