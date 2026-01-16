"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, type HTMLMotionProps } from "framer-motion"

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: "default" | "elevated" | "subtle" | "solid"
  interactive?: boolean
  glow?: boolean
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", interactive = true, glow = true, children, style, ...props }, ref) => {
    const glassStyle: React.CSSProperties = {
      background: "oklch(0.995 0 0 / 0.5)",
      backdropFilter: "blur(40px) saturate(2.2)",
      WebkitBackdropFilter: "blur(40px) saturate(2.2)",
      border: "0.5px solid oklch(1 0 0 / 0.25)",
      boxShadow: glow
        ? `0 0 0 0.5px oklch(1 0 0 / 0.2),
           0 1px 2px oklch(0.3 0.05 250 / 0.02),
           0 4px 12px oklch(0.3 0.05 250 / 0.03),
           0 12px 32px oklch(0.3 0.05 250 / 0.04),
           inset 0 1px 1px oklch(1 0 0 / 0.6)`
        : `0 1px 2px oklch(0.3 0.05 250 / 0.02),
           0 4px 12px oklch(0.3 0.05 250 / 0.03),
           0 12px 32px oklch(0.3 0.05 250 / 0.04)`,
      ...style,
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 relative overflow-hidden",
          interactive && "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5",
          className,
        )}
        style={glassStyle}
        whileHover={interactive ? { y: -3, scale: 1.005 } : undefined}
        whileTap={interactive ? { scale: 0.985 } : undefined}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        {...props}
      >
        {children}
      </motion.div>
    )
  },
)
GlassCard.displayName = "GlassCard"

export { GlassCard }
