"use client"

import * as React from "react"
import { Suspense } from "react"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { Lock, GraduationCap, ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [formData, setFormData] = React.useState({
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{
    password?: string
    confirmPassword?: string
  }>({})

  React.useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link", {
        description: "The password reset link is invalid or expired.",
      })
      router.push("/forget-password")
    }
  }, [token, router])

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      toast.error("Invalid reset link", {
        description: "The password reset link is invalid or expired.",
      })
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await api.auth.resetPassword(token, formData.password)

      toast.success("Password reset successful!", {
        description: "Your password has been reset. Please login with your new password.",
      })

      router.push("/login")
    } catch (error: any) {
      const errorMessage =
        error?.message || "Failed to reset password. The link may have expired."
      
      toast.error("Reset failed", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return null
  }

  return (
    <div className="relative min-h-screen bg-[#e8ecf4] overflow-hidden flex items-center justify-center p-6">
      {/* Soft gradient overlay for depth */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(180, 200, 255, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(180, 220, 255, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(200, 210, 240, 0.15) 0%, transparent 70%)
          `,
        }}
        aria-hidden="true"
      />

      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="p-8" interactive={false}>
          {/* Logo/Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">Reset Password</h1>
            <p className="text-sm text-muted-foreground">
              Enter your new password below
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassInput
                type="password"
                placeholder="Enter new password"
                icon={<Lock className="h-4 w-4" />}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
                error={errors.password}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassInput
                type="password"
                placeholder="Confirm new password"
                icon={<Lock className="h-4 w-4" />}
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
                }}
                error={errors.confirmPassword}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Reset Password
              </GlassButton>
            </motion.div>
          </form>

          {/* Back to login link */}
          <motion.div
            className="mt-6 text-center text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="relative min-h-screen bg-[#e8ecf4] overflow-hidden flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}

