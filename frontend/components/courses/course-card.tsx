"use client"
import * as React from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassBadge } from "@/components/ui/glass-badge"
import { GlassButton } from "@/components/ui/glass-button"
import { motion } from "framer-motion"
import { Users, Clock, BookOpen, Pencil } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Course } from "@/lib/api"
import { EditCourseForm } from "./edit-course-form"

interface CourseCardProps {
  course: Course
  index?: number
  onUpdate?: () => void
}

export function CourseCard({ course, index = 0, onUpdate }: CourseCardProps) {
  const router = useRouter()
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  
  // Map backend data to display format
  const courseTitle = course.name || "Untitled Course"
  const courseDescription = course.description || "No description available"
  const instructor = course.instructor || "TBA"
  const instructorInitials = instructor
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
  const studentsCount = course.students ?? 0
  const durationWeeks = course.duration ? `${course.duration} weeks` : "TBA"
  const modulesCount = course.modules ?? 0
  const status = course.status || "inactive"
  
  // Map status to display variant
  const getStatusVariant = (status: string | null | undefined) => {
    switch (status) {
      case "active":
      case "ongoing":
        return "success"
      case "upcoming":
        return "warning"
      case "completed":
        return "default"
      case "cancelled":
      case "inactive":
      default:
        return "default"
    }
  }

  const handleCardClick = () => {
    router.push(`/students?course=${encodeURIComponent(course.id)}&courseName=${encodeURIComponent(courseTitle)}`)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditDialogOpen(true)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <GlassCard className="p-0 overflow-hidden hover:scale-[1.02] transition-transform relative">
        {/* Course Image */}
        <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden cursor-pointer" onClick={handleCardClick}>
          <img
            src={`/placeholder.svg?height=160&width=400&query=${courseTitle} course banner education`}
            alt={courseTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <GlassBadge variant={getStatusVariant(status)}>
              {status}
            </GlassBadge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="cursor-pointer" onClick={handleCardClick}>
            <h3 className="font-semibold text-foreground line-clamp-1">{courseTitle}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{courseDescription}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground cursor-pointer" onClick={handleCardClick}>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{studentsCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{durationWeeks}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>{modulesCount} modules</span>
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30 gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={handleCardClick}>
              <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage
                  src={`/placeholder.svg?height=32&width=32&query=${instructor} professor`}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{instructorInitials}</AvatarFallback>
            </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{instructor}</p>
              <p className="text-xs text-muted-foreground">Instructor</p>
              </div>
            </div>
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
              <GlassButton
                variant="secondary"
                size="sm"
                icon={<Pencil className="h-3.5 w-3.5" />}
                onClick={handleEditClick}
                className="relative z-10"
              >
                Edit
              </GlassButton>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Edit Course Dialog */}
      <EditCourseForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        course={course}
        onSuccess={() => {
          if (onUpdate) {
            onUpdate()
          }
        }}
      />
    </motion.div>
  )
}
