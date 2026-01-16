import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Users, BookOpen, Settings, ChevronLeft, GraduationCap, X } from "lucide-react"
import * as React from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/courses", label: "Courses", icon: BookOpen },
  // { href: "/credentials", label: "Credentials", icon: Award },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function Sidebar({ collapsed = false, onToggle, isMobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = React.useState(false)
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)
  const [tooltipPosition, setTooltipPosition] = React.useState<{ x: number; y: number } | null>(null)
  const itemRefs = React.useRef<Record<string, HTMLDivElement | null>>({})

  // Check if we're on mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Update tooltip position when hovering
  React.useEffect(() => {
    if (hoveredItem && itemRefs.current[hoveredItem]) {
      const element = itemRefs.current[hoveredItem]
      if (element) {
        const rect = element.getBoundingClientRect()
        setTooltipPosition({
          x: rect.right + 12, // 12px = ml-3 (12px)
          y: rect.top + rect.height / 2
        })
      }
    } else {
      setTooltipPosition(null)
    }
  }, [hoveredItem])

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isMobileOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          // Mobile: Slide in/out based on isMobileOpen
          // Desktop: Always visible (translate-x-0)
          x: isMobile && !isMobileOpen ? "-100%" : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed left-0 top-0 h-screen z-50",
          "bg-white/50 backdrop-blur-[40px] saturate-[2.2]",
          "border-r border-white/25",
          "flex flex-col transition-all duration-300 ease-out",
          // Mobile: Always full width when open, hidden when closed
          "w-[280px]",
          // Desktop: Always visible, respect collapsed state for width
          "md:translate-x-0",
          collapsed ? "md:w-20" : "md:w-[280px]"
        )}
        style={{
          boxShadow: `
            0 0 0 0.5px oklch(1 0 0 / 0.2),
            0 1px 2px oklch(0.3 0.05 250 / 0.02),
            0 4px 12px oklch(0.3 0.05 250 / 0.03),
            0 12px 32px oklch(0.3 0.05 250 / 0.04),
            inset 0 1px 1px oklch(1 0 0 / 0.6)
          `,
        }}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center border-b border-white/40",
          collapsed && !isMobileOpen ? "justify-center p-4" : "justify-between gap-3 p-4 md:p-6"
        )}>
          <div className={cn(
            "flex items-center",
            collapsed && !isMobileOpen ? "justify-center" : "gap-3 flex-1"
          )}>
            <div className="h-11 w-11 rounded-2xl bg-[#1e3a5f] flex items-center justify-center shrink-0 shadow-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <AnimatePresence>
              {(!collapsed || isMobileOpen) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-semibold text-[#1e3a5f] whitespace-nowrap">UniCRED</h1>
                  <p className="text-xs text-[#64748b] whitespace-nowrap">University LMS</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 rounded-lg hover:bg-white/60 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-[#64748b]" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const showLabel = !collapsed || isMobileOpen
            const isHovered = hoveredItem === item.href
            // Show tooltip when hovered and sidebar is collapsed (desktop only, not on mobile)
            const showTooltip = isHovered && collapsed && !isMobileOpen

            return (
              <div
                key={item.href}
                ref={(el) => {
                  itemRefs.current[item.href] = el
                }}
                className="relative"
                onMouseEnter={() => {
                  // Only show tooltip on desktop when collapsed
                  if (collapsed && !isMobileOpen) {
                    setHoveredItem(item.href)
                  }
                }}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  href={item.href}
                  onClick={onMobileClose}
                  className="block"
                >
                  <motion.div
                    className={cn(
                      "flex items-center rounded-2xl transition-all duration-300",
                      // When collapsed (desktop only), center the icon
                      collapsed && !isMobileOpen ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
                      // Hover background for inactive items
                      !isActive && "hover:bg-white/60",
                    )}
                    whileHover={{ x: showLabel ? 4 : 0 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Icon with circular background for active state */}
                    <div className={cn(
                      "flex items-center justify-center shrink-0 transition-all duration-300",
                      "h-10 w-10 rounded-full",
                      isActive
                        ? "bg-[#1e3a5f] shadow-lg"
                        : "",
                      // Center icon when collapsed
                      collapsed && !isMobileOpen && "mx-auto"
                    )}>
                      <item.icon className={cn(
                        "shrink-0 transition-all duration-300",
                        "h-5 w-5",
                        isActive ? "text-white" : "text-black"
                      )} />
                    </div>
                    <AnimatePresence>
                      {showLabel && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="text-sm font-medium whitespace-nowrap text-black"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </Link>

                {/* Hover Tooltip Card - rendered separately below */}
              </div>
            )
          })}
        </nav>

        {/* Hover Tooltip Card - Fixed positioning to avoid clipping */}
        <AnimatePresence>
          {hoveredItem && tooltipPosition && collapsed && !isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -10 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.2
              }}
              className="fixed z-[100] pointer-events-none"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y}px`,
                transform: 'translateY(-50%)',
                willChange: 'transform, opacity'
              }}
            >
              <div
                className={cn(
                  "px-4 py-2.5 rounded-xl",
                  "bg-white/90 backdrop-blur-[20px] saturate-[2.2]",
                  "border border-white/50",
                  "shadow-xl",
                  "whitespace-nowrap"
                )}
                style={{
                  boxShadow: `
                    0 0 0 0.5px oklch(1 0 0 / 0.2),
                    0 4px 12px oklch(0.3 0.05 250 / 0.12),
                    0 8px 24px oklch(0.3 0.05 250 / 0.08),
                    inset 0 1px 1px oklch(1 0 0 / 0.4)
                  `,
                }}
              >
                <span className="text-sm font-semibold text-[#1e3a5f]">
                  {navItems.find(i => i.href === hoveredItem)?.label}
                </span>
              </div>
              {/* Arrow pointer */}
              <div
                className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-white/90"
                style={{
                  filter: "drop-shadow(-2px 0 2px rgba(0, 0, 0, 0.08))",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse Toggle - Hidden on mobile */}
        <div className="hidden md:flex p-4 border-t border-white/40 items-center justify-center">
          <motion.button
            onClick={onToggle}
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              "bg-[#1e3a5f] text-white",
              "hover:bg-[#2a4a7a] shadow-lg",
              "transition-all duration-300",
            )}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <ChevronLeft className="h-5 w-5" />
            </motion.div>
          </motion.button>
        </div>
      </motion.aside>
    </>
  )
}
