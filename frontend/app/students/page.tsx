"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { StudentsTable } from "@/components/students/students-table"
import { StatsCard } from "@/components/dashboard/stats-card"
import { motion } from "framer-motion"
import { Users, UserPlus, UserCheck, GraduationCap } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function StudentsPageContent() {
  const searchParams = useSearchParams()
  const courseId = searchParams.get("course")
  const courseName = searchParams.get("courseName")

  const title = courseName ? `Students - ${courseName}` : "Students"
  const subtitle = courseName
    ? `Students enrolled in ${courseName}`
    : "Manage and track all enrolled students"

  return (
    <AppShell>
      <Header title={title} subtitle={subtitle} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 items-stretch">
        <StatsCard title="Total Students" value="2,847" icon={<Users className="h-5 w-5" />} delay={0} />
        <StatsCard
          title="New This Month"
          value="124"
          change={18.3}
          trend="up"
          icon={<UserPlus className="h-5 w-5" />}
          delay={0.1}
        />
        <StatsCard title="Active Students" value="2,456" icon={<UserCheck className="h-5 w-5" />} delay={0.2} />
        <StatsCard
          title="Graduated"
          value="391"
          change={12.1}
          trend="up"
          icon={<GraduationCap className="h-5 w-5" />}
          delay={0.3}
        />
      </div>

      {/* Students Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <StudentsTable courseId={courseId || undefined} courseName={courseName || undefined} />
      </motion.div>
    </AppShell>
  )
}

export default function StudentsPage() {
  return (
    <Suspense fallback={
      <AppShell>
        <Header title="Students" subtitle="Loading..." />
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading students...</div>
        </div>
      </AppShell>
    }>
      <StudentsPageContent />
    </Suspense>
  )
}
