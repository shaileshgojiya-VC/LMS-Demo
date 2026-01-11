"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { BookOpen, User, Clock, FileText, Tag } from "lucide-react"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassButton } from "@/components/ui/glass-button"
import {
  GlassDialog,
  GlassDialogContent,
  GlassDialogHeader,
  GlassDialogTitle,
  GlassDialogDescription,
  GlassDialogFooter,
} from "@/components/ui/glass-dialog"
import { toast } from "sonner"
import { api, Course } from "@/lib/api"

interface CreateCourseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateCourseForm({ open, onOpenChange, onSuccess }: CreateCourseFormProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    instructor: "",
    duration: "",
    modules: "",
    status: "" as "" | "active" | "inactive" | "completed" | "upcoming" | "ongoing" | "cancelled",
  })
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{
    name?: string
    description?: string
    instructor?: string
    duration?: string
    modules?: string
    status?: string
  }>({})

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Course name is required"
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Course name must be at least 3 characters"
    }

    if (formData.duration && (isNaN(Number(formData.duration)) || Number(formData.duration) < 0)) {
      newErrors.duration = "Duration must be a valid positive number (weeks)"
    }

    if (formData.modules && (isNaN(Number(formData.modules)) || Number(formData.modules) < 0)) {
      newErrors.modules = "Modules must be a valid positive number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [field]: e.target.value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const courseData: Omit<Course, "id" | "created_at" | "updated_at"> = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        instructor: formData.instructor.trim() || undefined,
        duration: formData.duration ? Number(formData.duration) : undefined,
        modules: formData.modules ? Number(formData.modules) : undefined,
        status: formData.status || undefined,
      }

      await api.courses.create(courseData)

      toast.success("Course created successfully!", {
        description: `${courseData.name} has been added to your courses.`,
      })

      // Reset form
      setFormData({
        name: "",
        description: "",
        instructor: "",
        duration: "",
        modules: "",
        status: "",
      })
      setErrors({})

      // Close dialog and refresh courses list
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      let errorMessage = "Failed to create course. Please try again."
      
      if (error?.message) {
        if (typeof error.message === "string") {
          errorMessage = error.message
        } else {
          errorMessage = JSON.stringify(error.message)
        }
      }
      
      toast.error("Failed to create course", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        description: "",
        instructor: "",
        duration: "",
        modules: "",
        status: "",
      })
      setErrors({})
      onOpenChange(false)
    }
  }

  return (
    <GlassDialog open={open} onOpenChange={handleClose}>
      <GlassDialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <GlassDialogHeader>
          <GlassDialogTitle className="text-2xl">Create New Course</GlassDialogTitle>
          <GlassDialogDescription>
            Fill in the details to create a new course. Only the course name is required.
          </GlassDialogDescription>
        </GlassDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassInput
              type="text"
              placeholder="Course name *"
              icon={<BookOpen className="h-4 w-4" />}
              value={formData.name}
              onChange={handleChange("name")}
              error={errors.name}
              required
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <textarea
              placeholder="Course description"
              value={formData.description}
              onChange={handleChange("description")}
              rows={3}
              className="w-full rounded-2xl px-5 py-3.5 bg-white/65 backdrop-blur-[24px] border border-white/60 text-sm text-[#1e3a5f] placeholder:text-[#94a3b8] outline-none focus:bg-white/85 focus:border-white/80 transition-all"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            />
            {errors.description && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-2 ml-2"
              >
                {errors.description}
              </motion.p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassInput
              type="text"
              placeholder="Instructor name"
              icon={<User className="h-4 w-4" />}
              value={formData.instructor}
              onChange={handleChange("instructor")}
              error={errors.instructor}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassInput
              type="number"
              placeholder="Duration (weeks)"
              icon={<Clock className="h-4 w-4" />}
              value={formData.duration}
              onChange={handleChange("duration")}
              error={errors.duration}
              min="0"
            />
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassInput
                type="number"
                placeholder="Number of modules"
                icon={<FileText className="h-4 w-4" />}
                value={formData.modules}
                onChange={handleChange("modules")}
                error={errors.modules}
                min="0"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="relative">
                <div
                  className="flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-all duration-300"
                  style={{
                    background: "rgba(255, 255, 255, 0.65)",
                    backdropFilter: "blur(24px) saturate(180%)",
                    WebkitBackdropFilter: "blur(24px) saturate(180%)",
                    border: "1px solid rgba(255, 255, 255, 0.6)",
                    boxShadow: "0 0 0 1px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
                  }}
                >
                  <Tag className="h-4 w-4 text-[#64748b] shrink-0" />
                  <select
                    value={formData.status}
                    onChange={handleChange("status")}
                    className="flex-1 bg-transparent outline-none text-[#1e3a5f] text-sm appearance-none cursor-pointer"
                  >
                    <option value="">Select status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                {errors.status && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 mt-2 ml-2"
                  >
                    {errors.status}
                  </motion.p>
                )}
              </div>
            </motion.div>
          </div>

          <GlassDialogFooter className="mt-6">
            <GlassButton
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              loading={loading}
            >
              Create Course
            </GlassButton>
          </GlassDialogFooter>
        </form>
      </GlassDialogContent>
    </GlassDialog>
  )
}

