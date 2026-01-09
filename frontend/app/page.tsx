"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { GraduationCap, LogIn, UserPlus, ArrowRight } from "lucide-react"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"

export default function WelcomePage() {
  const router = useRouter()

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
        className="w-full max-w-4xl z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Welcome Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center justify-center mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <div className="relative">
              <GraduationCap className="h-20 w-20 text-[#1e3a5f] drop-shadow-lg" />
              <motion.div
                className="absolute inset-0 bg-[#1e3a5f] rounded-full blur-xl opacity-30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-6xl font-bold text-[#1e3a5f] mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Welcome to University LMS
          </motion.h1>

          <motion.p
            className="text-xl text-[#64748b] max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Manage your learning journey, track progress, and earn verifiable credentials
          </motion.p>
        </motion.div>

        {/* Action Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard className="p-8 max-w-md mx-auto" interactive={false}>
            <div className="flex flex-col items-center text-center space-y-8">
              <motion.div
                className="p-4 bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] rounded-2xl shadow-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                <GraduationCap className="h-16 w-16 text-white" />
              </motion.div>

              <div className="space-y-4 w-full">
                <h2 className="text-2xl font-bold text-[#1e3a5f]">Get Started</h2>
                <p className="text-[#64748b]">
                  Choose an option to continue to your learning journey
                </p>

                <div className="flex flex-col gap-4 mt-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GlassButton
                      onClick={() => router.push("/login")}
                      className="w-full h-14 bg-gradient-to-br from-[#1e3a5f] to-[#2d4a6f] text-white hover:from-[#2d4a6f] hover:to-[#1e3a5f] transition-all"
                    >
                      <LogIn className="mr-2 h-5 w-5" />
                      Login
                    </GlassButton>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <GlassButton
                      onClick={() => router.push("/signup")}
                      className="w-full h-14 bg-gradient-to-br from-[#2d4a6f] to-[#1e3a5f] text-white hover:from-[#1e3a5f] hover:to-[#2d4a6f] transition-all"
                    >
                      <UserPlus className="mr-2 h-5 w-5" />
                      Sign Up
                    </GlassButton>
                  </motion.div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12 text-[#64748b] text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>© 2024 University LMS. All rights reserved.</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
