"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Upload, X, Plus, Trash2, Pencil, Info, Check, ChevronRight, ChevronLeft } from "lucide-react"
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
import { api, SubjectCreateRequest, CredFieldCreateRequest, CredFieldResponse } from "@/lib/api"
import { CreateAttributeModal } from "./create-attribute-modal"

interface CreateCourseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

type Step = 1 | 2 | 3

const STEPS = [
  { id: 1, title: "Info & Credential Details", description: "Set up basic information" },
  { id: 2, title: "Attributes", description: "Configure subject attributes" },
  { id: 3, title: "Review", description: "Review and submit" },
] as const

export function CreateCourseForm({ open, onOpenChange, onSuccess }: CreateCourseFormProps) {
  const [currentStep, setCurrentStep] = React.useState<Step>(1)
  const [formData, setFormData] = React.useState<SubjectCreateRequest>({
    name: "",
    title: "",
    description: "",
    logo: undefined,
    group_id: 19,
    theme_id: 1,
    template_id: null,
    subject_field_ids: [],
  })
  
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{
    name?: string
    title?: string
    description?: string
    attributes?: string
  }>({})

  // Store credential fields with their actual field IDs
  const [credentialFields, setCredentialFields] = React.useState<(CredFieldCreateRequest & { id?: number })[]>([])
  const [selectedFieldIds, setSelectedFieldIds] = React.useState<Set<number>>(new Set()) // Store actual field IDs, not indices
  const [createAttributeModalOpen, setCreateAttributeModalOpen] = React.useState(false)
  const [editingField, setEditingField] = React.useState<(CredFieldCreateRequest & { id?: number }) | undefined>(undefined)
  
  // Store existing fields fetched from API
  const [existingFields, setExistingFields] = React.useState<CredFieldResponse[]>([])
  const [loadingExistingFields, setLoadingExistingFields] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  // Fetch existing credential fields from group API when step 2 is opened
  React.useEffect(() => {
    const fetchExistingFields = async () => {
      if (currentStep === 2 && open) {
        setLoadingExistingFields(true)
        try {
          // Call the group-fields endpoint which uses issuer_id=15
          const response = await api.credentials.getGroupFields(searchQuery)
          if (response?.data?.list) {
            setExistingFields(response.data.list)
          } else {
            setExistingFields([])
          }
        } catch (error) {
          console.error("Failed to fetch existing fields from group API:", error)
          setExistingFields([])
          // Don't show error toast - just log it
        } finally {
          setLoadingExistingFields(false)
        }
      }
    }
    fetchExistingFields()
  }, [currentStep, open, searchQuery])

  // Function to add existing field to selected fields
  const handleSelectExistingField = (field: CredFieldResponse) => {
    // Check if field is already in credentialFields
    const exists = credentialFields.some(f => f.id === field.id)
    if (!exists) {
      // Add to credentialFields
      const newField: CredFieldCreateRequest & { id: number } = {
        name: field.name,
        title: field.title,
        ftype: field.ftype as CredFieldCreateRequest["ftype"],
        description: field.description || null,
        hint_text: field.hint_text || null,
        sample: field.sample || null,
        error_message: field.error_message || null,
        pattern: field.pattern || null,
        value: field.value || null,
        is_required: field.is_required || false,
        is_preview: field.is_preview || false,
        is_mask: field.is_mask || false,
        id: field.id,
      }
      setCredentialFields(prev => [...prev, newField])
      setSelectedFieldIds(prev => new Set([...prev, field.id]))
      toast.success(`Field "${field.title}" added successfully`)
    } else {
      // Toggle selection if already exists
      if (selectedFieldIds.has(field.id)) {
        setSelectedFieldIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(field.id)
          return newSet
        })
      } else {
        setSelectedFieldIds(prev => new Set([...prev, field.id]))
      }
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo file is too large. Maximum size is 5MB.")
        return
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file.")
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
        setFormData(prev => ({ ...prev, logo: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setFormData(prev => ({ ...prev, logo: undefined }))
  }

  const handleSaveAttribute = async (field: CredFieldCreateRequest & { id?: number }) => {
    if (editingField && editingField.id !== undefined) {
      // Update existing field - find by actual field ID
      const fieldIndex = credentialFields.findIndex(f => f.id === editingField.id)
      if (fieldIndex >= 0 && fieldIndex < credentialFields.length) {
        const existingField = credentialFields[fieldIndex]
        const updatedFields = credentialFields.map((f, idx) => 
          idx === fieldIndex ? { ...field, id: field.id || existingField.id } : f
        )
        setCredentialFields(updatedFields)
        // Update selectedFieldIds if the field ID changed
        if (existingField.id && field.id && existingField.id !== field.id) {
          setSelectedFieldIds(prev => {
            const newSet = new Set(prev)
            newSet.delete(existingField.id!)
            newSet.add(field.id!)
            return newSet
          })
        } else if (existingField.id && !selectedFieldIds.has(existingField.id)) {
          // Ensure the field remains selected if it was selected before
          setSelectedFieldIds(prev => new Set([...prev, existingField.id!]))
        }
      }
    } else {
      // Add new field with API ID (field.id is the actual field ID from API)
      if (!field.id) {
        console.error("Field ID is missing from API response")
        throw new Error("Failed to get field ID from API response")
      }
      
      const newField = { 
        ...field, 
        id: field.id // Use actual API field ID
      }
      setCredentialFields(prev => {
        const newFields = [...prev, newField]
        return newFields
      })
      // Auto-select the newly created field using its actual ID
      if (field.id) {
        setSelectedFieldIds(prevIds => new Set([...prevIds, field.id!]))
      }
    }
    setEditingField(undefined)
  }

  const handleEditField = (index: number) => {
    const field = credentialFields[index]
    setEditingField({ ...field }) // Use the actual field with its ID
    setCreateAttributeModalOpen(true)
  }

  const handleDeleteField = (index: number) => {
    const field = credentialFields[index]
    if (field?.id) {
      setSelectedFieldIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(field.id!)
        return newSet
      })
    }
    setCredentialFields(prev => prev.filter((_, i) => i !== index))
  }

  const toggleFieldSelection = (fieldId: number) => {
    if (!fieldId || fieldId <= 0) {
      console.warn("Cannot select field with invalid ID:", fieldId)
      return
    }
    setSelectedFieldIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId)
      } else {
        newSet.add(fieldId)
      }
      return newSet
    })
  }

  const validateStep1 = (): boolean => {
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Subject name is required"
    } else if (formData.name.length > 100) {
      newErrors.name = "Subject name must be 100 characters or less"
    }

    if (!formData.title.trim()) {
      newErrors.title = "Credential title is required"
    } else if (formData.title.length > 100) {
      newErrors.title = "Credential title must be 100 characters or less"
    }

    if (!formData.description || !formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length > 550) {
      newErrors.description = "Description must be 550 characters or less"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = (): boolean => {
    // Check if at least one field is selected
    if (selectedFieldIds.size === 0) {
      setErrors(prev => ({ ...prev, attributes: "At least one attribute must be selected" }))
      return false
    }
    setErrors(prev => ({ ...prev, attributes: undefined }))
    return true
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) {
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      if (!validateStep2()) {
        return
      }
      setCurrentStep(3)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateStep1() || !validateStep2()) {
      setCurrentStep(1)
      return
    }

    setLoading(true)

    try {
      // Collect all field IDs from fields that have been created and are selected
      // Filter out invalid IDs (undefined, null, 0, or negative)
      const finalFieldIds = Array.from(selectedFieldIds)
        .filter(id => id !== undefined && id !== null && id > 0) as number[]

      if (finalFieldIds.length === 0) {
        throw new Error("No credential fields selected. Please create and select at least one field.")
      }

      console.log("Creating subject with field IDs:", finalFieldIds)
      console.log("Selected field IDs before filtering:", Array.from(selectedFieldIds))

      // Create subject with field IDs (all fields are user-created)
      const subjectData: SubjectCreateRequest = {
        name: formData.name,
        title: formData.title,
        description: formData.description,
        logo: formData.logo,
        group_id: formData.group_id,
        theme_id: formData.theme_id,
        template_id: formData.template_id,
        subject_field_ids: finalFieldIds,
      }

      console.log("Creating subject with field IDs:", finalFieldIds)
      await api.credentials.createSubject(subjectData)

      toast.success("Subject created successfully!", {
        description: `${formData.name} has been created in EveryCred.`,
      })

      // Reset form
      resetForm()

      // Close dialog and refresh courses list
      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      let errorMessage = "Failed to create subject. Please try again."
      
      if (error?.message) {
        if (typeof error.message === "string") {
          errorMessage = error.message
        } else {
          errorMessage = JSON.stringify(error.message)
        }
      }
      
      toast.error("Failed to create subject", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      description: "",
      logo: undefined,
      group_id: 19,
      theme_id: 1,
      template_id: null,
      subject_field_ids: [],
    })
    setLogoFile(null)
    setLogoPreview(null)
    setCurrentStep(1)
    setErrors({})
    setCredentialFields([])
    setSelectedFieldIds(new Set())
    setEditingField(undefined)
  }

  const handleClose = () => {
    if (!loading) {
      resetForm()
      onOpenChange(false)
    }
  }

  const selectedFields = credentialFields.filter((_, index) => selectedFieldIds.has(index))
  const additionalFields = credentialFields

  return (
    <>
      <GlassDialog open={open} onOpenChange={handleClose}>
        <GlassDialogContent className="sm:max-w-[1400px] max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
          <GlassDialogHeader className="flex-shrink-0">
            <GlassDialogTitle className="text-xl sm:text-2xl">Add Subject</GlassDialogTitle>
            <GlassDialogDescription>
              Create a new subject in EveryCred. Follow the steps to complete the process.
            </GlassDialogDescription>
          </GlassDialogHeader>

          <div className="flex-1 flex overflow-hidden mt-4">
            {/* Left Sidebar - Step Navigation */}
            <div className="w-64 flex-shrink-0 border-r border-border/30 pr-6">
              <div className="space-y-1">
                {STEPS.map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (step.id < currentStep || (step.id === currentStep && step.id === 1 && validateStep1()) || (step.id === currentStep && step.id === 2 && validateStep2())) {
                        setCurrentStep(step.id as Step)
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentStep === step.id
                        ? "bg-primary/10 text-primary font-medium"
                        : step.id < currentStep
                        ? "text-muted-foreground hover:bg-muted/30"
                        : "text-muted-foreground/50 cursor-not-allowed"
                    }`}
                    disabled={step.id > currentStep}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep === step.id
                          ? "bg-primary text-white"
                          : step.id < currentStep
                          ? "bg-success text-white"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {step.id < currentStep ? <Check className="h-4 w-4" /> : step.id}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{step.title}</div>
                        <div className="text-xs text-muted-foreground">{step.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto px-6">
              <form onSubmit={handleSubmit} className="py-4">
                {/* Step 1: Info & Credential Details */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Subject Information</h3>
                      <p className="text-sm text-muted-foreground mb-4">Set up the details for your subject.</p>
                      
                      <div className="space-y-4">
                        <div>
                          <GlassInput
                            type="text"
                            placeholder="Subject Name *"
                            value={formData.name}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, name: e.target.value }))
                              if (errors.name) setErrors(prev => ({ ...prev, name: undefined }))
                            }}
                            error={errors.name}
                            required
                            maxLength={100}
                          />
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground ml-2">e.g. Award credentials</span>
                            <span className="text-xs text-muted-foreground">{formData.name.length}/100</span>
                          </div>
                        </div>

                        {/* Logo Upload */}
                        <div>
                          <label className="block text-xs text-muted-foreground mb-2">Upload Logo</label>
                          {logoPreview ? (
                            <div className="relative w-full h-32">
                              <img
                                src={logoPreview}
                                alt="Logo preview"
                                className="w-full h-full object-contain border border-border/30 rounded-lg p-2 bg-muted/30"
                              />
                              <button
                                type="button"
                                onClick={removeLogo}
                                className="absolute top-2 right-2 p-1 bg-destructive text-white rounded-full hover:bg-destructive/80"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/30 rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Click to upload logo</p>
                                <p className="text-xs text-muted-foreground mt-1">Recommended size: 300x30px</p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleLogoUpload}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Credential Information</h3>
                      <p className="text-sm text-muted-foreground mb-4">Provide a detailed description of your credential.</p>
                      
                      <div className="space-y-4">
                        <div>
                          <GlassInput
                            type="text"
                            placeholder="Credential Title *"
                            value={formData.title}
                            onChange={(e) => {
                              setFormData(prev => ({ ...prev, title: e.target.value }))
                              if (errors.title) setErrors(prev => ({ ...prev, title: undefined }))
                            }}
                            error={errors.title}
                            required
                            maxLength={100}
                          />
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-muted-foreground ml-2">e.g. Degree Certificate</span>
                            <span className="text-xs text-muted-foreground">{formData.title.length}/100</span>
                          </div>
                        </div>

                        <div>
                          <textarea
                            placeholder="Enter a brief description of the credential *"
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
                              {formData.description?.length || 0}/550
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Attributes */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Subject Attributes</h3>
                      
                      {/* Available Attributes - Existing Fields */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Available Attributes</h4>
                            <p className="text-xs text-muted-foreground">
                              Select from existing attributes to avoid creating duplicates.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <GlassInput
                              type="text"
                              placeholder="Search fields..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-48 h-9 text-sm"
                            />
                          </div>
                        </div>

                        {loadingExistingFields ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">Loading existing fields...</p>
                          </div>
                        ) : existingFields.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground border border-dashed border-border/30 rounded-lg">
                            <p className="text-sm">No existing fields found. Create new ones below.</p>
                          </div>
                        ) : (
                          <div className="border border-border/30 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                            <table className="w-full">
                              <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm z-10">
                                <tr className="border-b border-border/30">
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Select
                                  </th>
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Title
                                  </th>
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Field Type
                                  </th>
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Description
                                  </th>
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Is Mandatory
                                  </th>
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Masked
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/30">
                                {existingFields.map((field) => {
                                  const isSelected = selectedFieldIds.has(field.id)
                                  const isAlreadyAdded = credentialFields.some(f => f.id === field.id)
                                  return (
                                    <tr 
                                      key={field.id} 
                                      className={`hover:bg-muted/30 ${isSelected ? 'bg-primary/5' : ''}`}
                                    >
                                      <td className="px-4 py-3">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => handleSelectExistingField(field)}
                                          className="rounded"
                                        />
                                      </td>
                                      <td className="px-4 py-3 text-sm text-foreground">{field.title}</td>
                                      <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                                          {field.ftype}
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground">{field.description || "—"}</td>
                                      <td className="px-4 py-3">
                                        {field.is_required ? (
                                          <Check className="h-4 w-4 text-success" />
                                        ) : (
                                          <X className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </td>
                                      <td className="px-4 py-3">
                                        {field.is_mask ? (
                                          <Check className="h-4 w-4 text-success" />
                                        ) : (
                                          <X className="h-4 w-4 text-muted-foreground" />
                                        )}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      {/* Additional Attributes - Custom Created Fields */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-semibold text-foreground mb-2">Additional Attributes</h4>
                            <p className="text-xs text-muted-foreground">
                              Create new attributes and configure available options to include in your subject template.
                            </p>
                          </div>
                          <GlassButton
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setEditingField(undefined)
                              setCreateAttributeModalOpen(true)
                            }}
                            icon={<Plus className="h-4 w-4" />}
                          >
                            Add New
                          </GlassButton>
                        </div>

                        {additionalFields.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground border border-dashed border-border/30 rounded-lg">
                            <p className="text-sm">No additional attributes. Click "Add New" to create one.</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-border/30 bg-muted/30">
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Select
                                  </th>
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Title
                                  </th>
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Field Type
                                  </th>
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Description
                                  </th>
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Is Mandatory
                                  </th>
                                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Masked
                                  </th>
                                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border/30">
                                {credentialFields
                                  .map((field, index) => {
                                    return (
                                      <tr key={index} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                          <input
                                            type="checkbox"
                                            checked={field.id ? selectedFieldIds.has(field.id) : false}
                                            onChange={() => {
                                              if (field.id) {
                                                toggleFieldSelection(field.id)
                                              } else {
                                                console.warn("Cannot select field without ID:", field)
                                              }
                                            }}
                                            disabled={!field.id}
                                            className="rounded"
                                          />
                                        </td>
                                        <td className="px-4 py-3 text-sm text-foreground">{field.title}</td>
                                        <td className="px-4 py-3">
                                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                                            {field.ftype}
                                          </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{field.description || "—"}</td>
                                        <td className="px-4 py-3">
                                          {field.is_required ? (
                                            <Check className="h-4 w-4 text-success" />
                                          ) : (
                                            <X className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </td>
                                        <td className="px-4 py-3">
                                          {field.is_mask ? (
                                            <Check className="h-4 w-4 text-success" />
                                          ) : (
                                            <X className="h-4 w-4 text-muted-foreground" />
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            <GlassButton
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleEditField(index)}
                                              icon={<Pencil className="h-4 w-4" />}
                                            />
                                            <GlassButton
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDeleteField(index)}
                                              icon={<Trash2 className="h-4 w-4" />}
                                            />
                                          </div>
                                        </td>
                                      </tr>
                                    )
                                  })
                                  .filter(Boolean)}
                              </tbody>
                            </table>
                          </div>
                        )}
                        
                        {errors.attributes && (
                          <p className="text-xs text-red-500 mt-2 ml-2">{errors.attributes}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-4">Review & Submit</h3>
                      
                      <div className="space-y-6">
                        {/* Subject Information Review */}
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-foreground mb-3">Subject Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Subject Name:</span>{" "}
                              <span className="text-foreground font-medium">{formData.name}</span>
                            </div>
                            {logoPreview && (
                              <div>
                                <span className="text-muted-foreground">Logo:</span>
                                <img src={logoPreview} alt="Logo" className="h-16 mt-2 object-contain" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Credential Information Review */}
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-foreground mb-3">Credential Information</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Credential Title:</span>{" "}
                              <span className="text-foreground font-medium">{formData.title}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Description:</span>
                              <p className="text-foreground mt-1">{formData.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Attributes Review */}
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-foreground mb-3">Selected Attributes</h4>
                          <div className="space-y-2">
                            {selectedFields.map((field, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-success" />
                                <span className="text-foreground">{field.title}</span>
                                <span className="text-muted-foreground">({field.ftype})</span>
                                {field.is_required && (
                                  <span className="text-xs text-muted-foreground">• Required</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          </div>

          {/* Footer with Navigation */}
          <GlassDialogFooter className="flex-shrink-0 border-t border-border/30 pt-4 mt-4">
            <div className="flex items-center justify-between w-full">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={currentStep === 1 ? handleClose : handlePrevious}
                disabled={loading}
                icon={currentStep === 1 ? undefined : <ChevronLeft className="h-4 w-4" />}
              >
                {currentStep === 1 ? "Cancel" : "Previous"}
              </GlassButton>
              
              <div className="flex items-center gap-2">
                {currentStep < 3 ? (
                  <GlassButton
                    type="button"
                    variant="primary"
                    onClick={handleNext}
                    disabled={loading}
                    icon={<ChevronRight className="h-4 w-4" />}
                  >
                    Next
                  </GlassButton>
                ) : (
                  <GlassButton
                    type="button"
                    variant="primary"
                    onClick={handleSubmit}
                    loading={loading}
                  >
                    Create Subject
                  </GlassButton>
                )}
              </div>
            </div>
          </GlassDialogFooter>
        </GlassDialogContent>
      </GlassDialog>

      {/* Create/Edit Attribute Modal */}
      <CreateAttributeModal
        open={createAttributeModalOpen}
        onOpenChange={setCreateAttributeModalOpen}
        onSave={handleSaveAttribute}
        editingField={editingField}
      />
    </>
  )
}
