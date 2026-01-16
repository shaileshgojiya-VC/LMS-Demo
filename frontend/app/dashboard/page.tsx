"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { CredentialsTable } from "@/components/dashboard/credentials-table"
import { motion } from "framer-motion"
import { Users, BookOpen, TrendingUp, Award } from "lucide-react"
import { useState, useEffect } from "react"
import { everycredCredentialsService } from "@/lib/everycred-credentials-service"

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
    const loadCredentials = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Fetch credentials from EveryCRED API
        const result = await everycredCredentialsService.getCredentialsList(
          currentPage,    // page
          pageSize,       // size
          "issued"        // credential_status
        )
        
        setIssuedCredentials(result.credentials)
        setCredentialsCount(result.total)
      } catch (err) {
        console.error("Failed to load credentials:", err)
        setError(err instanceof Error ? err.message : "Failed to load credentials. Please try again later.")
        setIssuedCredentials([])
        setCredentialsCount(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadCredentials()
  }, [currentPage, pageSize])
  return (
    <AppShell>
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening with your LMS today." />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 items-stretch">
        <StatsCard
          title="Total Students"
          value="2,847"
          change={12.5}
          trend="up"
          icon={<Users className="h-5 w-5" />}
          delay={0}
        />
        <StatsCard
          title="Active Courses"
          value="156"
          change={8.2}
          trend="up"
          icon={<BookOpen className="h-5 w-5" />}
          delay={0.1}
        />
        <StatsCard
          title="Credentials Issued"
          value={credentialsCount.toLocaleString()}
          icon={<Award className="h-5 w-5" />}
          delay={0.2}
        />
        <StatsCard
          title="Completion Rate"
          value="94.2%"
          change={2.4}
          trend="up"
          icon={<TrendingUp className="h-5 w-5" />}
          delay={0.3}
        />
      </div>

      {/* Credentials Table Section */}
      <motion.div
        className="space-y-4 sm:space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Recently Issued Credentials</h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Detailed listing of credentials issued via EveryCRED</p>
        </div>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading credentials...</p>
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

