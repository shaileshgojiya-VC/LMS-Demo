"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { CourseCard } from "@/components/courses/course-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { motion } from "framer-motion"
import { Plus, Search, Filter } from "lucide-react"

const courses = [
  {
    id: "1",
    title: "Advanced Data Science",
    description: "Master data analysis, machine learning, and statistical modeling with Python and R.",
    instructor: "Dr. Sarah Mitchell",
    students: 245,
    duration: "16 weeks",
    modules: 12,
    status: "active" as const,
  },
  {
    id: "2",
    title: "Cybersecurity Fundamentals",
    description: "Learn essential security concepts, threat detection, and defense strategies.",
    instructor: "Prof. James Anderson",
    students: 189,
    duration: "12 weeks",
    modules: 10,
    status: "active" as const,
  },
  {
    id: "3",
    title: "Machine Learning Engineering",
    description: "Build and deploy production-ready ML models using modern frameworks.",
    instructor: "Dr. Emily Chen",
    students: 312,
    duration: "20 weeks",
    modules: 15,
    status: "active" as const,
  },
  {
    id: "4",
    title: "Cloud Architecture",
    description: "Design scalable cloud solutions using AWS, Azure, and Google Cloud Platform.",
    instructor: "Prof. Michael Torres",
    students: 0,
    duration: "14 weeks",
    modules: 11,
    status: "upcoming" as const,
  },
  {
    id: "5",
    title: "Full-Stack Web Development",
    description: "Complete guide to modern web development with React, Node.js, and databases.",
    instructor: "Dr. Lisa Wang",
    students: 423,
    duration: "24 weeks",
    modules: 18,
    status: "active" as const,
  },
  {
    id: "6",
    title: "AI Ethics & Governance",
    description: "Explore ethical considerations and governance frameworks in AI development.",
    instructor: "Prof. David Kumar",
    students: 156,
    duration: "8 weeks",
    modules: 6,
    status: "completed" as const,
  },
]

export default function CoursesPage() {
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
        <GlassButton variant="primary" icon={<Plus className="h-4 w-4" />}>
          Add Course
        </GlassButton>
      </motion.div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <CourseCard key={course.id} course={course} index={index} />
        ))}
      </div>
    </AppShell>
  )
}
