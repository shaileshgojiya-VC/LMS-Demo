"use client"

import * as React from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassBadge } from "@/components/ui/glass-badge"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { motion } from "framer-motion"
import { Search, Filter, MoreHorizontal, Mail, Award } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const students = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.j@university.edu",
    program: "Computer Science",
    status: "active",
    progress: 95,
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@university.edu",
    program: "Data Science",
    status: "active",
    progress: 78,
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.d@university.edu",
    program: "Cybersecurity",
    status: "active",
    progress: 100,
  },
  {
    id: "4",
    name: "James Wilson",
    email: "j.wilson@university.edu",
    program: "AI & ML",
    status: "inactive",
    progress: 45,
  },
  {
    id: "5",
    name: "Olivia Martinez",
    email: "o.martinez@university.edu",
    program: "Software Engineering",
    status: "active",
    progress: 88,
  },
  {
    id: "6",
    name: "William Brown",
    email: "w.brown@university.edu",
    program: "Computer Science",
    status: "active",
    progress: 100,
  },
]

export function StudentsTable() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.program.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <GlassCard interactive={false} className="p-0 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/30 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">All Students</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{students.length} total students</p>
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
          <GlassButton variant="secondary" icon={<Filter className="h-4 w-4" />}>
            Filter
          </GlassButton>
        </div>
      </div>

      {/* Table */}
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
                Progress
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredStudents.map((student, index) => {
              const initials = student.name
                .split(" ")
                .map((n) => n[0])
                .join("")
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
                          src={`/.jpg?height=40&width=40&query=${student.name} portrait`}
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
                    <span className="text-sm text-foreground">{student.program}</span>
                  </td>
                  <td className="px-5 py-4">
                    <GlassBadge variant={student.status === "active" ? "success" : "default"}>
                      {student.status}
                    </GlassBadge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-24">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${student.progress}%` }}
                          transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-10">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <GlassButton variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </GlassButton>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass">
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" /> Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={student.progress < 100}>
                          <Award className="h-4 w-4 mr-2" /> Issue Credential
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}
