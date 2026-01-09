"use client"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassBadge } from "@/components/ui/glass-badge"
import { motion } from "framer-motion"
import { Users, Clock, BookOpen } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructorAvatar?: string
  students: number
  duration: string
  modules: number
  status: "active" | "upcoming" | "completed"
  image?: string
}

interface CourseCardProps {
  course: Course
  index?: number
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  const instructorInitials = course.instructor
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <GlassCard className="p-0 overflow-hidden">
        {/* Course Image */}
        <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
          <img
            src={course.image || `/placeholder.svg?height=160&width=400&query=${course.title} course banner education`}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <GlassBadge
              variant={course.status === "active" ? "success" : course.status === "upcoming" ? "warning" : "default"}
            >
              {course.status}
            </GlassBadge>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-semibold text-foreground line-clamp-1">{course.title}</h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>{course.students}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              <span>{course.modules} modules</span>
            </div>
          </div>

          {/* Instructor */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/30">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={
                  course.instructorAvatar || `/placeholder.svg?height=32&width=32&query=${course.instructor} professor`
                }
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">{instructorInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{course.instructor}</p>
              <p className="text-xs text-muted-foreground">Instructor</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
