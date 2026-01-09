"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { StudentCredentialCard } from "@/components/credentials/student-credential-card"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassBadge } from "@/components/ui/glass-badge"
import { StatsCard } from "@/components/dashboard/stats-card"
import { motion } from "framer-motion"
import { Award, Clock, CheckCircle, ShieldCheck } from "lucide-react"

const pendingStudents = [
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
  {
    id: "3",
    name: "Sarah Johnson",
    email: "sarah.j@university.edu",
    program: "Cybersecurity",
    degree: "Bachelor of Science",
    completionDate: "2026-01-09",
    status: "completed" as const,
  },
]

const issuedCredentials = [
  { id: "EC-2026-001", student: "Michael Chen", degree: "M.S. Data Science", date: "2026-01-02" },
  { id: "EC-2026-002", student: "Lisa Wang", degree: "B.Tech Computer Science", date: "2026-01-03" },
  { id: "EC-2026-003", student: "David Kumar", degree: "M.S. AI & ML", date: "2026-01-04" },
]

export default function CredentialsPage() {
  return (
    <AppShell>
      <Header title="Credentials" subtitle="Issue and manage academic credentials via EveryCRED" />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatsCard
          title="Total Issued"
          value="1,234"
          change={23.1}
          trend="up"
          icon={<Award className="h-5 w-5" />}
          delay={0}
        />
        <StatsCard title="Pending Issuance" value="47" icon={<Clock className="h-5 w-5" />} delay={0.1} />
        <StatsCard
          title="Verified Today"
          value="89"
          change={15.2}
          trend="up"
          icon={<CheckCircle className="h-5 w-5" />}
          delay={0.2}
        />
        <StatsCard title="Verification Rate" value="99.8%" icon={<ShieldCheck className="h-5 w-5" />} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Issuance */}
        <motion.div
          className="lg:col-span-2 space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground">Pending Credential Issuance</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Click "Issue Degree Credential" to send credentials to EveryCRED
            </p>
          </div>

          <div className="space-y-4">
            {pendingStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <StudentCredentialCard student={student} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recently Issued */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <h2 className="text-lg font-semibold text-foreground">Recently Issued</h2>
            <p className="text-sm text-muted-foreground mt-1">Latest credentials issued</p>
          </div>
          <GlassCard interactive={false} className="p-0 overflow-hidden">
            <div className="divide-y divide-border/30">
              {issuedCredentials.map((cred, index) => (
                <motion.div
                  key={cred.id}
                  className="p-4 hover:bg-muted/30 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
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
        </motion.div>
      </div>
    </AppShell>
  )
}
