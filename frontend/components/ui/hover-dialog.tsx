"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

interface HoverDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const HoverDialog = ({ children, open, onOpenChange }: HoverDialogProps) => {
  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </PopoverPrimitive.Root>
  )
}

const HoverDialogTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ className, onMouseEnter, onMouseLeave, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 300) // Small delay before showing
    onMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(false)
    onMouseLeave?.(e)
  }

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <PopoverPrimitive.Trigger
      ref={ref}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    />
  )
})
HoverDialogTrigger.displayName = PopoverPrimitive.Trigger.displayName

const HoverDialogContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "start", sideOffset = 8, onMouseEnter, onMouseLeave, ...props }, ref) => {
  const handleMouseEnter = (e: React.MouseEvent) => {
    onMouseEnter?.(e)
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    onMouseLeave?.(e)
  }

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        side="right"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "z-50 w-auto min-w-[200px] rounded-2xl shadow-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=right]:slide-in-from-left-2",
          "duration-200",
          className
        )}
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.7), 0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
})
HoverDialogContent.displayName = PopoverPrimitive.Content.displayName

export { HoverDialog, HoverDialogTrigger, HoverDialogContent }

