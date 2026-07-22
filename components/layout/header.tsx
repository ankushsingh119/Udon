"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface HeaderProps {
  brandUrl?: string
  plan?: "free" | "pro"
  generationsUsed?: number
  generationLimit?: number
}

export function Header({
  brandUrl = "mybusiness.com",
  plan = "free",
  generationsUsed = 3,
  generationLimit = 5,
}: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [supabase])

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? "U"

  const userName = user?.user_metadata?.full_name ?? user?.email ?? "User"
  const userEmail = user?.email ?? ""

  return (
    <header
      className="h-[52px] min-h-[52px] flex items-center justify-between px-6 gap-3"
      style={{
        background: 'rgba(250, 250, 250, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-light)',
      }}
    >
      <div className="flex items-center gap-3">
        {plan === "free" ? (
          <span className="badge-udon-free">
            Free · {generationsUsed} of {generationLimit} used
          </span>
        ) : (
          <span className="badge-udon-pro">Pro · Unlimited</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[13px] text-[var(--text-secondary)] hidden sm:inline">
          {userName}
        </span>
        <Avatar size="sm">
          <AvatarFallback className="bg-[var(--coral)] text-white text-[11px] font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
