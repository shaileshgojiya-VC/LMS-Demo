"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
}

const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, icon, error, type, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)

    const glassStyle: React.CSSProperties = {
      background: isFocused ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.65)",
      backdropFilter: "blur(24px) saturate(180%)",
      WebkitBackdropFilter: "blur(24px) saturate(180%)",
      border: "1px solid rgba(255, 255, 255, 0.6)",
      boxShadow: isFocused
        ? "0 0 0 3px rgba(30, 58, 95, 0.15), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)"
        : "0 0 0 1px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
    }

    return (
      <div className="relative">
        <motion.div
          className="flex items-center gap-3 rounded-2xl px-5 py-3.5 transition-all duration-300"
          style={glassStyle}
          animate={{ scale: isFocused ? 1.01 : 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        >
          {icon && <span className="text-[#64748b] shrink-0">{icon}</span>}
          <input
            type={type}
            className={cn(
              "flex-1 bg-transparent outline-none placeholder:text-[#94a3b8]",
              "text-[#1e3a5f] text-sm",
              className,
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 mt-2 ml-2"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  },
)
GlassInput.displayName = "GlassInput"

export { GlassInput }
