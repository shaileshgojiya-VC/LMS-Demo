"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { LayoutDashboard, Users, BookOpen, Award, Settings, ChevronLeft, GraduationCap } from "lucide-react"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/credentials", label: "Credentials", icon: Award },
  { href: "/settings", label: "Settings", icon: Settings },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen z-50",
        "bg-white/60 backdrop-blur-2xl saturate-150",
        "border-r border-white/60",
        "flex flex-col transition-all duration-300 ease-out",
        collapsed ? "w-20" : "w-[280px]",
      )}
      style={{
        boxShadow: `
          0 0 0 1px rgba(255,255,255,0.8),
          0 4px 16px rgba(0,0,0,0.04),
          0 8px 32px rgba(0,0,0,0.06),
          inset 0 1px 0 rgba(255,255,255,0.9)
        `,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-6 border-b border-white/40">
        <div className="h-11 w-11 rounded-2xl bg-[#1e3a5f] flex items-center justify-center shrink-0 shadow-lg">
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
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

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl",
                  "transition-all duration-300",
                  isActive
                    ? "bg-[#1e3a5f] text-white shadow-lg"
                    : "text-[#64748b] hover:bg-white/60 hover:text-[#1e3a5f]",
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-white/40">
        <motion.button
          onClick={onToggle}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl",
            "text-[#64748b] hover:bg-white/60 hover:text-[#1e3a5f]",
            "transition-all duration-300",
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </aside>
  )
}
