"use client"
import * as React from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassBadge } from "@/components/ui/glass-badge"
import { motion } from "framer-motion"
import { Users, Clock, BookOpen } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { Course } from "@/lib/api"

interface CourseCardProps {
  course: Course
  index?: number
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const router = useRouter()
  
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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <GlassCard className="p-0 overflow-hidden hover:scale-[1.02] transition-transform relative h-full flex flex-col">
        {/* Course Image */}
        <div className="h-32 sm:h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden cursor-pointer shrink-0" onClick={handleCardClick}>
          <img
            src={`/placeholder.svg?height=160&width=400&query=${courseTitle} course banner education`}
            alt={courseTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <GlassBadge variant={getStatusVariant(status)} className="text-xs">
              {status}
            </GlassBadge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          <div className="cursor-pointer" onClick={handleCardClick}>
            <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1">{courseTitle}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{courseDescription}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground cursor-pointer flex-wrap" onClick={handleCardClick}>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{studentsCount}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{durationWeeks}</span>
              <span className="sm:hidden">{course.duration || "TBA"}</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{modulesCount} {modulesCount === 1 ? "module" : "modules"}</span>
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/30 gap-2 sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 cursor-pointer" onClick={handleCardClick}>
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
              <AvatarImage
                  src={`/placeholder.svg?height=32&width=32&query=${instructor} professor`}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{instructorInitials}</AvatarFallback>
            </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">{instructor}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Instructor</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
