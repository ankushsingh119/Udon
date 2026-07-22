"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle2, Mail, ArrowLeft } from "lucide-react"

type AuthMode = "signin" | "signup"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<AuthMode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [showVerification, setShowVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        router.replace("/workspace")
      } else {
        setLoading(false)
      }
    })
  }, [router, supabase])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match")
        setSubmitting(false)
        return
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters")
        setSubmitting(false)
        return
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(error.message)
        setSubmitting(false)
        return
      }
      setVerificationEmail(email)
      setShowVerification(true)
      setSubmitting(false)
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        setError(error.message)
        setSubmitting(false)
        return
      }
      router.push("/workspace")
    }
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      },
    })
  }

  if (loading) return null

  const AuthStyles = () => (
    <style>{`
      @keyframes auth-gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
    `}</style>
  )

  const LeftPanel = ({ heading, subtext }: { heading: string; subtext: string }) => (
    <div
      className="hidden lg:flex lg:w-[45%] relative overflow-hidden"
      style={{
        background: "linear-gradient(-45deg, #c45a75, #E84855, #d67088, #b84060)",
        backgroundSize: "400% 400%",
        animation: "auth-gradient 12s ease infinite",
      }}
    >
      <AuthStyles />

      {/* Content - left-aligned, premium */}
      <div className="relative z-10 flex flex-col justify-between w-full p-12">
        {/* Logo - top left, large, white version */}
        <Link href="/" className="block">
          <Image
            src="/udon-logo.png"
            alt="Udon"
            width={260}
            height={88}
            style={{ height: 88, width: "auto", filter: "brightness(0) invert(1)" }}
            priority
          />
        </Link>

        {/* Heading + body - center-left */}
        <div className="flex-1 flex flex-col justify-center max-w-lg">
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "clamp(2.5rem, 5.5vw, 3.75rem)",
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              color: "white",
              marginBottom: "1.25rem",
            }}
          >
            {heading}
          </h1>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(1rem, 1.8vw, 1.2rem)",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            {subtext}
          </p>
        </div>

        {/* Bottom tagline */}
        <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-sans)" }}>
          On-brand marketing intelligence for small businesses.
        </p>
      </div>
    </div>
  )

  if (showVerification) {
    return (
      <div className="flex min-h-screen">
        <LeftPanel
          heading="Check your email"
          subtext="We sent a verification link to complete your sign up. Click the link to get started."
        />

        {/* Right panel - verification content */}
        <div className="flex flex-1 items-center justify-center p-8" style={{ background: "var(--white)" }}>
          <div className="flex flex-col items-start gap-6 w-full max-w-[360px]">
            <Link href="/" className="mb-2 lg:hidden">
              <Image src="/udon-logo.png" alt="Udon" width={120} height={42} style={{ height: 42, width: "auto" }} />
            </Link>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "var(--success-light)" }}
            >
              <CheckCircle2 className="w-7 h-7" style={{ color: "var(--success)" }} />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-[var(--text)] mb-2">Check your email</h2>
              <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed">
                We sent a verification link to{" "}
                <span className="font-semibold text-[var(--text)]">{verificationEmail}</span>
              </p>
            </div>
            <div
              className="w-full p-4 rounded-[10px]"
              style={{
                background: "var(--cloud)",
                border: "1px solid var(--border-light)",
              }}
            >
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--coral)" }} />
                <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
                  Click the link in the email to verify your account. You can then sign in with your email and password.
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setShowVerification(false)
                setMode("signin")
                setEmail("")
                setPassword("")
                setConfirmPassword("")
              }}
              className="udon-btn udon-btn-secondary w-full h-11 text-[13px] font-semibold rounded-[8px]"
            >
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <LeftPanel
        heading={mode === "signin" ? "Welcome back" : "Build better campaigns"}
        subtext={
          mode === "signin"
            ? "Sign in to manage your campaigns, brand profiles, and content strategy."
            : "Create your account and start generating on-brand content in minutes."
        }
      />

      {/* Right panel - form */}
      <div className="flex flex-1 items-center justify-center p-8" style={{ background: "var(--white)" }}>
        <div className="flex flex-col gap-7 w-full max-w-[360px]">
          {/* Back to home */}
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to home
          </Link>

          <div className="flex justify-center lg:hidden">
            <Image src="/udon-logo.png" alt="Udon" width={140} height={48} style={{ height: 48, width: "auto" }} />
          </div>

          <div>
            <h2 className="text-[22px] font-bold text-[var(--text)] tracking-[-0.02em] mb-1.5">
              {mode === "signin" ? "Sign in" : "Create account"}
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)]">
              {mode === "signin"
                ? "Enter your credentials to continue"
                : "Get started with your free account"}
            </p>
          </div>

          {/* Tab switcher */}
          <div
            className="w-full flex rounded-[10px] p-1"
            style={{ background: "var(--cloud)" }}
          >
            <button
              onClick={() => { setMode("signin"); setError("") }}
              className="flex-1 py-2.5 text-[13px] font-semibold rounded-[8px] transition-all duration-200"
              style={
                mode === "signin"
                  ? { background: "var(--white)", color: "var(--text)", boxShadow: "var(--shadow-sm)" }
                  : { color: "var(--text-muted)" }
              }
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("signup"); setError("") }}
              className="flex-1 py-2.5 text-[13px] font-semibold rounded-[8px] transition-all duration-200"
              style={
                mode === "signup"
                  ? { background: "var(--white)", color: "var(--text)", boxShadow: "var(--shadow-sm)" }
                  : { color: "var(--text-muted)" }
              }
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                  Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="udon-input h-11 text-[13px]"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="udon-input h-11 text-[13px]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                  required
                  className="udon-input h-11 text-[13px] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    className="udon-input h-11 text-[13px] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === "signin" && (
              <div className="flex justify-end">
                <a
                  href="/auth/forgot-password"
                  className="text-[12px] font-medium transition-colors duration-150"
                  style={{ color: "var(--coral)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--coral-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--coral)")}
                >
                  Forgot password?
                </a>
              </div>
            )}

            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-[8px]"
                style={{
                  background: "var(--danger-light)",
                  border: "1px solid rgba(239, 68, 68, 0.1)",
                }}
              >
                <p className="text-[12px]" style={{ color: "var(--danger)" }}>{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="udon-btn udon-btn-primary w-full h-11 text-[13px] font-semibold rounded-[8px] disabled:opacity-50"
            >
              {submitting
                ? "Please wait..."
                : mode === "signin"
                ? "Sign In"
                : "Create Account"}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Separator className="flex-1" style={{ background: "var(--border-light)" }} />
            <span className="text-[11px] text-[var(--text-muted)] font-medium">or</span>
            <Separator className="flex-1" style={{ background: "var(--border-light)" }} />
          </div>

          {/* Google OAuth */}
          <Button
            variant="secondary"
            onClick={handleGoogleLogin}
            className="udon-btn udon-btn-secondary w-full h-11 text-[13px] font-semibold rounded-[8px]"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          {/* Footer */}
          <p className="text-[11px] text-[var(--text-muted)] text-center leading-relaxed">
            No credit card required. 5 free campaigns per month.
          </p>
        </div>
      </div>
    </div>
  )
}
