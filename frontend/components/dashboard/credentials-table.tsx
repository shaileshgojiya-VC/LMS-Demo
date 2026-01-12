"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { GlassBadge } from "@/components/ui/glass-badge"
import { GlassButton } from "@/components/ui/glass-button"
import { motion } from "framer-motion"
import { ShieldCheck, ExternalLink, Award, User, Calendar } from "lucide-react"

interface CredentialItem {
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

interface CredentialsTableProps {
  credentials: CredentialItem[]
}

export function CredentialsTable({ credentials }: CredentialsTableProps) {
  const handleVerify = (credential: CredentialItem) => {
    // Use verification_url if available, otherwise construct from credential_unique_id
    // EveryCRED verifier URL format: https://stg-dcs-verifier-in.everycred.com/{credential_unique_id}
    const verifyUrl = 
      credential.verification_url || 
      (credential.credential_unique_id 
        ? `https://stg-dcs-verifier-in.everycred.com/${credential.credential_unique_id}`
        : `https://stg-dcs-verifier-in.everycred.com/${credential.credential_id}`)
    window.open(verifyUrl, "_blank", "noopener,noreferrer")
  }

  if (credentials.length === 0) {
    return (
      <GlassCard interactive={false} className="p-8 rounded-sm">
        <div className="text-center">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">No credentials issued yet</p>
          <p className="text-sm text-muted-foreground mt-2">Issued credentials will appear here</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard interactive={false} className="p-0 overflow-hidden rounded-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30 bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Student
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Degree
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Program
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Credential ID
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Issue Date
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Status
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {credentials.map((cred, index) => {
              return (
                <motion.tr
                  key={cred.id}
                  className="hover:bg-muted/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-foreground text-sm">{cred.student}</p>
                      {cred.student_email && (
                        <p className="text-xs text-muted-foreground">{cred.student_email}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{cred.degree}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-foreground">{cred.program || "—"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <code className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                      {cred.credential_id}
                    </code>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{cred.date}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <GlassBadge variant="success">Issued</GlassBadge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end">
                      <GlassButton
                        variant="primary"
                        size="sm"
                        icon={<ShieldCheck className="h-4 w-4" />}
                        onClick={() => handleVerify(cred)}
                      >
                        Verify
                      </GlassButton>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}

