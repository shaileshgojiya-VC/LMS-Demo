"use client"

import * as React from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { motion } from "framer-motion"
import { Award, Eye, Pencil, Loader2, Plus, X } from "lucide-react"
import {
  everycredRecordsListService,
  type EveryCREDRecordField,
} from "@/lib/everycred-records-list-service"
import { type SubjectField } from "@/lib/api"
import { toast } from "sonner"
import { everycredSubjectsService } from "@/lib/everycred-subjects-service"
import {
  GlassDialog,
  GlassDialogContent,
  GlassDialogDescription,
  GlassDialogHeader,
  GlassDialogTitle,
} from "@/components/ui/glass-dialog"
import { DynamicRecordForm, type RecordFormField } from "@/components/students/dynamic-record-form"
import { everycredCredentialsIssueService } from "@/lib/everycred-credentials-issue-service"

function getCellValue(row: any, fieldId: string): React.ReactNode {
  const value =
    row?.[fieldId] ??
    row?.record_slug?.[fieldId] ??
    row?.slug?.[fieldId] ??
    row?.subject_fields?.[fieldId]
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export function SubjectRecordsTable({
  subjectId,
  issuerId,
}: {
  subjectId: number
  issuerId: number
}) {
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [rows, setRows] = React.useState<any[]>([])
  const [fields, setFields] = React.useState<EveryCREDRecordField[]>([])
  const [isAddingRecord, setIsAddingRecord] = React.useState(false)
  const [loadingFields, setLoadingFields] = React.useState(false)
  const [subjectFields, setSubjectFields] = React.useState<RecordFormField[]>([])
  const [issuingRecordId, setIssuingRecordId] = React.useState<number | null>(null)

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await everycredRecordsListService.listRecords({
        page: 1,
        size: 10,
        subject_id: subjectId,
        issuer_id: issuerId,
        status_filter: "draft",
      })
      const sortedFields = [...(res.fields || [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      )
      setFields(sortedFields)
      setRows(res.list || [])
    } catch (e: any) {
      setError(e?.message || "Failed to load records.")
      setFields([])
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [issuerId, subjectId])

  const fetchSubjectFields = React.useCallback(async () => {
    setLoadingFields(true)
    try {
      const subject = await everycredSubjectsService.getSubject(subjectId)
      const fieldsFromSubject = (subject as any)?.subject_fields
      if (Array.isArray(fieldsFromSubject)) {
        const mapped: RecordFormField[] = fieldsFromSubject.map((f: any) => ({
          name: String(f?.name ?? ""),
          title: String(f?.title ?? f?.name ?? ""),
          ftype: String(f?.ftype ?? "STRING"),
          is_required: Boolean(f?.is_required),
          hint_text: f?.hint_text ?? null,
          sample: f?.sample ?? null,
        }))
        mapped.sort((a: any, b: any) => (a?.sequence_number ?? 0) - (b?.sequence_number ?? 0))
        setSubjectFields(mapped.filter((x) => x.name))
      } else {
        setSubjectFields([])
      }
    } catch (e: any) {
      toast.error("Failed to load subject fields", {
        description: e?.message || "Please try again later.",
      })
      setSubjectFields([])
    } finally {
      setLoadingFields(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <GlassCard interactive={false} className="p-8 rounded-sm">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading records...
        </div>
      </GlassCard>
    )
  }

  if (error) {
    return (
      <GlassCard interactive={false} className="p-8 rounded-sm">
        <p className="text-destructive">{error}</p>
        <div className="mt-4">
          <GlassButton variant="secondary" onClick={load}>
            Try Again
          </GlassButton>
        </div>
      </GlassCard>
    )
  }

  const previewFields = fields.filter((f) => f.is_preview !== false)

  const handleIssueCertification = async (row: any) => {
    const recordId = Number(row?.id)
    if (!recordId || Number.isNaN(recordId)) return
    if (String(row?.status || "").toLowerCase() !== "draft") return

    if (issuingRecordId !== null) return

    try {
      setIssuingRecordId(recordId)
      await everycredCredentialsIssueService.issueFromRecord({
        record_id: recordId,
        subject_id: Number(row?.subject_id ?? subjectId),
        issuer_id: issuerId,
        email_to_holder: true,
      })
      toast.success("Certification issued successfully.")
      await load()
    } catch (e: any) {
      toast.error("Failed to issue certification", {
        description: e?.message || "Please try again.",
      })
    } finally {
      setIssuingRecordId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <GlassButton
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => {
            setIsAddingRecord(true)
            fetchSubjectFields()
          }}
          disabled={loadingFields}
        >
          Create Record
        </GlassButton>
      </div>

      <GlassDialog
        open={isAddingRecord}
        onOpenChange={(open) => {
          setIsAddingRecord(open)
          if (!open) {
            setSubjectFields([])
          }
        }}
      >
        <GlassDialogContent className="max-w-xl overflow-hidden">
          <GlassDialogHeader>
            <GlassDialogTitle>Add Record</GlassDialogTitle>
            <GlassDialogDescription>
              Fill in the required fields and save to create a new record.
            </GlassDialogDescription>
          </GlassDialogHeader>

          {loadingFields ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading subject fields...
            </div>
          ) : (
            <DynamicRecordForm
              subjectId={subjectId}
              issuerId={issuerId}
              fields={subjectFields}
              onSaved={() => {
                setIsAddingRecord(false)
                setSubjectFields([])
                load()
              }}
              onCancel={() => {
                setIsAddingRecord(false)
                setSubjectFields([])
              }}
            />
          )}
        </GlassDialogContent>
      </GlassDialog>

      <GlassCard interactive={false} className="p-0 overflow-hidden rounded-sm">
      <div className="overflow-x-auto -mx-1 sm:mx-0">
        <table className="w-full min-w-[760px] sm:min-w-0">
          <thead>
            <tr className="border-b border-border/30 bg-muted/30">
              {previewFields.map((field) => (
                <th
                  key={field.id}
                  className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3"
                >
                  {field.title}
                </th>
              ))}
              <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 sm:px-5 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {rows.length === 0 ? (
              <tr>
                <td
                  className="px-3 sm:px-5 py-8 text-center text-muted-foreground"
                  colSpan={previewFields.length + 1}
                >
                  No records found for this training program.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <motion.tr
                  key={row?.id ?? index}
                  className="hover:bg-muted/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {previewFields.map((field) => (
                    <td key={field.id} className="px-3 sm:px-5 py-4 text-sm">
                      {getCellValue(row, field.id)}
                    </td>
                  ))}
                  <td className="px-3 sm:px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <GlassButton
                        variant="primary"
                        size="sm"
                        icon={<Award className="h-4 w-4" />}
                        onClick={() => handleIssueCertification(row)}
                        loading={issuingRecordId === Number(row?.id)}
                      >
                        Issue
                      </GlassButton>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        icon={<Eye className="h-4 w-4" />}
                        onClick={() => console.log("preview", row)}
                      >
                        Preview
                      </GlassButton>
                      <GlassButton
                        variant="secondary"
                        size="sm"
                        icon={<Pencil className="h-4 w-4" />}
                        onClick={() => console.log("edit", row)}
                      >
                        Edit
                      </GlassButton>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </GlassCard>
    </div>
  )
}

