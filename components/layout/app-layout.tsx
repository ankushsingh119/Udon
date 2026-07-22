"use client"

import * as React from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f7f7f7" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />
      <div
        className="flex flex-col flex-1 min-w-0 overflow-hidden"
        style={{
          marginLeft: collapsed ? 64 : 220,
          transition: "margin-left 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
