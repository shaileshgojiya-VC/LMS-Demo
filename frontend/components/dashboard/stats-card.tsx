"use client"

import type * as React from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: "up" | "down" | "neutral"
  delay?: number
}

export function StatsCard({ title, value, change, icon, trend = "neutral", delay = 0 }: StatsCardProps) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-500",
    neutral: "text-[#64748b]",
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 25 }}
    >
      <GlassCard className="p-4 sm:p-6 h-full" glow={true}>
        <div className="flex items-start justify-between h-full gap-3 sm:gap-4">
          <div className="flex-1 flex flex-col justify-between min-h-[100px] sm:min-h-[110px]">
            <div className="space-y-2 sm:space-y-2.5">
              <p className="text-xs sm:text-sm text-[#64748b]">{title}</p>
              <motion.p
                className="text-2xl sm:text-3xl font-semibold text-[#1e3a5f] tracking-tight"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: delay + 0.1, type: "spring", stiffness: 300 }}
              >
                {value}
              </motion.p>
            </div>
            <div className={cn("flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm h-5", change !== undefined ? trendColors[trend] : "opacity-0 pointer-events-none")}>
              {change !== undefined && (
                <>
                  <TrendIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="font-medium">
                    {change > 0 ? "+" : ""}
                    {change}%
                  </span>
                  <span className="text-[#94a3b8] hidden sm:inline">vs last month</span>
                  <span className="text-[#94a3b8] sm:hidden">vs last mo.</span>
                </>
              )}
            </div>
          </div>
          <div
            className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl text-[#1e3a5f] shrink-0"
            style={{
              background: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div className="h-4 w-4 sm:h-5 sm:w-5">{icon}</div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
