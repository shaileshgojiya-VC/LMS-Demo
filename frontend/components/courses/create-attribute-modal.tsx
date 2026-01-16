"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { X } from "lucide-react"
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
import { api, CredFieldCreateRequest, CredFieldResponse } from "@/lib/api"

interface CreateAttributeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (field: CredFieldCreateRequest & { id?: number }) => Promise<void>
  editingField?: CredFieldCreateRequest & { id?: number }
}

const FIELD_TYPES = ["STRING", "EMAIL", "FLOAT", "DATE", "INTEGER", "BOOLEAN"] as const

export function CreateAttributeModal({ open, onOpenChange, onSave, editingField }: CreateAttributeModalProps) {
  const [formData, setFormData] = React.useState<CredFieldCreateRequest>({
    name: "",
    title: "",
    ftype: "STRING",
    description: "",
    is_required: false,
    is_mask: false,
    pattern: null,
    value: null,
    hint_text: null,
    sample: null,
    error_message: null,
  })
  
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{
    name?: string
    title?: string
    ftype?: string
    description?: string
  }>({})

  // Initialize form data when editing
  React.useEffect(() => {
    if (editingField) {
      setFormData({
        name: editingField.name || "",
        title: editingField.title || "",
        ftype: editingField.ftype || "STRING",
        description: editingField.description || "",
        is_required: editingField.is_required || false,
        is_mask: editingField.is_mask || false,
        pattern: editingField.pattern || null,
        value: editingField.value || null,
        hint_text: editingField.hint_text || null,
        sample: editingField.sample || null,
        error_message: editingField.error_message || null,
      })
    } else {
      // Reset form when creating new
      setFormData({
        name: "",
        title: "",
        ftype: "STRING",
        description: "",
        is_required: false,
        is_mask: false,
        pattern: null,
        value: null,
        hint_text: null,
        sample: null,
        error_message: null,
      })
    }
    setErrors({})
  }, [editingField, open])

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Attribute name is required"
    } else if (formData.name.length > 50) {
      newErrors.name = "Attribute name must be 50 characters or less"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Attribute name must be at least 2 characters"
    }

    // Ensure title is set and valid
    const currentTitle = formData.title?.trim() || formData.name.trim()
    if (!currentTitle || currentTitle.length < 2) {
      newErrors.title = "Title must be at least 2 characters. Use a descriptive name to avoid duplicates."
    }

    if (!formData.ftype) {
      newErrors.ftype = "Attribute type is required"
    }

    if (!formData.description || !formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length > 550) {
      newErrors.description = "Description must be 550 characters or less"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    console.log("Form submit triggered", { formData })

    if (!validateForm()) {
      console.log("Form validation failed", { errors })
      return
    }

    console.log("Form validation passed, proceeding with API call")

    setLoading(true)

    try {
      // EveryCred API derives 'name' from 'title' (normalizes: lowercase, spaces to underscores)
      // Ensure title is set to the full descriptive value (not a short abbreviation)
      const nameValue = formData.name.trim()
      // Use name as title if title is empty or too short (less than 2 chars)
      // This ensures we always send a proper title value
      const titleValue = (formData.title && formData.title.trim().length >= 2) 
        ? formData.title.trim() 
        : nameValue
      
      // Build field data matching the exact API format
      // Note: EveryCred API will derive 'name' from 'title', but we send both for schema compliance
      const fieldData: CredFieldCreateRequest = {
        name: nameValue, // Required by schema, but EveryCred will derive from title
        title: titleValue, // This is the primary field - must be the full descriptive value
        ftype: formData.ftype,
        description: formData.description?.trim() || null,
        is_required: formData.is_required || false,
        is_mask: formData.is_mask || false,
        is_preview: false,
        pattern: formData.pattern || null,
        value: formData.value || null,
        hint_text: formData.hint_text || null,
        sample: formData.sample || titleValue || null, // Use title as sample if sample not provided
        error_message: formData.error_message || null,
      }
      
      console.log("Creating field with data:", fieldData)
      
      // Call the API to create the field
      const response = await api.credentials.createSingleField(fieldData)
      
      console.log("Field creation response:", response)
      
      // Extract field ID from response
      // Response format: { status: "success", data: { id: 93, ... }, message: "..." }
      let fieldId: number | undefined
      let createdField: any = null
      
      if (response && response.data) {
        // If data is an object with id property (single field response)
        if (typeof response.data === 'object' && 'id' in response.data) {
          fieldId = (response.data as any).id as number
          createdField = response.data
        } 
        // If data is an array (bulk response format)
        else if (Array.isArray(response.data) && response.data.length > 0) {
          createdField = response.data[0]
          fieldId = createdField.id
        }
        // Try nested structure
        else if (response.data && typeof response.data === 'object') {
          const data = response.data as any
          if (data.id) {
            fieldId = data.id
            createdField = data
          } else if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            createdField = data.data[0]
            fieldId = createdField.id
          }
        }
      }
      
      console.log("Extracted field ID:", fieldId)
      console.log("Created field:", createdField)
      
      // Call onSave with the created field including the ID
      await onSave({ ...fieldData, id: fieldId })
      
      toast.success(editingField ? "Attribute updated successfully!" : "Attribute created successfully!")
      
      // Reset form
      setFormData({
        name: "",
        title: "",
        ftype: "STRING",
        description: "",
        is_required: false,
        is_mask: false,
        pattern: null,
        value: null,
        hint_text: null,
        sample: null,
        error_message: null,
      })
      setErrors({})
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error creating field:", error)
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        data: error?.response?.data,
      })
      
      let errorMessage = editingField ? "Failed to update attribute." : "Failed to create attribute."
      
      // Check for duplicate field error
      const errorDetail = error?.response?.data?.detail || error?.message || ""
      const errorDetailStr = typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail)
      
      if (errorDetailStr.includes("Existing credential field") || 
          errorDetailStr.includes("not credated or updated") ||
          errorDetailStr.includes("duplicate")) {
        errorMessage = `A field with the name "${titleValue}" or title "${titleValue}" already exists. Please use a different name or edit the existing field.`
      } else if (error?.response?.data?.detail) {
        errorMessage = typeof error.response.data.detail === 'string' 
          ? error.response.data.detail 
          : JSON.stringify(error.response.data.detail)
      } else if (error?.response?.data?.message) {
        errorMessage = typeof error.response.data.message === 'string'
          ? error.response.data.message
          : JSON.stringify(error.response.data.message)
      } else if (error?.message) {
        errorMessage = typeof error.message === "string" 
          ? error.message 
          : JSON.stringify(error.message)
      }
      
      toast.error("Failed to create attribute", {
        description: errorMessage,
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        title: "",
        ftype: "STRING",
        description: "",
        is_required: false,
        is_mask: false,
        pattern: null,
        value: null,
        hint_text: null,
        sample: null,
        error_message: null,
      })
      setErrors({})
      onOpenChange(false)
    }
  }

  return (
    <GlassDialog open={open} onOpenChange={handleClose}>
      <GlassDialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <GlassDialogHeader>
          <GlassDialogTitle className="text-xl sm:text-2xl">
            {editingField ? "Edit Attribute" : "Create New Attribute"}
          </GlassDialogTitle>
          <GlassDialogDescription>
            {editingField 
              ? "Update the attribute details below."
              : "Define a new attribute for your subject. All fields marked with * are required."}
          </GlassDialogDescription>
        </GlassDialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <GlassInput
              type="text"
              placeholder="Attribute Name *"
              value={formData.name}
              onChange={(e) => {
                const nameValue = e.target.value
                setFormData(prev => ({ 
                  ...prev, 
                  name: nameValue,
                  title: nameValue // Always sync title with name (EveryCred derives name from title)
                }))
                if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                if (errors.title) setErrors(prev => ({ ...prev, title: undefined }))
              }}
              error={errors.name}
              required
              maxLength={50}
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground ml-2">e.g. Completion Certificate</span>
              <span className="text-xs text-muted-foreground">
                {formData.name.length}/50
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-2">Attribute Type *</label>
            <select
              value={formData.ftype}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, ftype: e.target.value as CredFieldCreateRequest["ftype"] }))
                if (errors.ftype) setErrors(prev => ({ ...prev, ftype: undefined }))
              }}
              className="w-full rounded-2xl px-5 py-3.5 bg-white/65 backdrop-blur-[24px] border border-white/60 text-sm text-[#1e3a5f] outline-none focus:bg-white/85 focus:border-white/80 transition-all appearance-none pr-10"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <option value="">Select Field Type</option>
              {FIELD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.ftype && (
              <p className="text-xs text-red-500 mt-1 ml-2">{errors.ftype}</p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Description *"
              value={formData.description}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, description: e.target.value }))
                if (errors.description) setErrors(prev => ({ ...prev, description: undefined }))
              }}
              rows={4}
              className="w-full rounded-2xl px-5 py-3.5 bg-white/65 backdrop-blur-[24px] border border-white/60 text-sm text-[#1e3a5f] placeholder:text-[#94a3b8] outline-none focus:bg-white/85 focus:border-white/80 transition-all resize-none"
              style={{
                boxShadow: "0 0 0 1px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
              maxLength={550}
              required
            />
            <div className="flex items-center justify-between mt-1">
              {errors.description && (
                <p className="text-xs text-red-500 ml-2">{errors.description}</p>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {formData.description.length}/550
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_required}
                onChange={(e) => setFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-foreground">Required Field</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_mask}
                onChange={(e) => setFormData(prev => ({ ...prev, is_mask: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-foreground">Mask Field</span>
            </label>
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
              {editingField ? "Update" : "Save"}
            </GlassButton>
          </GlassDialogFooter>
        </form>
      </GlassDialogContent>
    </GlassDialog>
  )
}

