"use client"

import * as React from "react"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassButton } from "@/components/ui/glass-button"
import { toast } from "sonner"
import { createRecord } from "@/lib/everycred-record-service"

export type RecordFormField = {
  name: string
  title: string
  ftype: string
  is_required?: boolean
  hint_text?: string | null
  sample?: string | null
}

function inputType(ftype: string): "text" | "email" | "number" | "date" {
  switch (ftype?.toUpperCase?.()) {
    case "EMAIL":
      return "email"
    case "INTEGER":
    case "FLOAT":
      return "number"
    case "DATE":
      return "date"
    default:
      return "text"
  }
}

export function DynamicRecordForm({
  subjectId,
  issuerId,
  fields,
  onSaved,
  onCancel,
}: {
  subjectId: number
  issuerId: number
  fields: RecordFormField[]
  onSaved: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  React.useEffect(() => {
    const initial: Record<string, string> = {}
    fields.forEach((f) => {
      initial[f.name] = ""
    })
    setFormData(initial)
    setErrors({})
  }, [fields])

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {}
    for (const f of fields) {
      if (f.is_required && !String(formData[f.name] ?? "").trim()) {
        nextErrors[f.name] = `${f.title || f.name} is required`
      }
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSubmitting(true)
    try {
      const subjectFieldsData: Record<string, any> = {}
      for (const f of fields) {
        const v = String(formData[f.name] ?? "").trim()
        if (v !== "") {
          subjectFieldsData[f.name] = v
        }
      }
      await createRecord(subjectId, subjectFieldsData, issuerId)
      toast.success("Record created successfully!")
      onSaved()
    } catch (e: any) {
      toast.error("Failed to create record", {
        description: e?.message || "Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {fields.map((f) => {
          const label = f.title || f.name
          const required = Boolean(f.is_required)
          const placeholder =
            f.hint_text || f.sample || `Enter ${label}`

          return (
            <div key={f.name} className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {label} {required ? <span className="text-destructive">*</span> : null}
              </label>
              <GlassInput
                type={inputType(f.ftype)}
                placeholder={placeholder}
                value={formData[f.name] ?? ""}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, [f.name]: e.target.value }))
                  if (errors[f.name]) {
                    setErrors((p) => {
                      const next = { ...p }
                      delete next[f.name]
                      return next
                    })
                  }
                }}
                error={errors[f.name]}
              />
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-end gap-3 pt-1">
        <GlassButton variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancel
        </GlassButton>
        <GlassButton variant="primary" onClick={handleSave} loading={submitting}>
          Save
        </GlassButton>
      </div>
    </div>
  )
}

