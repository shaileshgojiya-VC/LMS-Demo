"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { Mail, Lock, User, GraduationCap, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { authStorage } from "@/lib/auth-storage"

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
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
      // Call registration API
      const response = await api.auth.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.name,
      })

      // Store authentication tokens and user data
      authStorage.setTokens(response.tokens)
      authStorage.setUser(response.user)

      toast.success("Account created successfully!", {
        description: `Welcome ${response.user.full_name || response.user.email}!`,
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      const errorMessage =
        error?.message || "Please check your information and try again."
      
      toast.error("Signup failed", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-2xl font-semibold text-foreground mb-2">Create Account</h1>
            <p className="text-sm text-muted-foreground">Sign up to get started with EveryCRED LMS</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassInput
                type="text"
                placeholder="Enter your full name"
                icon={<User className="h-4 w-4" />}
                value={formData.name}
                onChange={handleChange("name")}
                error={errors.name}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassInput
                type="email"
                placeholder="Enter your email"
                icon={<Mail className="h-4 w-4" />}
                value={formData.email}
                onChange={handleChange("email")}
                error={errors.email}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <GlassInput
                type="password"
                placeholder="Create a password"
                icon={<Lock className="h-4 w-4" />}
                value={formData.password}
                onChange={handleChange("password")}
                error={errors.password}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassInput
                type="password"
                placeholder="Confirm your password"
                icon={<Lock className="h-4 w-4" />}
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                error={errors.confirmPassword}
              />
            </motion.div>

            <motion.div
              className="text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-muted-foreground text-xs leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Create Account
              </GlassButton>
            </motion.div>
          </form>

          {/* Login link */}
          <motion.div
            className="mt-6 text-center text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

