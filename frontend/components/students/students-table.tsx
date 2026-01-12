"use client"

import * as React from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassBadge } from "@/components/ui/glass-badge"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { motion } from "framer-motion"
import { Search, Filter, UserPlus, X, Pencil, Trash2, Loader2, Award } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { api, Student } from "@/lib/api"
import { useStudents } from "@/lib/hooks/use-api"
import { CreateStudentForm } from "./create-student-form"
import { EditStudentForm } from "./edit-student-form"
import { credentialStorage } from "@/lib/credential-storage"

interface StudentsTableProps {
  courseId?: string
  courseName?: string
}

export function StudentsTable({ courseId, courseName }: StudentsTableProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("")
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(null)
  const [deletingId, setDeletingId] = React.useState<number | null>(null)
  const [issuingCredentialId, setIssuingCredentialId] = React.useState<number | null>(null)

  // Use debounced search
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const courseIdNum = courseId ? Number(courseId) : undefined
  const { data: students, loading, error, refetch } = useStudents(
    0,
    1000,
    debouncedSearch || undefined,
    courseIdNum,
    statusFilter || undefined
  )

  const handleClearCourseFilter = () => {
    router.push("/students")
  }

  const handleAddNewStudent = () => {
    setCreateDialogOpen(true)
  }

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student)
    setEditDialogOpen(true)
  }

  const handleDeleteStudent = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.name}? This action cannot be undone.`)) {
      return
    }

    setDeletingId(student.id)
    try {
      await api.students.delete(student.id)
      toast.success("Student deleted successfully!", {
        description: `${student.name} has been removed.`,
      })
      refetch()
    } catch (error: any) {
      let errorMessage = "Failed to delete student. Please try again."
      if (error?.message) {
        if (typeof error.message === "string") {
          errorMessage = error.message
        } else {
          errorMessage = JSON.stringify(error.message)
        }
      }
      toast.error("Failed to delete student", {
        description: errorMessage,
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleSuccess = () => {
    refetch()
  }

  const getDegreeForProgram = (program: string | null | undefined): string => {
    if (!program) return "Bachelor of Technology"
    const degreeMap: Record<string, string> = {
      "Computer Science": "Bachelor of Technology",
      "Data Science": "Master of Science",
      "Cybersecurity": "Bachelor of Science",
      "AI & ML": "Master of Science",
      "Software Engineering": "Bachelor of Technology",
    }
    return degreeMap[program] || "Bachelor of Technology"
  }

  const handleIssueCredential = async (student: Student) => {
    setIssuingCredentialId(student.id)
    try {
      const data = await api.credentials.issue({
        student_name: student.name,
        student_email: student.email,
        degree: getDegreeForProgram(student.program),
        program: student.program || "General Studies",
        institution: "Demo University",
        issue_date: new Date().toISOString().split("T")[0],
        completion_date: student.completion_date || undefined,
        course_id: student.course_id || undefined,
        enrollment_date: student.enrollment_date || undefined,
      })

      // Store the credential for dashboard display
      credentialStorage.storeCredential({
        credential_id: data.credential_id,
        student_id: student.id.toString(),
        student_name: student.name,
        student_email: student.email,
        degree: getDegreeForProgram(student.program),
        program: student.program || "General Studies",
        institution: "Demo University",
        issue_date: new Date().toISOString().split("T")[0],
        verification_url: data.verification_url,
        status: "issued",
        issued_at: data.issued_at || new Date().toISOString(),
      })

      toast.success("Credential issued successfully!", {
        description: `Credential ID: ${data.credential_id}`,
      })

      // Dispatch custom event for other components
      window.dispatchEvent(new Event("credentialIssued"))
    } catch (error: any) {
      toast.error("Failed to issue credential", {
        description: error?.message || "Please try again later.",
      })
    } finally {
      setIssuingCredentialId(null)
    }
  }

  if (error) {
    return (
      <GlassCard interactive={false} className="p-8 rounded-sm">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading students: {error}</p>
          <GlassButton variant="primary" onClick={() => refetch()}>
            Retry
          </GlassButton>
        </div>
      </GlassCard>
    )
  }

  return (
    <>
      <GlassCard interactive={false} className="p-0 overflow-hidden rounded-sm">
        {/* Header */}
        <div className="p-5 border-b border-border/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground">
                {courseName ? `Students in ${courseName}` : "All Students"}
              </h3>
              {courseName && (
                <GlassButton
                  variant="secondary"
                  size="sm"
                  onClick={handleClearCourseFilter}
                  className="h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear filter
                </GlassButton>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {loading ? "Loading..." : `${students?.length || 0} ${courseName ? "enrolled" : "total"} students`}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-64">
              <GlassInput
                placeholder="Search students..."
                icon={<Search className="h-4 w-4" />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
                <Filter className="h-4 w-4 text-[#64748b] shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-[#1e3a5f] text-sm appearance-none cursor-pointer min-w-[120px]"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <GlassButton variant="primary" icon={<UserPlus className="h-4 w-4" />} onClick={handleAddNewStudent}>
              Add Student
            </GlassButton>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading students...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && (!students || students.length === 0) && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter || courseId
                ? "No students found matching your filters."
                : "No students found. Add your first student to get started."}
            </p>
            {!searchQuery && !statusFilter && !courseId && (
              <GlassButton variant="primary" icon={<UserPlus className="h-4 w-4" />} onClick={handleAddNewStudent}>
                Add First Student
              </GlassButton>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && students && students.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30 bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                    Student
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                    Program
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                    Enrollment Date
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {students.map((student, index) => {
                  const initials = student.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                  return (
                    <motion.tr
                      key={student.id}
                      className="hover:bg-muted/30 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`/placeholder.svg?height=40&width=40&query=${student.name} portrait`}
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-foreground">{student.program || "—"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <GlassBadge
                          variant={
                            student.status === "active"
                              ? "success"
                              : student.status === "completed"
                                ? "success"
                                : "default"
                          }
                        >
                          {student.status || "—"}
                        </GlassBadge>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-foreground">
                          {student.enrollment_date
                            ? new Date(student.enrollment_date).toLocaleDateString()
                            : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <GlassButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleIssueCredential(student)}
                            loading={issuingCredentialId === student.id}
                            icon={<Award className="h-4 w-4" />}
                          >
                            Issue Credentials
                          </GlassButton>
                          <GlassButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                            icon={<Pencil className="h-4 w-4" />}
                          >
                            Edit
                          </GlassButton>
                          <GlassButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDeleteStudent(student)}
                            loading={deletingId === student.id}
                            icon={<Trash2 className="h-4 w-4" />}
                          >
                            Delete
                          </GlassButton>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Create Student Dialog */}
      <CreateStudentForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleSuccess}
      />

      {/* Edit Student Dialog */}
      <EditStudentForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        student={selectedStudent}
        onSuccess={handleSuccess}
      />
    </>
  )
}
