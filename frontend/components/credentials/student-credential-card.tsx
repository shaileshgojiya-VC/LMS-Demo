"use client"

import * as React from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassBadge } from "@/components/ui/glass-badge"
import { motion, AnimatePresence } from "framer-motion"
import { Award, ExternalLink, CheckCircle, Copy, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { credentialStorage } from "@/lib/credential-storage"
import { api } from "@/lib/api"

interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  program: string
  degree: string
  completionDate: string
  status: "pending" | "completed"
}

interface CredentialResponse {
  credential_id: string
  verification_url: string
  status: string
}

interface StudentCredentialCardProps {
  student: Student
  onCredentialIssued?: (student: Student, credential: CredentialResponse) => void
}

export function StudentCredentialCard({ student, onCredentialIssued }: StudentCredentialCardProps) {
  const [isIssuing, setIsIssuing] = React.useState(false)
  const [credential, setCredential] = React.useState<CredentialResponse | null>(null)
  const [copied, setCopied] = React.useState(false)

  const handleIssueCredential = async () => {
    setIsIssuing(true)

    try {
      const data = await api.credentials.issue({
        student_name: student.name,
        student_email: student.email,
        degree: student.degree,
        program: student.program,
        institution: "Demo University",
        issue_date: new Date().toISOString().split("T")[0],
      })
      
      setCredential(data)
      
      // Store the credential for dashboard display
      credentialStorage.storeCredential({
        credential_id: data.credential_id,
        student_id: student.id,
        student_name: student.name,
        student_email: student.email,
        degree: student.degree,
        program: student.program,
        institution: "Demo University",
        issue_date: new Date().toISOString().split("T")[0],
        verification_url: data.verification_url,
        status: "issued",
        issued_at: data.issued_at || new Date().toISOString(),
      })
      
      onCredentialIssued?.(student, data)
      toast.success("Credential issued successfully!", {
        description: `Credential ID: ${data.credential_id}`,
      })
    } catch (error: any) {
      toast.error("Failed to issue credential", {
        description: error?.message || "Please try again later.",
      })
    } finally {
      setIsIssuing(false)
    }
  }

  const copyCredentialId = () => {
    if (credential) {
      navigator.clipboard.writeText(credential.credential_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Credential ID copied to clipboard")
    }
  }

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <GlassCard className="overflow-hidden" interactive={!credential}>
      <div className="flex items-start gap-3 sm:gap-4">
        <Avatar className="h-12 w-12 sm:h-14 sm:w-14 shrink-0">
          <AvatarImage
            src={student.avatar || `/placeholder.svg?height=56&width=56&query=${student.name} student portrait`}
          />
          <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs sm:text-sm">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">{student.name}</h3>
            <GlassBadge variant={student.status === "completed" ? "success" : "default"} className="text-xs">
              {student.status === "completed" ? "Completed" : "In Progress"}
            </GlassBadge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 truncate">{student.email}</p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm">
            <div>
              <span className="text-muted-foreground">Program:</span>
              <span className="ml-1.5 text-foreground">{student.program}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Degree:</span>
              <span className="ml-1.5 text-foreground">{student.degree}</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!credential ? (
          <motion.div
            key="issue"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-border/30"
          >
            <GlassButton
              variant="primary"
              size="md"
              className="w-full"
              onClick={handleIssueCredential}
              loading={isIssuing}
              icon={<Award className="h-4 w-4" />}
              disabled={student.status !== "completed"}
            >
              <span className="hidden sm:inline">{isIssuing ? "Issuing Credential..." : "Issue Credential"}</span>
              <span className="sm:hidden">{isIssuing ? "Issuing..." : "Issue"}</span>
            </GlassButton>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-border/30"
          >
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <div className="p-1.5 rounded-full bg-success/20">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-success" />
              </div>
              <span className="text-xs sm:text-sm font-medium text-success">Credential Issued Successfully</span>
            </div>

            <div className="glass rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">Credential ID</p>
                  <p className="text-xs sm:text-sm font-mono text-foreground mt-0.5 truncate">{credential.credential_id}</p>
                </div>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={copyCredentialId}
                  icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  className="shrink-0"
                >
                  <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                </GlassButton>
              </div>

              <GlassButton
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => window.open(credential.verification_url, "_blank")}
                icon={<ExternalLink className="h-3.5 w-3.5" />}
              >
                <span className="hidden sm:inline">View Verification Page</span>
                <span className="sm:hidden">View</span>
              </GlassButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
