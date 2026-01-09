"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { Mail, Lock, GraduationCap, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { authStorage } from "@/lib/auth-storage"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({})

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {}

    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Call login API
      const response = await api.auth.login({
        email,
        password,
      })

      // Store authentication tokens and user data
      authStorage.setTokens(response.tokens)
      authStorage.setUser(response.user)

      toast.success("Login successful!", {
        description: `Welcome back, ${response.user.full_name || response.user.username}!`,
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error: any) {
      const errorMessage =
        error?.message || "Please check your credentials and try again."
      
      toast.error("Login failed", {
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
            <h1 className="text-2xl font-semibold text-foreground mb-2">Welcome Back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your EveryCRED LMS account</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <GlassInput
                type="email"
                placeholder="Enter your email"
                icon={<Mail className="h-4 w-4" />}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                error={errors.email}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassInput
                type="password"
                placeholder="Enter your password"
                icon={<Lock className="h-4 w-4" />}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: undefined })
                }}
                error={errors.password}
              />
            </motion.div>

            <motion.div
              className="flex items-center justify-between text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-muted-foreground">Remember me</span>
              </label>
              <Link
                href="/forget-password"
                className="text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={loading}
                icon={<ArrowRight className="h-4 w-4" />}
              >
                Sign In
              </GlassButton>
            </motion.div>
          </form>

          {/* Sign up link */}
          <motion.div
            className="mt-6 text-center text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </motion.div>
        </GlassCard>
      </motion.div>
    </div>
  )
}

