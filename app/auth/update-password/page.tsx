"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [validSession, setValidSession] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setValidSession(true)
      }
      setLoading(false)
    })
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setSubmitting(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setSubmitting(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    setSubmitting(false)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => router.push("/workspace"), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="text-[13px] text-[var(--text-muted)]">Loading...</div>
      </div>
    )
  }

  if (!validSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-6 w-full max-w-[380px] px-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-center">
            <h1 className="text-[20px] font-bold text-[var(--text)] mb-2">Invalid or expired link</h1>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
          </div>
          <a href="/auth/forgot-password">
            <Button className="w-full h-10 text-[13px] font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-[12px]">
              Request New Link
            </Button>
          </a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-6 w-full max-w-[380px] px-6">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-center">
            <h1 className="text-[20px] font-bold text-[var(--text)] mb-2">Password updated</h1>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              Your password has been updated. Redirecting you to the workspace...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
      <div className="flex flex-col items-center gap-8 w-full max-w-[360px] px-6">
        <Image
          src="/udon-logo.png"
          alt="Udon"
          width={120}
          height={120}
          priority
          className="drop-shadow-sm"
        />

        <div className="w-full flex flex-col gap-6">
          <div className="text-center">
            <h1 className="text-[20px] font-bold text-[var(--text)] mb-2">Set new password</h1>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                New Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                className="h-10 border-[var(--border-default)] bg-white text-[13px] rounded-[12px] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                required
                className="h-10 border-[var(--border-default)] bg-white text-[13px] rounded-[12px] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>

            {error && (
              <p className="text-[12px] text-[var(--danger)]">{error}</p>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-10 text-[13px] font-semibold bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white border-[var(--accent)] rounded-[12px] transition-all disabled:opacity-50"
            >
              {submitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
