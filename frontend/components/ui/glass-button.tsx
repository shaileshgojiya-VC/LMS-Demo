"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, type HTMLMotionProps } from "framer-motion"
import { Loader2 } from "lucide-react"

interface GlassButtonProps extends HTMLMotionProps<"button"> {
  variant?: "primary" | "secondary" | "ghost" | "success" | "destructive"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    { className, variant = "primary", size = "md", loading = false, icon, children, disabled, style, ...props },
    ref,
  ) => {
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        background: "#1e3a5f",
        color: "#ffffff",
        boxShadow: "0 4px 14px rgba(30, 58, 95, 0.25)",
      },
      secondary: {
        background: "rgba(255, 255, 255, 0.65)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.6)",
        color: "#1e3a5f",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.04)",
      },
      ghost: {
        background: "transparent",
        color: "#1e3a5f",
      },
      success: {
        background: "#22c55e",
        color: "#ffffff",
        boxShadow: "0 4px 14px rgba(34, 197, 94, 0.25)",
      },
      destructive: {
        background: "#ef4444",
        color: "#ffffff",
        boxShadow: "0 4px 14px rgba(239, 68, 68, 0.25)",
      },
    }

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-xl",
      md: "px-6 py-3 text-sm rounded-2xl",
      lg: "px-8 py-4 text-base rounded-3xl",
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2.5 font-medium",
          "transition-all duration-300 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          sizes[size],
          className,
        )}
        style={{ ...variantStyles[variant], ...style }}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </motion.button>
    )
  },
)
GlassButton.displayName = "GlassButton"

export { GlassButton }
