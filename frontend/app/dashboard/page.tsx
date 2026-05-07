"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { CredentialsTable } from "@/components/dashboard/credentials-table"
import { motion } from "framer-motion"
import { Award, BadgeCheck, Clock3, ShieldX, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { everycredCredentialsService } from "@/lib/everycred-credentials-service"
import {
  everycredDashboardService,
  type EveryCREDDashboardStat,
} from "@/lib/everycred-dashboard-service"
import { useAuthIssuer } from "@/lib/auth/auth-issuer-context"

// const completedStudents = [
//   {
//     id: "1",
//     name: "Emily Davis",
//     email: "emily.d@university.edu",
//     program: "Computer Science",
//     degree: "Bachelor of Technology",
//     completionDate: "2026-01-05",
//     status: "completed" as const,
//   },
//   {
//     id: "2",
//     name: "William Brown",
//     email: "w.brown@university.edu",
//     program: "Data Science",
//     degree: "Master of Science",
//     completionDate: "2026-01-08",
//     status: "completed" as const,
//   },
// ]

export default function DashboardPage() {
  const { activeIssuerId } = useAuthIssuer()
  const [dashboardStats, setDashboardStats] = useState<EveryCREDDashboardStat[]>([])
  const [dashboardStatsError, setDashboardStatsError] = useState<string | null>(null)
  const [issuedCredentials, setIssuedCredentials] = useState<
    Array<{ 
      id: string
      credential_id: string
      credential_unique_id?: string
      student: string
      student_email?: string
      degree: string
      program?: string
      date: string
      verification_url?: string
    }>
  >([])
  const [credentialsCount, setCredentialsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setDashboardStatsError(null)
        const stats = await everycredDashboardService.getDashboardStats()
        setDashboardStats(stats)
      } catch (err) {
        console.error("Failed to load dashboard stats:", err)
        setDashboardStatsError(
          err instanceof Error
            ? err.message
            : "Failed to load dashboard stats. Please try again later."
        )
      }
    }

    loadDashboardStats()
  }, [activeIssuerId])

  useEffect(() => {
    const loadCredentials = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch credentials from EveryCRED API
        const result = await everycredCredentialsService.getCredentialsList(
          currentPage,    // page
          pageSize,       // size
          "active",       // credential_status
          activeIssuerId ?? undefined // issuer_id
        )
        
        setIssuedCredentials(result.credentials)
        setCredentialsCount(result.total)
      } catch (err) {
        console.error("Failed to load certifications:", err)
        setError(err instanceof Error ? err.message : "Failed to load certifications. Please try again later.")
        setIssuedCredentials([])
        setCredentialsCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    if (activeIssuerId) loadCredentials()
  }, [activeIssuerId, currentPage, pageSize])

  const statsIconMap = {
    TOTAL_ISSUED: <Award className="h-5 w-5" />,
    ACTIVE: <BadgeCheck className="h-5 w-5" />,
    REVOKED: <ShieldX className="h-5 w-5" />,
    EXPIRED: <Clock3 className="h-5 w-5" />,
    TOTAL_RECIPIENT: <Users className="h-5 w-5" />,
  }

  const normalizeStatLabel = (label: string) =>
    label
      .replace(/Credential/gi, "Certification")
      .replace(/Credentials/gi, "Certifications")

  const topStats =
    dashboardStats.length > 0
      ? dashboardStats.map((stat) => ({ ...stat, label: normalizeStatLabel(stat.label) }))
      : [
          { key: "TOTAL_ISSUED", label: "Issued Certifications", value: credentialsCount },
          { key: "ACTIVE", label: "Active Certifications", value: 0 },
          { key: "REVOKED", label: "Revoked Certifications", value: 0 },
          { key: "EXPIRED", label: "Expired Certifications", value: 0 },
          { key: "TOTAL_RECIPIENT", label: "Recipient", value: credentialsCount },
        ]

  return (
    <AppShell>
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening with your LMS RMS today." />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-8 items-stretch">
        {topStats.map((stat, index) => (
          <StatsCard
            key={stat.key}
            title={stat.label}
            value={stat.value.toLocaleString()}
            icon={statsIconMap[stat.key] ?? <Award className="h-5 w-5" />}
            delay={index * 0.1}
          />
        ))}
      </div>
      {dashboardStatsError && (
        <p className="text-sm text-destructive mb-6">{dashboardStatsError}</p>
      )}

      {/* Certifications Table Section */}
      <motion.div
        className="space-y-4 sm:space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Recently Issued Certifications</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Detailed listing of certifications issued via EveryCRED</p>
        </div>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading certifications...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : (
          <CredentialsTable 
            credentials={issuedCredentials}
            total={credentialsCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            loading={isLoading}
          />
        )}
      </motion.div>
    </AppShell>
  )
}

