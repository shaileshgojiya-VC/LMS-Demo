"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Search, X } from "lucide-react"
import { GlassInput } from "@/components/ui/glass-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCurrentUser } from "@/lib/hooks/use-api"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface HeaderProps {
  title: string
  subtitle?: string
}

const glassButtonStyle: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.65)",
  backdropFilter: "blur(24px) saturate(180%)",
  WebkitBackdropFilter: "blur(24px) saturate(180%)",
  border: "1px solid rgba(255, 255, 255, 0.6)",
  boxShadow: "0 0 0 1px rgba(255,255,255,0.7), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
}

export function Header({ title, subtitle }: HeaderProps) {
  const router = useRouter()
  const { data: user, loading: userLoading, error: userError } = useCurrentUser()
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)

  const handleSignOut = () => {
    // Clear auth tokens from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("lms_auth_tokens")
      // Redirect to login page
      router.push("/login")
    }
  }

  // Generate initials from user's full name
  const getInitials = (name: string | undefined): string => {
    if (!name) return "AD"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Get display name - use user data if available, otherwise fallback to "Admin"
  const displayName = user?.full_name || "Admin"
  const initials = getInitials(user?.full_name)

  return (
    <>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <motion.h1
            className="text-xl sm:text-2xl font-semibold text-[#1e3a5f] tracking-tight truncate"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="text-sm sm:text-base text-[#64748b] mt-1.5 truncate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Mobile Search Button */}
          <motion.button
            onClick={() => setIsSearchOpen(true)}
            className="md:hidden p-3 rounded-2xl transition-all duration-300 relative"
            style={glassButtonStyle}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-[#64748b]" />
          </motion.button>

          {/* Desktop Search */}
          <div className="hidden md:block w-72">
            <GlassInput placeholder="Search..." icon={<Search className="h-4 w-4" />} />
          </div>

          <motion.button
            className="p-3 rounded-2xl transition-all duration-300 relative"
            style={glassButtonStyle}
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-[#64748b]" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 shadow-lg" />
          </motion.button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className="flex items-center gap-2 sm:gap-3 p-2 pr-3 sm:pr-5 rounded-full transition-all duration-300"
                style={glassButtonStyle}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-white/50 shrink-0">
                  <AvatarImage src="/admin-user-avatar.png" />
                  <AvatarFallback className="bg-[#1e3a5f] text-white text-xs font-medium">
                    {userLoading ? "..." : initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-[#1e3a5f] hidden sm:block">
                  {userLoading ? "Loading..." : displayName}
                </span>
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 rounded-2xl p-2"
              style={{
                background: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(24px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.6)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              }}
            >
              <DropdownMenuLabel className="text-[#64748b]">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/40" />
              <DropdownMenuItem asChild className="rounded-xl hover:bg-white/50 cursor-pointer text-[#1e3a5f]">
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl hover:bg-white/50 cursor-pointer text-[#1e3a5f]">
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/40" />
              <DropdownMenuItem
                className="rounded-xl hover:bg-red-50 text-red-500 cursor-pointer"
                onClick={handleSignOut}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-0 left-0 right-0 z-50 md:hidden p-4"
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(24px) saturate(180%)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.6)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <GlassInput
                    placeholder="Search..."
                    icon={<Search className="h-4 w-4" />}
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/60 transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5 text-[#64748b]" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
