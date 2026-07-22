"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState<boolean | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/")
      } else {
        setAuthorized(true)
      }
    })
  }, [router, supabase])

  if (authorized === null) {
    return (
      <div className="flex h-screen overflow-hidden" style={{ background: "#f7f7f7" }}>
        <div className="flex-1" />
      </div>
    )
  }

  return <>{children}</>
}
