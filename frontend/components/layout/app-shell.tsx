"use client"

import * as React from "react"
import { Sidebar } from "./sidebar"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  // Close mobile sidebar when clicking outside or on route change
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Soft gradient overlay for depth with glass effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(180, 200, 255, 0.25) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(180, 220, 255, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(200, 210, 240, 0.1) 0%, transparent 70%)
          `,
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        }}
        aria-hidden="true"
      />

      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-30 md:hidden p-3 rounded-xl bg-white/50 backdrop-blur-[40px] border border-white/25 shadow-lg hover:bg-white/70 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-[#1e3a5f]" />
      </button>

      {/* Fixed sidebar */}
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      {/* Main content area */}
      <main
        className={cn(
          "relative min-h-screen transition-all duration-300 ease-out",
          // Mobile: No margin, full width
          // Desktop: Dynamic margin based on collapsed state
          collapsed ? "md:ml-20" : "md:ml-[280px]"
        )}
        style={{ 
          backdropFilter: 'blur(20px) saturate(150%)',
          WebkitBackdropFilter: 'blur(20px) saturate(150%)',
        }}
      >
        <div className="p-4 sm:p-6 lg:p-8 pt-16 md:pt-6">{children}</div>
      </main>
    </div>
  )
}
