"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Bell, Search, Moon, Sun } from "lucide-react"
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
  const [isDark, setIsDark] = React.useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle("dark")
  }

  return (
    <header className="flex items-center justify-between gap-6 mb-8">
      <div>
        <motion.h1
          className="text-2xl font-semibold text-[#1e3a5f] tracking-tight"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="text-[#64748b] mt-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:block w-72">
          <GlassInput placeholder="Search..." icon={<Search className="h-4 w-4" />} />
        </div>

        <motion.button
          className="p-3 rounded-2xl transition-all duration-300"
          style={glassButtonStyle}
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
        >
          {isDark ? <Sun className="h-5 w-5 text-[#64748b]" /> : <Moon className="h-5 w-5 text-[#64748b]" />}
        </motion.button>

        <motion.button
          className="p-3 rounded-2xl transition-all duration-300 relative"
          style={glassButtonStyle}
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Bell className="h-5 w-5 text-[#64748b]" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 shadow-lg" />
        </motion.button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button
              className="flex items-center gap-3 p-2 pr-5 rounded-full transition-all duration-300"
              style={glassButtonStyle}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Avatar className="h-9 w-9 ring-2 ring-white/50">
                <AvatarImage src="/admin-user-avatar.png" />
                <AvatarFallback className="bg-[#1e3a5f] text-white text-xs font-medium">AD</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-[#1e3a5f] hidden sm:block">Admin</span>
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
            <DropdownMenuItem className="rounded-xl hover:bg-white/50 cursor-pointer text-[#1e3a5f]">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl hover:bg-white/50 cursor-pointer text-[#1e3a5f]">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/40" />
            <DropdownMenuItem className="rounded-xl hover:bg-red-50 text-red-500 cursor-pointer">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
