"use client"

import * as React from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { StudentsTable } from "@/components/students/students-table"
import { StatsCard } from "@/components/dashboard/stats-card"
import { motion } from "framer-motion"
import { Users, UserPlus, UserCheck, GraduationCap } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useStudents } from "@/lib/hooks/use-api"
import { useAuthIssuer } from "@/lib/auth/auth-issuer-context"
import { everycredSubjectsService, type EveryCREDSubject } from "@/lib/everycred-subjects-service"
import { SubjectRecordsTable } from "@/components/students/subject-records-table"

function StudentsPageContent() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get("course")
  const courseName = searchParams.get("courseName")
  const subjectIdParam = searchParams.get("subject_id")
  const subjectNameParam = searchParams.get("subjectName")
  const subjectId = subjectIdParam ? Number(subjectIdParam) : null
  const { activeIssuerId } = useAuthIssuer()
  const [subject, setSubject] = React.useState<EveryCREDSubject | null>(null)

  const title =
    subjectId && subjectNameParam
      ? `Learners - ${subjectNameParam}`
      : courseName
        ? `Learners - ${courseName}`
        : "Learners"
  const subtitle =
    subjectId && subjectNameParam
      ? `Records for ${subjectNameParam}`
      : courseName
        ? `Learners enrolled in ${courseName}`
        : "Manage and track all enrolled learners"

  React.useEffect(() => {
    if (!subjectId) return
    everycredSubjectsService
      .getSubject(subjectId)
      .then(setSubject)
      .catch(() => setSubject(null))
  }, [subjectId])

  // Fetch all students for stats
  const { data: allStudents } = useStudents(0, 1000)
  const { data: activeStudents } = useStudents(0, 1000, undefined, undefined, "active")
  const { data: completedStudents } = useStudents(0, 1000, undefined, undefined, "completed")

  const totalStudents = allStudents?.length || 0
  const activeCount = activeStudents?.length || 0
  const completedCount = completedStudents?.length || 0

  return (
    <AppShell>
      <Header title={title} subtitle={subtitle} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 items-stretch">
        <StatsCard title="Total Learners" value={totalStudents.toLocaleString()} icon={<Users className="h-5 w-5" />} delay={0} />
        <StatsCard
          title="Active Learners"
          value={activeCount.toLocaleString()}
          icon={<UserCheck className="h-5 w-5" />}
          delay={0.1}
        />
        <StatsCard
          title="Completed"
          value={completedCount.toLocaleString()}
          icon={<GraduationCap className="h-5 w-5" />}
          delay={0.2}
        />
        <StatsCard
          title="New This Month"
          value="—"
          icon={<UserPlus className="h-5 w-5" />}
          delay={0.3}
        />
      </div>

      {/* Students Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        {subjectId && activeIssuerId ? (
          <SubjectRecordsTable subjectId={subjectId} issuerId={activeIssuerId} />
        ) : (
          <StudentsTable courseId={courseId || undefined} courseName={courseName || undefined} />
        )}
      </motion.div>
    </AppShell>
  )
}

export default function StudentsPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <Header title="Learners" subtitle="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading learners...</div>
        </div>
      </AppShell>
    }>
      <StudentsPageContent />
    </Suspense>
  )
}
