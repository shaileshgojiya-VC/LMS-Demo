"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { GlassBadge } from "@/components/ui/glass-badge"
import { GlassButton } from "@/components/ui/glass-button"
import { motion } from "framer-motion"
import { ShieldCheck, ExternalLink, Award, User, Calendar, ChevronLeft, ChevronRight } from "lucide-react"

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
  total?: number
  currentPage?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  loading?: boolean
}

export function CredentialsTable({ 
  credentials, 
  total = 0, 
  currentPage = 1, 
  pageSize = 10, 
  onPageChange,
  loading = false 
}: CredentialsTableProps) {
  const totalPages = Math.ceil(total / pageSize)

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
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full min-w-[640px] sm:min-w-0">
          <thead>
            <tr className="border-b border-border/30 bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3">
                Student
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3 hidden md:table-cell">
                Degree
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3">
                Program
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3 hidden lg:table-cell">
                Credential ID
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3 hidden sm:table-cell">
                Issue Date
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3 hidden md:table-cell">
                Status
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3">
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
                  <td className="px-3 sm:px-5 py-4">
                    <div>
                      <p className="font-medium text-foreground text-sm">{cred.student}</p>
                      {cred.student_email && (
                        <p className="text-xs text-muted-foreground hidden sm:block">{cred.student_email}</p>
                      )}
                      {/* Show degree on mobile since it's hidden in header */}
                      <div className="flex items-center gap-2 sm:hidden mt-1">
                        <Award className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{cred.degree}</span>
                      </div>
                      {/* Show date on mobile since it's hidden in header */}
                      <div className="flex items-center gap-1 sm:hidden mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{cred.date}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{cred.degree}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-4">
                    <span className="text-sm text-foreground">{cred.program || "—"}</span>
                  </td>
                  <td className="px-3 sm:px-5 py-4 hidden lg:table-cell">
                    <code className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                      {cred.credential_id}
                    </code>
                  </td>
                  <td className="px-3 sm:px-5 py-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{cred.date}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-4 hidden md:table-cell">
                    <GlassBadge variant="success">Issued</GlassBadge>
                  </td>
                  <td className="px-3 sm:px-5 py-4">
                    <div className="flex items-center justify-end">
                      <GlassButton
                        variant="primary"
                        size="sm"
                        icon={<ShieldCheck className="h-4 w-4" />}
                        onClick={() => handleVerify(cred)}
                        className="text-xs sm:text-sm"
                      >
                        <span className="hidden sm:inline">Verify</span>
                        <span className="sm:hidden">✓</span>
                      </GlassButton>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {total > 0 && totalPages > 1 && (
        <div className="p-4 sm:p-5 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, total)} of {total} credentials
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
              icon={<ChevronLeft className="h-4 w-4" />}
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </GlassButton>
            
            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                
                return (
                  <GlassButton
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => onPageChange && onPageChange(pageNum)}
                    disabled={loading}
                    className="min-w-[2.25rem] sm:min-w-[2.5rem] text-xs sm:text-sm"
                  >
                    {pageNum}
                  </GlassButton>
                )
              })}
            </div>
            
            <GlassButton
              variant="secondary"
              size="sm"
              onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || loading}
              icon={<ChevronRight className="h-4 w-4" />}
              className="text-xs sm:text-sm"
            >
              Next
            </GlassButton>
          </div>
        </div>
      )}
    </GlassCard>
  )
}

