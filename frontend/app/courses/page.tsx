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
import { useCoursesList } from "@/lib/hooks/use-api"
import { Course } from "@/lib/api"

export default function CoursesPage() {
  const { data: coursesListResponse, loading, error, refetch } = useCoursesList(1, 10, "newest")
  // Response structure: { status: "success", data: { total, pages, size, list: [...] }, message: "..." }
  const courses = coursesListResponse?.data?.list || []
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false)

  if (loading) {
    return (
      <AppShell>
        <Header title="Courses" subtitle="Browse and manage all available courses" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <Header title="Courses" subtitle="Browse and manage all available courses" />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <div>
              <p className="text-destructive font-medium">Failed to load courses</p>
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
      <Header title="Courses" subtitle="Browse and manage all available courses" />

      {/* Actions Bar */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex-1 sm:w-72">
            <GlassInput placeholder="Search courses..." icon={<Search className="h-4 w-4" />} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} index={index} />
        ))}
      </div>
      ) : (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">No courses found</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first course to get started</p>
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
