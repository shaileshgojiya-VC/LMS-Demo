"use client"

import * as React from "react"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Check, X, Loader2 } from "lucide-react"
import { SubjectField } from "@/lib/api"
import { createRecord } from "@/lib/everycred-record-service"
import { toast } from "sonner"
import { motion } from "framer-motion"

interface DynamicRecordTableProps {
  subjectFields: SubjectField[]
  subjectId: number
  students: any[]
  onRecordCreated: () => void
  onCancel: () => void
}

export function DynamicRecordTable({
  subjectFields,
  subjectId,
  students,
  onRecordCreated,
  onCancel,
}: DynamicRecordTableProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Initialize form data with empty values
  React.useEffect(() => {
    const initialData: Record<string, any> = {}
    subjectFields.forEach((field) => {
      initialData[field.name] = field.ftype === "BOOLEAN" ? false : ""
    })
    setFormData(initialData)
  }, [subjectFields])

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Build subject_fields object with field names as keys
      const subjectFieldsData: Record<string, any> = {}
      subjectFields.forEach((field) => {
        const value = formData[field.name]
        // Convert boolean to string if needed, or keep as is
        if (field.ftype === "BOOLEAN") {
          subjectFieldsData[field.name] = value ? "true" : "false"
        } else if (value !== "" && value !== null && value !== undefined) {
          subjectFieldsData[field.name] = value
        }
      })

      await createRecord(subjectId, subjectFieldsData)

      toast.success("Record created successfully!", {
        description: "The record has been added to EveryCRED.",
      })

      // Clear form and refresh
      const initialData: Record<string, any> = {}
      subjectFields.forEach((field) => {
        initialData[field.name] = field.ftype === "BOOLEAN" ? false : ""
      })
      setFormData(initialData)

      onRecordCreated()
    } catch (error: any) {
      toast.error("Failed to create record", {
        description: error?.message || "Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    const initialData: Record<string, any> = {}
    subjectFields.forEach((field) => {
      initialData[field.name] = field.ftype === "BOOLEAN" ? false : ""
    })
    setFormData(initialData)
    onCancel()
  }

  const renderInput = (field: SubjectField) => {
    const value = formData[field.name] ?? ""
    const placeholder = field.sample || field.hint_text || `Enter ${field.title.toLowerCase()}`

    switch (field.ftype) {
      case "EMAIL":
        return (
          <GlassInput
            type="email"
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full min-w-[120px] sm:min-w-[150px]"
          />
        )

      case "FLOAT":
        return (
          <GlassInput
            type="number"
            step="0.01"
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full min-w-[120px]"
          />
        )

      case "INTEGER":
        return (
          <GlassInput
            type="number"
            step="1"
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full min-w-[120px]"
          />
        )

      case "DATE":
        return (
          <GlassInput
            type="date"
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full min-w-[120px] sm:min-w-[150px]"
          />
        )

      case "BOOLEAN":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value === true || value === "true"}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
          </div>
        )

      case "STRING":
      default:
        return (
          <GlassInput
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full min-w-[120px] sm:min-w-[150px]"
          />
        )
    }
  }

  // Determine if we need horizontal scrolling (more than 10 fields)
  const needsScrolling = subjectFields.length > 10
  // Responsive table width: smaller columns on mobile (140px), larger on desktop (180px)
  // Minimum width: 600px on mobile, 800px on desktop (handled via CSS)
  const minTableWidth = Math.max(subjectFields.length * 180, 800) // Desktop default

  if (subjectFields.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p>No fields configured for this subject.</p>
      </div>
    )
  }

  return (
    <GlassCard interactive={false} className="p-0 overflow-hidden">
      <div className={`overflow-x-auto ${needsScrolling ? "max-w-full" : ""}`}>
        <table
          className="w-full"
          style={needsScrolling ? { minWidth: `${minTableWidth}px` } : {}}
        >
          <thead>
            <tr className="border-b border-border/30 bg-muted/20">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4 sticky left-0 bg-muted/20 backdrop-blur-sm z-20 min-w-[60px] border-r border-border/20">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary focus:ring-2 cursor-pointer" 
                />
              </th>
              {subjectFields.map((field) => (
                <th
                  key={field.name}
                  className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 sm:px-6 py-3 sm:py-4 min-w-[120px] sm:min-w-[180px] whitespace-nowrap"
                >
                  {field.title}
                </th>
              ))}
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 sm:px-6 py-3 sm:py-4 sticky right-0 bg-muted/20 backdrop-blur-sm z-20 min-w-[120px] sm:min-w-[180px] border-l border-border/20">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {/* Editable Input Row */}
            <motion.tr
              className="bg-primary/8 hover:bg-primary/12 transition-all duration-200 border-b-2 border-primary/20"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <td className="px-4 sm:px-6 py-4 sm:py-5 sticky left-0 bg-primary/8 backdrop-blur-sm z-10 border-r border-border/20">
                <input 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary focus:ring-2 cursor-pointer" 
                />
              </td>
              {subjectFields.map((field) => (
                <td key={field.name} className="px-4 sm:px-6 py-4 sm:py-5">
                  <div className="w-full">
                    {renderInput(field)}
                  </div>
                </td>
              ))}
              <td className="px-4 sm:px-6 py-4 sm:py-5 sticky right-0 bg-primary/8 backdrop-blur-sm z-10 border-l border-border/20">
                <div className="flex items-center justify-end gap-3">
                  <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    disabled={isSubmitting}
                    className="min-w-[80px]"
                  >
                    {isSubmitting ? "Saving..." : "Done"}
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={handleCancel}
                    icon={<X className="h-4 w-4" />}
                    disabled={isSubmitting}
                    className="min-w-[80px]"
                  >
                    Cancel
                  </GlassButton>
                </div>
              </td>
            </motion.tr>

            {/* Existing Student Rows */}
            {students.map((student, index) => (
              <motion.tr
                key={student.id || index}
                className="hover:bg-muted/20 transition-colors duration-150 bg-white/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <td className="px-6 py-4 sticky left-0 bg-white/50 backdrop-blur-sm z-10 border-r border-border/20">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-border/50 text-primary focus:ring-primary focus:ring-2 cursor-pointer" 
                  />
                </td>
                {subjectFields.map((field) => {
                  // Map student data to field names
                  const fieldValue = student[field.name] || student[field.name.toLowerCase()] || student[field.name.toUpperCase()] || "—"
                  return (
                    <td key={field.name} className="px-6 py-4">
                      <span className="text-sm font-medium text-foreground">
                        {field.ftype === "DATE" && fieldValue !== "—"
                          ? new Date(fieldValue).toLocaleDateString()
                          : String(fieldValue)}
                      </span>
                    </td>
                  )
                })}
                <td className="px-6 py-4 sticky right-0 bg-white/50 backdrop-blur-sm z-10 border-l border-border/20">
                  {/* Actions can be added here if needed */}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  )
}

