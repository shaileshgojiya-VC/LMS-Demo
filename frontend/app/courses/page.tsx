"use client"

import * as React from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { CourseCard } from "@/components/courses/course-card"
import { CreateCourseForm } from "@/components/courses/create-course-form"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { motion } from "framer-motion"
import { Plus, Search, Filter, Loader2, AlertCircle } from "lucide-react"
import { Course } from "@/lib/api"
import { useAuthIssuer } from "@/lib/auth/auth-issuer-context"
import { everycredSubjectsService, type EveryCREDSubject } from "@/lib/everycred-subjects-service"

export default function CoursesPage() {
  const { activeIssuerId } = useAuthIssuer()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [subjects, setSubjects] = React.useState<EveryCREDSubject[]>([])
  const [search, setSearch] = React.useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  const refetch = React.useCallback(async () => {
    if (!activeIssuerId) return
    try {
      setLoading(true)
      setError(null)
      const res = await everycredSubjectsService.listSubjects({
        page: 1,
        size: 10,
        search,
        order_by: "newest",
        issuer_id: activeIssuerId,
      })
      setSubjects(res.list)
    } catch (e: any) {
      setError(e?.message || "Failed to load training programs.")
      setSubjects([])
    } finally {
      setLoading(false)
    }
  }, [activeIssuerId, search])

  React.useEffect(() => {
    if (!activeIssuerId) return
    refetch()
  }, [activeIssuerId, refetch])

  const courses: Course[] = React.useMemo(() => {
    return subjects.map((s) => {
      const course = {
        id: s.id,
        name: s.title || s.name,
        description: (s.description as any) || null,
        instructor: null,
        students: s.issued_cred_count ?? 0,
        duration: null,
        modules: s.draft_cred_count ?? 0,
        status: "active",
        created_at: s.created_at || new Date().toISOString(),
        updated_at: s.updated_at || new Date().toISOString(),
      } as Course & { logo?: string | null }

      course.logo = (s.logo as any) ?? null
      return course
    })
  }, [subjects])

  if (loading) {
    return (
      <AppShell>
        <Header title="Training Programs" subtitle="Browse and manage all available training programs" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading training programs...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <Header title="Training Programs" subtitle="Browse and manage all available training programs" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-destructive font-medium">Failed to load training programs</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <GlassButton variant="secondary" onClick={() => refetch()}>
              Try Again
            </GlassButton>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <Header title="Training Programs" subtitle="Browse and manage all available training programs" />

      {/* Actions Bar */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:w-72">
            <GlassInput
              placeholder="Search training programs..."
              icon={<Search className="h-4 w-4" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <GlassButton variant="secondary" icon={<Filter className="h-4 w-4" />}>
            Filter
          </GlassButton>
        </div>
        <GlassButton 
          variant="primary" 
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateDialogOpen(true)}
        >
          Create Subject
        </GlassButton>
      </motion.div>

      {/* Courses Grid */}
      {courses && courses.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
        ))}
      </div>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">No training programs found</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first training program to get started</p>
          </div>
        </div>
      )}

      {/* Create Course Dialog */}
      <CreateCourseForm
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={() => refetch()}
      />
    </AppShell>
  )
}
