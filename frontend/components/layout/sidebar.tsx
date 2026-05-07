import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Users, BookOpen, Settings, ChevronLeft, GraduationCap, X, Shield, Link2, BarChart3, BadgeCheck } from "lucide-react"
import * as React from "react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "Training Programs", icon: BookOpen },
  { href: "/students", label: "Learners", icon: Users },
 // { href: "/credentials", label: "Credentials", icon: BadgeCheck },
  // UI-only entries to match the sidebar design; routes may not exist yet.
  //{ href: "/verifications", label: "Verifications", icon: Shield, disabled: true as const },
 // { href: "/integrations", label: "Integrations", icon: Link2, disabled: true as const },
  { href: "/reports", label: "Reports", icon: BarChart3, disabled: true as const },
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
  const isCollapsed = collapsed && !isMobileOpen

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
          "bg-gradient-to-b from-[#0b2f8a] via-[#0b5bd3] to-[#0a4cc0]",
          "border-r border-white/10",
          "flex flex-col transition-all duration-300 ease-out",
          // Mobile: Always full width when open, hidden when closed
          "w-[280px]",
          // Desktop: Always visible, respect collapsed state for width
          "md:translate-x-0",
          collapsed ? "md:w-20" : "md:w-[280px]"
        )}
        style={{
          boxShadow: `
            0 0 0 1px rgba(255, 255, 255, 0.06),
            0 10px 30px rgba(0, 0, 0, 0.25)
          `,
        }}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center border-b border-white/15",
          collapsed && !isMobileOpen ? "justify-center p-4" : "justify-between gap-3 p-4 md:p-6"
        )}>
          <div className={cn(
            "flex items-center",
            collapsed && !isMobileOpen ? "justify-center" : "gap-3 flex-1"
          )}>
            <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0 shadow-lg ring-1 ring-white/15">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <AnimatePresence>
              {(!collapsed || isMobileOpen) && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="overflow-hidden"
                >
                  <h1 className="font-semibold text-white whitespace-nowrap leading-5">LMS RMS</h1>
                  <p className="text-xs text-white/100 whitespace-nowrap">Certifications & Records  System</p>
                  <p className="text-xs text-white/75 whitespace-nowrap"></p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5 text-white/80" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const showLabel = !collapsed || isMobileOpen
            const isHovered = hoveredItem === item.href
            // Show tooltip when hovered and sidebar is collapsed (desktop only, not on mobile)
            const showTooltip = isHovered && collapsed && !isMobileOpen
            const isDisabled = (item as any).disabled === true

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
                  aria-disabled={isDisabled}
                  tabIndex={isDisabled ? -1 : 0}
                  className={cn("block", isDisabled && "pointer-events-none")}
                >
                  <motion.div
                    className={cn(
                      "flex items-center rounded-xl transition-all duration-300",
                      // When collapsed (desktop only), center the icon
                      collapsed && !isMobileOpen ? "justify-center px-3 py-3" : "gap-3 px-4 py-3",
                      // Hover background for inactive items
                      !isActive && !isDisabled && "hover:bg-white/10",
                      isActive && "bg-white/12",
                      isDisabled && "opacity-60",
                    )}
                    whileHover={{ x: showLabel ? 4 : 0 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Icon with circular background for active state */}
                    <div className={cn(
                      "flex items-center justify-center shrink-0 transition-all duration-300",
                      "h-10 w-10 rounded-xl",
                      isActive ? "bg-white/15 ring-1 ring-white/20" : "",
                      // Center icon when collapsed
                      collapsed && !isMobileOpen && "mx-auto"
                    )}>
                      <item.icon className={cn(
                        "shrink-0 transition-all duration-300",
                        "h-5 w-5",
                        isActive ? "text-white" : "text-white/90"
                      )} />
                    </div>
                    <AnimatePresence>
                      {showLabel && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className={cn(
                            "text-sm font-medium whitespace-nowrap",
                            isActive ? "text-white" : "text-white/95"
                          )}
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

        {/* Help Card */}
        <div className={cn("px-4", isCollapsed ? "pb-0" : "pb-3")}>
          <div className="rounded-2xl bg-white/10 ring-1 ring-white/15 px-4 py-4">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                >
                  <p className="text-sm font-semibold text-white">Need help?</p>
                  <p className="text-xs text-white/70 mt-1">Contact our support team</p>
                  <button
                    type="button"
                    className="mt-3 w-full rounded-xl bg-white/12 hover:bg-white/18 text-white text-sm font-medium py-2 transition-colors"
                  >
                    Contact Support
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-white/15">
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3 min-w-0")}>
              <div className="h-10 w-10 rounded-full bg-white/15 ring-1 ring-white/15 flex items-center justify-center text-white font-semibold">
                AD
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    className="min-w-0"
                  >
                    <p className="text-sm font-semibold text-white truncate">Admin User</p>
                    <p className="text-xs text-white/70 truncate">admin@unicred.edu</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  type="button"
                  className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/15 ring-1 ring-white/15 transition-colors flex items-center justify-center text-white/85"
                  aria-label="User menu"
                >
                  <ChevronLeft className="h-5 w-5 -rotate-90" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

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
                  "bg-[#0b2f8a]/95 backdrop-blur-[18px] saturate-[1.6]",
                  "border border-white/20",
                  "shadow-xl",
                  "whitespace-nowrap"
                )}
                style={{
                  boxShadow: `
                    0 0 0 1px rgba(255, 255, 255, 0.12),
                    0 10px 24px rgba(0, 0, 0, 0.25)
                  `,
                }}
              >
                <span className="text-sm font-semibold text-white">
                  {navItems.find(i => i.href === hoveredItem)?.label}
                </span>
              </div>
              {/* Arrow pointer */}
              <div
                className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-[#0b2f8a]/95"
                style={{
                  filter: "drop-shadow(-2px 0 2px rgba(0, 0, 0, 0.08))",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

       
      </motion.aside>
    </>
  )
}
