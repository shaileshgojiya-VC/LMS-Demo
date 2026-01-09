"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { Mail, GraduationCap, ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"

export default function ForgetPasswordPage() {
    const router = useRouter()
    const [email, setEmail] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [errors, setErrors] = React.useState<{ email?: string }>({})

    const validateForm = (): boolean => {
        const newErrors: { email?: string } = {}

        if (!email) {
            newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Please enter a valid email address"
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
            await api.auth.forgetPassword(email)

            toast.success("Password reset email sent!", {
                description: "Please check your email for the password reset link.",
            })

            router.push("/login")
        } catch (error: any) {
            const errorMessage =
                error?.message || "Failed to send password reset email. Please try again."

            toast.error("Request failed", {
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
                        <h1 className="text-2xl font-semibold text-foreground mb-2">Forgot Password?</h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email address and we'll send you a link to reset your password
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
                            <GlassButton
                                type="submit"
                                variant="primary"
                                size="lg"
                                className="w-full"
                                loading={loading}
                                icon={<ArrowRight className="h-4 w-4" />}
                            >
                                Send Reset Link
                            </GlassButton>
                        </motion.div>
                    </form>

                    {/* Back to login link */}
                    <motion.div
                        className="mt-6 text-center text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
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

