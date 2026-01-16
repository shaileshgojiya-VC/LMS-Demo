"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { GlassCard } from "@/components/ui/glass-card"
import { GlassButton } from "@/components/ui/glass-button"
import { GlassInput } from "@/components/ui/glass-input"
import { GlassBadge } from "@/components/ui/glass-badge"
import { motion } from "framer-motion"
import { Settings, Key, Globe, Bell, Shield, Save } from "lucide-react"

export default function SettingsPage() {
  return (
    <AppShell>
      <Header title="Settings" subtitle="Configure your LMS and EveryCRED integration" />

      <div className="max-w-4xl space-y-6">
        {/* EveryCRED Integration */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard interactive={false}>
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 shrink-0">
                <Key className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">EveryCRED API Integration</h3>
                  <GlassBadge variant="success" className="text-xs">Connected</GlassBadge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-3 sm:mb-4">
                  Configure your EveryCRED API credentials for credential issuance
                </p>
                <div className="space-y-4">
                  <GlassInput
                    placeholder="API Key"
                    type="password"
                    defaultValue="••••••••••••••••"
                    icon={<Key className="h-4 w-4" />}
                  />
                  <GlassInput
                    placeholder="API Endpoint"
                    defaultValue="https://api.everycred.com/v1"
                    icon={<Globe className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Institution Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard interactive={false}>
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-xl bg-accent/10 shrink-0">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Institution Settings</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-3 sm:mb-4">
                  Configure your institution details for credentials
                </p>
                <div className="space-y-4">
                  <GlassInput placeholder="Institution Name" defaultValue="Demo University" />
                  <GlassInput placeholder="Institution ID" defaultValue="DU-2026-001" />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard interactive={false}>
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-xl bg-success/10 shrink-0">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Notifications</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-3 sm:mb-4">Configure email and system notifications</p>
                <div className="space-y-3">
                  {[
                    { label: "Email on credential issuance", enabled: true },
                    { label: "Email on verification", enabled: true },
                    { label: "Weekly summary reports", enabled: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <div
                        className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                          item.enabled ? "bg-success" : "bg-muted"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            item.enabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard interactive={false}>
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 rounded-xl bg-destructive/10 shrink-0">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">Security</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-3 sm:mb-4">Security and access control settings</p>
                <div className="space-y-3">
                  {[
                    { label: "Two-factor authentication", enabled: true },
                    { label: "API request logging", enabled: true },
                    { label: "IP allowlisting", enabled: false },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <div
                        className={`w-11 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                          item.enabled ? "bg-success" : "bg-muted"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                            item.enabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Save Button */}
        <motion.div
          className="flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <GlassButton variant="primary" size="lg" icon={<Save className="h-4 w-4" />}>
            Save Changes
          </GlassButton>
        </motion.div>
      </div>
    </AppShell>
  )
}
