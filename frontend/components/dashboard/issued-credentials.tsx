"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { GlassBadge } from "@/components/ui/glass-badge"
import { motion } from "framer-motion"

interface IssuedCredential {
  id: string
  student: string
  degree: string
  date: string
}

interface IssuedCredentialsProps {
  credentials: IssuedCredential[]
}

export function IssuedCredentials({ credentials }: IssuedCredentialsProps) {
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
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium text-foreground text-sm">{cred.student}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{cred.degree}</p>
              </div>
              <GlassBadge variant="success">Issued</GlassBadge>
            </div>
            <div className="flex items-center justify-between mt-2">
              <code className="text-xs text-muted-foreground font-mono">{cred.id}</code>
              <span className="text-xs text-muted-foreground">{cred.date}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}

