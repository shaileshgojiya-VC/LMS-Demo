"use client"

import * as React from "react"
import { Sidebar } from "./sidebar"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="relative min-h-screen bg-[#e8ecf4] overflow-x-hidden">
      {/* Soft gradient overlay for depth */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(180, 200, 255, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(180, 220, 255, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(200, 210, 240, 0.15) 0%, transparent 70%)
          `,
        }}
        aria-hidden="true"
      />

      {/* Fixed sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Main content area */}
      <main
        className="relative min-h-screen transition-all duration-300 ease-out"
        style={{ marginLeft: collapsed ? 80 : 280 }}
      >
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
