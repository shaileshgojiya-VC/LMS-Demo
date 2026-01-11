"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { User, Mail, BookOpen, Calendar, Tag } from "lucide-react"
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
import { api, Student } from "@/lib/api"
import { useCourses } from "@/lib/hooks/use-api"

interface EditStudentFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    student: Student | null
    onSuccess?: () => void
}

export function EditStudentForm({ open, onOpenChange, student, onSuccess }: EditStudentFormProps) {
    const { data: courses } = useCourses()
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        program: "",
        status: "" as "" | "active" | "inactive" | "completed" | "suspended",
        course_id: "",
        enrollment_date: "",
        completion_date: "",
    })
    const [loading, setLoading] = React.useState(false)
    const [errors, setErrors] = React.useState<{
        name?: string
        email?: string
        program?: string
        status?: string
        course_id?: string
        enrollment_date?: string
        completion_date?: string
    }>({})

    React.useEffect(() => {
        if (student && open) {
            setFormData({
                name: student.name || "",
                email: student.email || "",
                program: student.program || "",
                status: (student.status || "") as "" | "active" | "inactive" | "completed" | "suspended",
                course_id: student.course_id?.toString() || "",
                enrollment_date: student.enrollment_date || "",
                completion_date: student.completion_date || "",
            })
        }
    }, [student, open])

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {}

        if (!formData.name.trim()) {
            newErrors.name = "Student name is required"
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Student name must be at least 2 characters"
        }

        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Please enter a valid email address"
        }

        if (formData.course_id && (isNaN(Number(formData.course_id)) || Number(formData.course_id) <= 0)) {
            newErrors.course_id = "Please select a valid course"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({ ...formData, [field]: e.target.value })
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm() || !student) {
            return
        }

        setLoading(true)

        try {
            const studentData: Partial<Omit<Student, "id" | "created_at" | "updated_at">> = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                program: formData.program.trim() || undefined,
                status: formData.status || undefined,
                course_id: formData.course_id ? Number(formData.course_id) : undefined,
                enrollment_date: formData.enrollment_date || undefined,
                completion_date: formData.completion_date || undefined,
            }

            await api.students.update(student.id, studentData)

            toast.success("Student updated successfully!", {
                description: `${studentData.name} has been updated.`,
            })

            setErrors({})

            onOpenChange(false)
            if (onSuccess) {
                onSuccess()
            }
        } catch (error: any) {
            let errorMessage = "Failed to update student. Please try again."
            
            if (error?.message) {
                if (typeof error.message === "string") {
                    errorMessage = error.message
                } else {
                    errorMessage = JSON.stringify(error.message)
                }
            }
            
            toast.error("Failed to update student", {
                description: errorMessage,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) {
            setErrors({})
            onOpenChange(false)
        }
    }

    if (!student) return null

    return (
        <GlassDialog open={open} onOpenChange={handleClose}>
            <GlassDialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <GlassDialogHeader>
                    <GlassDialogTitle className="text-2xl">Edit Student</GlassDialogTitle>
                    <GlassDialogDescription>
                        Update the student details below. Name and email are required.
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
                            placeholder="Student name *"
                            icon={<User className="h-4 w-4" />}
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
                        <GlassInput
                            type="email"
                            placeholder="Email address *"
                            icon={<Mail className="h-4 w-4" />}
                            value={formData.email}
                            onChange={handleChange("email")}
                            error={errors.email}
                            required
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <GlassInput
                            type="text"
                            placeholder="Program"
                            icon={<BookOpen className="h-4 w-4" />}
                            value={formData.program}
                            onChange={handleChange("program")}
                            error={errors.program}
                        />
                    </motion.div>

                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
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
                                        <option value="completed">Completed</option>
                                        <option value="suspended">Suspended</option>
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

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
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
                                    <BookOpen className="h-4 w-4 text-[#64748b] shrink-0" />
                                    <select
                                        value={formData.course_id}
                                        onChange={handleChange("course_id")}
                                        className="flex-1 bg-transparent outline-none text-[#1e3a5f] text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="">Select course (optional)</option>
                                        {courses?.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {errors.course_id && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-xs text-red-500 mt-2 ml-2"
                                    >
                                        {errors.course_id}
                                    </motion.p>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <GlassInput
                                type="date"
                                placeholder="Enrollment date"
                                icon={<Calendar className="h-4 w-4" />}
                                value={formData.enrollment_date}
                                onChange={handleChange("enrollment_date")}
                                error={errors.enrollment_date}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <GlassInput
                                type="date"
                                placeholder="Completion date"
                                icon={<Calendar className="h-4 w-4" />}
                                value={formData.completion_date}
                                onChange={handleChange("completion_date")}
                                error={errors.completion_date}
                            />
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
                            Update Student
                        </GlassButton>
                    </GlassDialogFooter>
                </form>
            </GlassDialogContent>
        </GlassDialog>
    )
}

