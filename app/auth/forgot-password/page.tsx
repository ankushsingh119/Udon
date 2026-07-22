"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/update-password`,
    })

    setSubmitting(false)

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-6 w-full max-w-[380px] px-6">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-center">
            <h1 className="text-[20px] font-bold text-[var(--text)] mb-2">Check your email</h1>
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
              We sent a password reset link to<br />
              <span className="font-semibold text-[var(--text)]">{email}</span>
            </p>
          </div>
          <div className="w-full p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-light)]">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[var(--accent)] mt-0.5 shrink-0" />
              <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
            </div>
          </div>
          <Link href="/">
            <Button
              variant="secondary"
              className="w-full h-10 text-[13px] font-medium border border-[var(--border-default)] bg-white text-[var(--text)] hover:bg-gray-50 rounded-[12px]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </Link>
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
            <h1 className="text-[20px] font-bold text-[var(--text)] mb-2">Reset your password</h1>
            <p className="text-[13px] text-[var(--text-secondary)]">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
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
              {submitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <Link href="/" className="flex items-center justify-center gap-2 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text)]">
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
