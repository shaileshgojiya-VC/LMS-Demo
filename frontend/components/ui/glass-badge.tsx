"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info"
  pulse?: boolean
}

const GlassBadge = React.forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ className, variant = "default", pulse = false, children, style, ...props }, ref) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        background: "rgba(255, 255, 255, 0.6)",
        color: "#64748b",
        border: "1px solid rgba(255, 255, 255, 0.8)",
      },
      success: {
        background: "rgba(34, 197, 94, 0.1)",
        color: "#16a34a",
        border: "1px solid rgba(34, 197, 94, 0.2)",
      },
      warning: {
        background: "rgba(245, 158, 11, 0.1)",
        color: "#d97706",
        border: "1px solid rgba(245, 158, 11, 0.2)",
      },
      error: {
        background: "rgba(239, 68, 68, 0.1)",
        color: "#dc2626",
        border: "1px solid rgba(239, 68, 68, 0.2)",
      },
      info: {
        background: "rgba(30, 58, 95, 0.1)",
        color: "#1e3a5f",
        border: "1px solid rgba(30, 58, 95, 0.2)",
      },
    }

    return (
      <motion.span
        ref={ref}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl",
          "backdrop-blur-xl shadow-sm",
          className,
        )}
        style={{ ...variantStyles[variant], ...style }}
        {...props}
      >
        {variant === "success" && <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />}
        {children}
      </motion.span>
    )
  },
)
GlassBadge.displayName = "GlassBadge"

export { GlassBadge }
