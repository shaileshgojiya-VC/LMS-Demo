"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { IssuedCredentials } from "@/components/dashboard/issued-credentials"
import { StudentCredentialCard } from "@/components/credentials/student-credential-card"
import { motion } from "framer-motion"
import { Users, BookOpen, Award, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { credentialStorage } from "@/lib/credential-storage"
import { format } from "date-fns"

const completedStudents = [
  {
    id: "1",
    name: "Emily Davis",
    email: "emily.d@university.edu",
    program: "Computer Science",
    degree: "Bachelor of Technology",
    completionDate: "2026-01-05",
    status: "completed" as const,
  },
  {
    id: "2",
    name: "William Brown",
    email: "w.brown@university.edu",
    program: "Data Science",
    degree: "Master of Science",
    completionDate: "2026-01-08",
    status: "completed" as const,
  },
]

export default function DashboardPage() {
  const [issuedCredentials, setIssuedCredentials] = useState<
    Array<{ id: string; student: string; degree: string; date: string }>
  >([])
  const [credentialsCount, setCredentialsCount] = useState(0)

  useEffect(() => {
    // Load recently issued credentials
    const loadCredentials = () => {
      const recent = credentialStorage.getRecentCredentials(10)
      const formatted = recent.map((cred) => ({
        id: cred.credential_id,
        student: cred.student_name,
        degree: cred.degree,
        date: format(new Date(cred.issued_at), "yyyy-MM-dd"),
      }))
      setIssuedCredentials(formatted)
      setCredentialsCount(credentialStorage.getTotalCount())
    }

    loadCredentials()

    // Listen for storage changes (when credentials are issued from other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lms_issued_credentials") {
        loadCredentials()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom events (same-tab updates)
    const handleCredentialIssued = () => {
      loadCredentials()
    }

    window.addEventListener("credentialIssued", handleCredentialIssued)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("credentialIssued", handleCredentialIssued)
    }
  }, [])

  const handleCredentialIssued = () => {
    // Reload credentials when a new one is issued
    const recent = credentialStorage.getRecentCredentials(10)
    const formatted = recent.map((cred) => ({
      id: cred.credential_id,
      student: cred.student_name,
      degree: cred.degree,
      date: format(new Date(cred.issued_at), "yyyy-MM-dd"),
    }))
    setIssuedCredentials(formatted)
    setCredentialsCount(credentialStorage.getTotalCount())
    
    // Dispatch custom event for other components
    window.dispatchEvent(new Event("credentialIssued"))
  }
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
          change={credentialsCount > 0 ? undefined : undefined}
          trend="up"
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Credential Issuance Section */}
        <motion.div
          className="lg:col-span-2 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground">Ready for Credential Issuance</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Students who have completed their programs and are ready for credential issuance via EveryCRED
            </p>
          </div>

          <div className="space-y-4">
            {completedStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <StudentCredentialCard student={student} onCredentialIssued={handleCredentialIssued} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
            <p className="text-sm text-muted-foreground mt-1">Latest updates from your LMS</p>
          </div>
          <RecentActivity />
        </motion.div>
      </div>

      {/* Issued Credentials Section */}
      <motion.div
        className="space-y-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div>
          <h2 className="text-lg font-semibold text-foreground">Issued Credentials</h2>
          <p className="text-sm text-muted-foreground mt-1">Recently issued credentials via EveryCRED</p>
        </div>
        <IssuedCredentials credentials={issuedCredentials} />
      </motion.div>
    </AppShell>
  )
}

