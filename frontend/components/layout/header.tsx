"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, CheckCircle2, Search, X } from "lucide-react"
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
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  GlassDialog,
  GlassDialogContent,
  GlassDialogDescription,
  GlassDialogFooter,
  GlassDialogHeader,
  GlassDialogTitle,
} from "@/components/ui/glass-dialog"
import { GlassButton } from "@/components/ui/glass-button"
import { useAuthIssuer } from "@/lib/auth/auth-issuer-context"

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
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const {
    authUser,
    issuers,
    activeIssuerId,
    loading: issuerLoading,
    switchIssuer,
    signOut,
  } = useAuthIssuer()
  const [switchingIssuerId, setSwitchingIssuerId] = React.useState<number | null>(null)
  const [issuerActivatedModalOpen, setIssuerActivatedModalOpen] = React.useState(false)
  const [lastActivatedIssuer, setLastActivatedIssuer] = React.useState<(typeof issuers)[number] | null>(null)

  const handleSignOut = () => {
    signOut()
    router.push("/login")
  }

  const handleIssuerSwitch = async (issuerId: number) => {
    const isAlreadyActive = issuers.some(
      (issuer) => issuer.id === issuerId && issuer.is_active
    )
    if (isAlreadyActive || switchingIssuerId !== null) {
      return
    }

    try {
      setSwitchingIssuerId(issuerId)
      const activatedIssuer = await switchIssuer(issuerId)
      setLastActivatedIssuer(activatedIssuer)
      setIssuerActivatedModalOpen(true)

      toast.success("Issuer profile switched successfully.")
      router.refresh()
    } catch (error: any) {
      toast.error("Failed to switch issuer profile", {
        description: error?.message || "Please try again.",
      })
    } finally {
      setSwitchingIssuerId(null)
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
  const displayName =
    authUser?.name || authUser?.full_name || "Admin"
  const initials = getInitials(displayName)
  const displayEmail = authUser?.email || ""
  const hasIssuers = issuers.length > 0

  return (
    <>
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <motion.h1
            className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight truncate"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              className="text-sm sm:text-base text-muted-foreground mt-1.5 truncate"
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
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                    {issuerLoading ? "..." : initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden sm:block">
                  {issuerLoading ? "Loading..." : displayName}
                </span>
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 rounded-2xl p-2"
              style={{
                background: "oklch(0.995 0 0 / 0.72)",
                backdropFilter: "blur(40px) saturate(2.2)",
                WebkitBackdropFilter: "blur(40px) saturate(2.2)",
                border: "0.5px solid oklch(1 0 0 / 0.25)",
                boxShadow: `0 0 0 0.5px oklch(1 0 0 / 0.2),
                  0 1px 2px oklch(0.3 0.05 250 / 0.02),
                  0 4px 12px oklch(0.3 0.05 250 / 0.03),
                  0 12px 32px oklch(0.3 0.05 250 / 0.04),
                  inset 0 1px 1px oklch(1 0 0 / 0.6)`,
              }}
            >
              <DropdownMenuLabel className="text-muted-foreground">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">{displayName}</p>
                  {displayEmail ? (
                    <p className="text-xs font-normal text-muted-foreground">{displayEmail}</p>
                  ) : null}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/35" />
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                Issuer Profiles
              </DropdownMenuLabel>
              {issuerLoading ? (
                <DropdownMenuItem
                  disabled
                  className="rounded-xl text-muted-foreground"
                >
                  Loading issuers...
                </DropdownMenuItem>
              ) : hasIssuers ? (
                issuers.map((issuer) => (
                  <DropdownMenuItem
                    key={issuer.id}
                    className={cn(
                      "rounded-xl cursor-pointer text-foreground flex items-center justify-between gap-2 transition-colors",
                      issuer.id === activeIssuerId
                        ? "bg-primary/10 ring-1 ring-primary/15"
                        : "hover:bg-primary/8"
                    )}
                    onClick={() => handleIssuerSwitch(issuer.id)}
                    disabled={switchingIssuerId !== null}
                  >
                    <span className="truncate">{issuer.name}</span>
                    <span
                      className={cn(
                        "text-xs shrink-0 px-2 py-0.5 rounded-full ring-1",
                        issuer.id === activeIssuerId
                          ? "bg-primary text-primary-foreground ring-primary/40"
                          : "bg-background/60 text-primary ring-border/60"
                      )}
                    >
                      {issuer.id === activeIssuerId
                        ? "Active"
                        : switchingIssuerId === issuer.id
                          ? "Switching..."
                          : "Switch"}
                    </span>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem
                  disabled
                  className="rounded-xl text-muted-foreground"
                >
                  No issuers found
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/35" />
              <DropdownMenuItem asChild className="rounded-xl hover:bg-primary/8 cursor-pointer text-foreground">
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="rounded-xl hover:bg-primary/8 cursor-pointer text-foreground">
                <Link href="/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/35" />
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
                  className="p-2 rounded-lg hover:bg-primary/8 transition-colors"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <GlassDialog
        open={issuerActivatedModalOpen}
        onOpenChange={setIssuerActivatedModalOpen}
      >
        <GlassDialogContent className="max-w-md">
          <GlassDialogHeader className="items-center text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <GlassDialogTitle className="text-2xl mt-2">Issuer Activated</GlassDialogTitle>
            <GlassDialogDescription className="text-sm">
              You have successfully activated the issuer profile.
            </GlassDialogDescription>
          </GlassDialogHeader>

          {lastActivatedIssuer ? (
            <div className="rounded-xl border border-white/60 bg-white/70 p-4 text-center">
              <p className="font-semibold text-foreground">
                {lastActivatedIssuer.name}
              </p>
              {lastActivatedIssuer.email ? (
                <p className="text-xs text-muted-foreground mt-1">
                  {lastActivatedIssuer.email}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground mt-3">
                All actions will now run with this issuer profile until you switch again.
              </p>
            </div>
          ) : null}

          <GlassDialogFooter className="justify-center sm:justify-center">
            <GlassButton
              variant="primary"
              onClick={() => setIssuerActivatedModalOpen(false)}
            >
              Got it!
            </GlassButton>
          </GlassDialogFooter>
        </GlassDialogContent>
      </GlassDialog>
    </>
  )
}
