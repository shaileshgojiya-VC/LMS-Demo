"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassBadge } from "@/components/ui/glass-badge"
import { motion } from "framer-motion"
import { User, Mail, Calendar, Shield, Loader2 } from "lucide-react"
import { useCurrentUser } from "@/lib/hooks/use-api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfilePage() {
  const { data: user, loading, error, refetch } = useCurrentUser()

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

  if (loading) {
    return (
      <AppShell>
        <Header title="Profile" subtitle="Your account information" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading profile...</span>
        </div>
      </AppShell>
    )
  }

  if (error) {
    return (
      <AppShell>
        <Header title="Profile" subtitle="Your account information" />
        <GlassCard interactive={false} className="p-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading profile: {error}</p>
            <GlassButton variant="primary" onClick={() => refetch()}>
              Retry
            </GlassButton>
          </div>
        </GlassCard>
      </AppShell>
    )
  }

  if (!user) {
    return (
      <AppShell>
        <Header title="Profile" subtitle="Your account information" />
        <GlassCard interactive={false} className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No user data available</p>
          </div>
        </GlassCard>
      </AppShell>
    )
  }

  const initials = getInitials(user.full_name)
  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"
  const updatedAt = user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "N/A"

  return (
    <AppShell>
      <Header title="Profile" subtitle="Your account information" />

      <div className="max-w-4xl space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard interactive={false}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-white/50">
                <AvatarImage src="/admin-user-avatar.png" />
                <AvatarFallback className="bg-[#1e3a5f] text-white text-2xl font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-foreground mb-2">{user.full_name}</h2>
                <p className="text-muted-foreground mb-4">{user.email}</p>
                <div className="flex flex-wrap gap-2">
                  <GlassBadge variant={user.is_active ? "success" : "default"}>
                    {user.is_active ? "Active" : "Inactive"}
                  </GlassBadge>
                  <GlassBadge variant={user.is_verified ? "success" : "default"}>
                    {user.is_verified ? "Verified" : "Not Verified"}
                  </GlassBadge>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard interactive={false}>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">Account Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Full Name
                  </label>
                  <GlassInput
                    type="text"
                    value={user.full_name}
                    icon={<User className="h-4 w-4" />}
                    readOnly
                    disabled
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Email Address
                  </label>
                  <GlassInput
                    type="email"
                    value={user.email}
                    icon={<Mail className="h-4 w-4" />}
                    readOnly
                    disabled
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Account Created
                    </label>
                    <GlassInput
                      type="text"
                      value={createdAt}
                      icon={<Calendar className="h-4 w-4" />}
                      readOnly
                      disabled
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Last Updated
                    </label>
                    <GlassInput
                      type="text"
                      value={updatedAt}
                      icon={<Calendar className="h-4 w-4" />}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Account Status
                    </label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <GlassBadge variant={user.is_active ? "success" : "default"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </GlassBadge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                      Verification Status
                    </label>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <GlassBadge variant={user.is_verified ? "success" : "default"}>
                        {user.is_verified ? "Verified" : "Not Verified"}
                      </GlassBadge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AppShell>
  )
}

