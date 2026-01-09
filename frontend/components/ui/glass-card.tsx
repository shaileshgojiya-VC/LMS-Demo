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
      background: "rgba(255, 255, 255, 0.65)",
      backdropFilter: "blur(24px) saturate(180%)",
      WebkitBackdropFilter: "blur(24px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.6)",
      boxShadow: glow
        ? `0 0 0 1px rgba(255,255,255,0.7),
           0 2px 8px rgba(0,0,0,0.04),
           0 8px 24px rgba(0,0,0,0.06),
           inset 0 1px 0 rgba(255,255,255,0.9)`
        : `0 2px 8px rgba(0,0,0,0.04),
           0 8px 24px rgba(0,0,0,0.06)`,
      ...style,
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl p-6 relative overflow-hidden",
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
