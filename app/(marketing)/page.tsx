"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { ChevronDown, Menu, X } from "lucide-react"

function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect() } },
      { threshold: 0.1, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return { ref, inView }
}

const FAQ_ITEMS = [
  { q: "What happens with my data after I create a campaign?", a: "You maintain full ownership of your data. We only store what is necessary for your campaigns to function, and you can delete your data at any time." },
  { q: "What platforms does Udon support?", a: "Udon supports Instagram, Facebook, LinkedIn, X (Twitter), and more. Each platform gets content optimized for its specific format and audience." },
  { q: "How is this different from using ChatGPT?", a: "While ChatGPT is great for conversations, Udon is built specifically for marketing campaigns. It extracts your brand identity, understands platform requirements, and generates complete multi-platform campaigns, not just text." },
  { q: "Do I need marketing experience to use Udon?", a: "Not at all. Simply paste your website URL and describe what you want to promote. Udon handles the rest: brand extraction, copywriting, visual generation, and platform optimization." },
]

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false) })
  }, [supabase])

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, rgba(232,72,85,0.02) 0%, var(--bg) 30%, var(--bg) 70%, rgba(232,72,85,0.015) 100%)" }}>
      {/* ================================================================
         HEADER - Unified pill: logo + nav + CTA
         ================================================================ */}
      <header className="fixed inset-x-0 z-50" style={{ top: 16 }}>
        <div className="mx-auto px-6 md:px-20 flex items-center justify-center" style={{ maxWidth: 1400 }}>
          <nav
            className="hidden md:flex items-center w-full"
            style={{
              maxWidth: 1080,
              background: "white",
              borderRadius: 20,
              boxShadow: "0 1px 8px rgba(0,0,0,0.04), 0 0 1px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.06)",
              padding: "0 20px",
              height: 60,
            }}
          >
            <Link href="/" className="shrink-0 flex items-center">
              <Image src="/udon-logo.png" alt="Udon" width={150} height={50} priority style={{ height: 50, width: "auto" }} />
            </Link>
            <div className="ml-auto flex items-center" style={{ gap: 8 }}>
              <div className="w-px h-5" style={{ background: "rgba(0,0,0,0.08)" }} />
              {[
                { label: "Features", href: "#features" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "FAQ", href: "#faq" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-[13px] font-medium transition-colors hover:text-black px-3 py-2"
                  style={{ color: "#525252", fontFamily: "var(--font-sans)" }}
                >
                  {item.label}
                </a>
              ))}
              <div className="w-px h-5" style={{ background: "rgba(0,0,0,0.08)" }} />
              <Link
                href="/login"
                className="inline-flex items-center justify-center cursor-pointer whitespace-nowrap select-none text-[13px] font-semibold transition-all rounded-xl"
                style={{ background: "var(--carbon)", color: "white", fontFamily: "var(--font-sans)", padding: "0 18px", height: 36 }}
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center cursor-pointer whitespace-nowrap select-none text-[13px] font-semibold transition-all rounded-xl"
                style={{ background: "#E84855", color: "white", boxShadow: "0 1px 6px rgba(232,72,85,0.25)", fontFamily: "var(--font-sans)", padding: "0 18px", height: 36 }}
              >
                Sign up
              </Link>
            </div>
          </nav>
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div
            className="md:hidden mx-6 mt-2 rounded-2xl p-4 flex flex-col gap-2"
            style={{
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
            }}
          >
            <Link href="/" className="px-4 py-2 mb-2">
              <Image src="/udon-logo.png" alt="Udon" width={100} height={34} style={{ height: 34, width: "auto" }} />
            </Link>
            {[
              { label: "Features", href: "#features" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-3 text-[14px] font-medium transition-all hover:bg-black/5"
                style={{ color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="h-px my-1" style={{ background: "rgba(0,0,0,0.06)" }} />
            <Link href="/login" className="rounded-xl px-4 py-3 text-[14px] font-semibold text-center" style={{ background: "var(--carbon)", color: "white", fontFamily: "var(--font-sans)" }}>
              Log in
            </Link>
            <Link href="/login" className="rounded-xl px-4 py-3 text-[14px] font-semibold text-center" style={{ background: "#E84855", color: "white", fontFamily: "var(--font-sans)" }}>
              Sign up
            </Link>
          </div>
        )}
      </header>

      <main className="flex flex-col w-full" style={{ overflowX: "hidden" }}>
        {/* ================================================================
           HERO SECTION - Layered blob gradient + accurate dashboard
           ================================================================ */}
        <section className="relative w-full pt-32 pb-12 md:pt-36 md:pb-16">
          <div
            aria-hidden="true"
            style={{
              position: "absolute", top: "20%", left: "35%", width: "90vw", height: "100vh",
              maxWidth: 1800, maxHeight: 1600, borderRadius: "50%",
              background: "radial-gradient(ellipse at 50% 50%, #FFD3D8 0%, rgba(255,211,216,0.45) 30%, rgba(255,211,216,0) 65%)",
              filter: "blur(300px)", opacity: 0.8, zIndex: 0, pointerEvents: "none" as const,
              transform: "translate(-20%, -25%)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute", top: "28%", left: "28%", width: "75vw", height: "70vh",
              maxWidth: 1500, maxHeight: 1200, borderRadius: "50%",
              background: "radial-gradient(ellipse at 50% 50%, #F48A94 0%, rgba(244,138,148,0.4) 30%, rgba(244,138,148,0) 60%)",
              filter: "blur(280px)", opacity: 0.6, zIndex: 0, pointerEvents: "none" as const,
              transform: "translate(-25%, -20%)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute", top: "38%", left: "25%", width: "55vw", height: "65vh",
              maxWidth: 1100, maxHeight: 1000, borderRadius: "50%",
              background: "radial-gradient(ellipse at 45% 55%, #E84855 0%, rgba(232,72,85,0.35) 28%, rgba(232,72,85,0) 55%)",
              filter: "blur(260px)", opacity: 0.55, zIndex: 0, pointerEvents: "none" as const,
              transform: "translate(-30%, -15%)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute", top: "50%", left: "28%", width: "38vw", height: "48vh",
              maxWidth: 760, maxHeight: 760, borderRadius: "50%",
              background: "radial-gradient(ellipse at 50% 50%, #C5283D 0%, rgba(197,40,61,0.28) 25%, rgba(197,40,61,0) 55%)",
              filter: "blur(240px)", opacity: 0.5, zIndex: 0, pointerEvents: "none" as const,
              transform: "translate(-35%, -10%)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute", top: "18%", left: "45%", width: "60vw", height: "55vh",
              maxWidth: 1200, maxHeight: 900, borderRadius: "50%",
              background: "radial-gradient(ellipse at 50% 50%, #FFE8EB 0%, rgba(255,232,235,0.2) 35%, rgba(255,232,235,0) 65%)",
              filter: "blur(320px)", opacity: 0.7, zIndex: 0, pointerEvents: "none" as const,
              transform: "translate(-10%, -30%)",
            }}
          />

          <div className="relative z-10 max-w-[1200px] mx-auto px-6">
            <div className="flex flex-col items-center text-center space-y-5 mb-10">
              <h1
                className="max-w-2xl"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(2rem, 5vw, 3.25rem)",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  letterSpacing: "-0.025em",
                  color: "var(--carbon)",
                }}
              >
                Create campaigns that feel <span style={{ color: "#E84855" }}>unmistakably yours</span>
              </h1>
              <p
                className="max-w-lg"
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--text-secondary)",
                  fontSize: "clamp(0.9rem, 1.5vw, 1.05rem)",
                  lineHeight: 1.6,
                  textWrap: "balance",
                }}
              >
                Turn your website into on-brand, multi-platform campaigns in minutes. No briefs. Just paste, pick, and publish.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <Link
                  href={user ? "/workspace" : "/login"}
                  className="inline-flex items-center justify-center cursor-pointer whitespace-nowrap select-none rounded-xl text-[14px] font-semibold transition-all h-11 px-6"
                  style={{
                    background: "#E84855",
                    color: "white",
                    boxShadow: "0 2px 12px rgba(232,72,85,0.3)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {user ? "Go to Dashboard" : "Get Started Free"}
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center cursor-pointer whitespace-nowrap select-none rounded-xl text-[14px] font-semibold transition-all h-11 px-6"
                  style={{
                    background: "white",
                    color: "var(--text)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  See How It Works
                </a>
              </div>
            </div>

            {/* ================================================================
                 ACCURATE DASHBOARD PREVIEW - Matches real workspace layout
                 ================================================================ */}
            <div
              className="relative max-w-[1080px] mx-auto"
              style={{
                filter: "drop-shadow(0 25px 60px rgba(0,0,0,0.12)) drop-shadow(0 10px 20px rgba(0,0,0,0.06))",
                zIndex: 1,
              }}
            >
              <div
                className="rounded-xl overflow-hidden flex"
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  aspectRatio: "16/10",
                }}
              >
                {/* Light sidebar - matches real product */}
                <div
                  className="shrink-0 flex flex-col"
                  style={{
                    width: "16%",
                    minWidth: 160,
                    background: "#f0f0f0",
                    borderRight: "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <div className="flex items-center" style={{ height: 52, padding: "0 14px" }}>
                    <div className="flex items-center gap-2">
                      <Image src="/udon-logo.png" alt="" width={28} height={28} style={{ height: 28, width: "auto" }} />
                    </div>
                  </div>
                  <div className="mx-3 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
                  <div className="flex-1 py-3 flex flex-col" style={{ gap: 2 }}>
                    {[
                      { label: "Workspace", active: true, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg> },
                      { label: "Brand Profile", active: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg> },
                      { label: "History", active: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
                      { label: "Billing", active: false, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg> },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center relative"
                        style={{
                          height: 32,
                          margin: "0 6px",
                          borderRadius: 6,
                          padding: "0 10px",
                          background: item.active ? "rgba(232,72,85,0.08)" : "transparent",
                        }}
                      >
                        {item.active && (
                          <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3 rounded-r-full"
                            style={{ background: "#E84855" }}
                          />
                        )}
                        <span className="mr-2.5 shrink-0" style={{ color: item.active ? "#E84855" : "rgba(0,0,0,0.35)" }}>
                          {item.icon}
                        </span>
                        <span
                          className="text-[11px] font-medium whitespace-nowrap"
                          style={{ color: item.active ? "#E84855" : "#525252", fontFamily: "var(--font-sans)" }}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="py-3">
                    <div className="mx-3 mb-2 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
                    <div
                      className="flex items-center"
                      style={{ height: 32, margin: "0 6px", borderRadius: 6, padding: "0 10px" }}
                    >
                      <span className="mr-2.5 shrink-0" style={{ color: "rgba(0,0,0,0.35)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                      </span>
                      <span className="text-[11px] font-medium" style={{ color: "#525252", fontFamily: "var(--font-sans)" }}>Settings</span>
                    </div>
                  </div>
                </div>

                {/* Main content area */}
                <div className="flex-1 flex flex-col" style={{ background: "#f7f7f7" }}>
                  {/* Header */}
                  <div
                    className="flex items-center justify-between shrink-0"
                    style={{
                      height: 48,
                      padding: "0 20px",
                      background: "rgba(250,250,250,0.8)",
                      backdropFilter: "blur(16px)",
                      borderBottom: "1px solid rgba(0,0,0,0.06)",
                    }}
                  >
                    <span className="text-[13px] font-bold" style={{ color: "#111111", fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}>Campaign Workspace</span>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: "#E84855" }}>A</div>
                  </div>

                  <div className="flex-1 flex overflow-hidden">
                    {/* Left: Input + Generated content */}
                    <div className="flex-1 p-4 overflow-hidden" style={{ fontFamily: "var(--font-sans)" }}>
                      {/* Input card */}
                      <div className="rounded-lg p-3 mb-3" style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                        <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#737373" }}>Product / Service Description</div>
                        <div
                          className="w-full rounded-md p-2 text-[10px] leading-relaxed mb-2"
                          style={{ background: "#f5f5f5", color: "#525252", border: "1px solid #d4d4d4", minHeight: 40 }}
                        >
                          Organic skincare line made with natural ingredients. Clean beauty for conscious consumers.
                        </div>
                        <div className="text-[9px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#737373" }}>Select Platforms</div>
                        <div className="flex gap-1.5 mb-2.5">
                          {[
                            { name: "Instagram", sel: true, c: "#E1306C" },
                            { name: "Facebook", sel: true, c: "#1877F2" },
                            { name: "LinkedIn", sel: false, c: "#0A66C2" },
                            { name: "X", sel: false, c: "#1DA1F2" },
                          ].map((p) => (
                            <div
                              key={p.name}
                              className="flex items-center gap-1 px-1.5 py-1 rounded text-[8px] font-medium"
                              style={{
                                background: p.sel ? `${p.c}10` : "white",
                                color: p.sel ? p.c : "#a3a3a3",
                                border: `1px solid ${p.sel ? `${p.c}30` : "#e5e5e5"}`,
                              }}
                            >
                              {p.name}
                            </div>
                          ))}
                        </div>
                        <div
                          className="w-full py-2 rounded-lg text-[10px] font-semibold text-center text-white flex items-center justify-center gap-1.5"
                          style={{ background: "#E84855" }}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10 }}>
                            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                          </svg>
                          Generate Campaign Content
                        </div>
                      </div>

                      {/* Generated Content */}
                      <div className="text-[10px] font-semibold mb-1.5" style={{ color: "#111111" }}>Generated Content</div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { p: "Instagram", type: "Post", color: "#E1306C" },
                          { p: "Facebook", type: "Story", color: "#1877F2" },
                        ].map((a, i) => (
                          <div key={i} className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)", background: "white" }}>
                            <div className="aspect-square" style={{ background: `linear-gradient(135deg, ${a.color}08, ${a.color}04)` }}>
                              <div className="w-full h-full flex items-center justify-center">
                                {a.p === "Instagram" ? (
                                  <svg viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28, opacity: 0.5 }}>
                                    <rect x="2" y="2" width="20" height="20" rx="5" />
                                    <circle cx="12" cy="12" r="5" />
                                    <circle cx="17.5" cy="6.5" r="1" fill={a.color} stroke="none" />
                                  </svg>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill={a.color} style={{ width: 28, height: 28, opacity: 0.5 }}>
                                    <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="p-2">
                              <div className="flex items-center gap-1 mb-1">
                                <span className="px-1 py-0 rounded text-[7px] font-medium" style={{ background: `${a.color}12`, color: a.color }}>{a.p}</span>
                                <span className="px-1 py-0 rounded text-[7px] font-medium" style={{ background: "#f5f5f5", color: "#a3a3a3" }}>{a.type}</span>
                              </div>
                              <div className="text-[8px] leading-snug line-clamp-2" style={{ color: "#525252" }}>
                                Meet the product you didn&apos;t know you needed. Organic skincare made with care for conscious consumers...
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Campaign History */}
                    <div
                      className="shrink-0 flex flex-col overflow-hidden"
                      style={{
                        width: "28%",
                        minWidth: 180,
                        background: "white",
                        borderLeft: "1px solid rgba(0,0,0,0.08)",
                      }}
                    >
                      <div className="flex items-center justify-between px-3 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                        <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "#737373" }}>Campaign History</span>
                        <span className="text-[8px]" style={{ color: "#a3a3a3" }}>3</span>
                      </div>
                      <div className="flex-1 overflow-hidden p-2 flex flex-col" style={{ gap: 6 }}>
                        {[
                          { title: "Summer Sale 2025", status: "ready", platforms: ["Instagram", "Facebook"], date: "Jul 16" },
                          { title: "Product Launch", status: "ready", platforms: ["Instagram", "LinkedIn"], date: "Jul 15" },
                          { title: "Holiday Campaign", status: "draft", platforms: ["Facebook", "X"], date: "Jul 14" },
                          { title: "Back to School", status: "ready", platforms: ["X"], date: "Jul 12" },
                        ].map((c, i) => (
                          <div
                            key={i}
                            className="rounded-lg p-2"
                            style={{
                              background: i === 0 ? "white" : "transparent",
                              border: i === 0 ? "1.5px solid rgba(232,72,85,0.2)" : "1px solid transparent",
                              boxShadow: i === 0 ? "0 1px 4px rgba(232,72,85,0.06)" : "none",
                            }}
                          >
                            <div className="text-[10px] font-semibold truncate mb-0.5" style={{ color: "#111111" }}>{c.title}</div>
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.status === "ready" ? "#22c55e" : "#a3a3a3" }} />
                              <span className="text-[8px] capitalize" style={{ color: "#a3a3a3" }}>{c.status}</span>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {c.platforms.map((p) => (
                                <span key={p} className="px-1 py-0 rounded text-[7px] font-medium" style={{ background: "#f5f5f5", color: "#525252", border: "1px solid #e5e5e5" }}>{p}</span>
                              ))}
                            </div>
                            <div className="text-[7px] mt-1" style={{ color: "#a3a3a3" }}>{c.date}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
           MANIFESTO - Centered text strip below hero
           ================================================================ */}
        <SectionFade>
          <div className="max-w-[780px] mx-auto px-6 py-16 md:py-20">
            <h2
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                fontWeight: 700,
                color: "var(--carbon)",
                letterSpacing: "-0.01em",
                lineHeight: 1.45,
                marginBottom: "1.5rem",
              }}
            >
              Most marketing tools scale output, not brand. They help you post more, but they don&apos;t help you say something worth reading.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: "-0.01em",
                lineHeight: 1.45,
              }}
            >
              Udon extracts your brand identity from your website, giving small businesses the marketing sophistication that enterprise brands hire agencies for.
            </p>
          </div>
        </SectionFade>

        {/* ================================================================
           FEATURES SECTION - 3-column grid
           ================================================================ */}
        <div className="w-full py-16 md:py-20" style={{ background: "var(--cloud)" }}>
          <section id="features" className="max-w-[1000px] mx-auto px-6">
            <SectionFade>
              <div className="space-y-3 flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-12">
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
                    fontWeight: 700,
                    color: "var(--carbon)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Built to protect and grow your brand
                </h2>
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                  Udon runs always-on AI across your brand, connecting signals from your website,
                  content, and audience into clear campaigns and next actions.
                </p>
              </div>
            </SectionFade>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Brand-aware generation",
                  desc: "Copy, visuals, and captions that match your brand voice and colors across every platform.",
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.07-1.37" /><path d="M17 8l4 4-4 4" /><path d="M21 12H9" /><circle cx="12" cy="12" r="3" /></svg>,
                },
                {
                  title: "Multi-platform campaigns",
                  desc: "Instagram, Facebook, LinkedIn, and X content from a single description.",
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8" /><path d="M12 17v4" /><path d="M6 10h.01" /><path d="M10 10h.01" /><path d="M14 10h.01" /></svg>,
                },
                {
                  title: "Campaign history",
                  desc: "Track, regenerate, or duplicate past campaigns with full version history.",
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
                },
                {
                  title: "Brand extraction",
                  desc: "Paste your URL and Udon extracts your colors, fonts, tone, and audience.",
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
                },
                {
                  title: "Asset locking",
                  desc: "Lock an image while regenerating copy, or lock copy while regenerating images.",
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>,
                },
                {
                  title: "Platform optimization",
                  desc: "Each asset is sized, formatted, and written for its specific platform.",
                  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
                },
              ].map((feature) => (
                <FeatureCard key={feature.title} title={feature.title} desc={feature.desc} icon={feature.icon} />
              ))}
            </div>
          </section>
        </div>

        {/* ================================================================
           HOW IT WORKS - 3 alternating steps with mockup screenshots
           ================================================================ */}
        <div className="w-full py-16 md:py-20" style={{ background: "white" }}>
          <section id="how-it-works" className="max-w-[1000px] mx-auto px-6">
            <SectionFade>
              <div className="text-center mb-14">
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
                    fontWeight: 700,
                    color: "var(--carbon)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Three steps to your next campaign
                </h2>
                <p className="text-[14px] leading-relaxed mt-3 max-w-lg mx-auto" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                  From URL to published content in minutes. No design skills or marketing experience needed.
                </p>
              </div>
            </SectionFade>

            <div className="space-y-20">
              {/* Step 1: Text Left → Image Right */}
              <SectionFade>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div className="space-y-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold"
                      style={{ background: "#E84855", color: "white", fontFamily: "var(--font-sans)" }}
                    >
                      01
                    </div>
                    <h3 className="text-[20px] font-bold" style={{ color: "var(--carbon)", fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}>
                      Paste your website URL
                    </h3>
                    <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                      Udon extracts your brand identity — colors, fonts, tone, mission, and target audience — from your existing web presence. No manual setup required.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <StepMockup1 />
                  </div>
                </div>
              </SectionFade>

              {/* Step 2: Image Left → Text Right */}
              <SectionFade>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div className="flex justify-center order-2 md:order-1">
                    <StepMockup2 />
                  </div>
                  <div className="space-y-4 order-1 md:order-2">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold"
                      style={{ background: "#E84855", color: "white", fontFamily: "var(--font-sans)" }}
                    >
                      02
                    </div>
                    <h3 className="text-[20px] font-bold" style={{ color: "var(--carbon)", fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}>
                      Describe your campaign
                    </h3>
                    <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                      Tell Udon what you want to promote in plain English — a product launch, a seasonal sale, or a brand announcement. Select your platforms and go.
                    </p>
                  </div>
                </div>
              </SectionFade>

              {/* Step 3: Text Left → Image Right */}
              <SectionFade>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div className="space-y-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold"
                      style={{ background: "#E84855", color: "white", fontFamily: "var(--font-sans)" }}
                    >
                      03
                    </div>
                    <h3 className="text-[20px] font-bold" style={{ color: "var(--carbon)", fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}>
                      Generate &amp; launch
                    </h3>
                    <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                      Receive complete, on-brand assets for every platform. Copy, images, and formatting — ready to publish. Track performance and regenerate as needed.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    <StepMockup3 />
                  </div>
                </div>
              </SectionFade>
            </div>
          </section>
        </div>

        {/* ================================================================
           PLATFORMS - Cloud background, 4-col grid
           ================================================================ */}
        <div className="w-full py-16 md:py-20" style={{ background: "var(--cloud)" }}>
          <section id="integrations" className="max-w-[1000px] mx-auto px-6">
            <SectionFade>
              <div className="space-y-3 flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-12">
                <h2
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
                    fontWeight: 700,
                    color: "var(--carbon)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Optimized for every platform you use
                </h2>
                <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                  Each platform gets content formatted and written for its specific audience, dimensions, and algorithm.
                </p>
              </div>
            </SectionFade>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  name: "Instagram",
                  color: "#E1306C",
                  desc: "Posts, Stories, Reels",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <rect x="2" y="2" width="20" height="20" rx="5" />
                      <circle cx="12" cy="12" r="5" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                    </svg>
                  ),
                },
                {
                  name: "Facebook",
                  color: "#1877F2",
                  desc: "Posts, Stories, Pages",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.875V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z" />
                    </svg>
                  ),
                },
                {
                  name: "LinkedIn",
                  color: "#0A66C2",
                  desc: "Posts, Articles",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  ),
                },
                {
                  name: "X (Twitter)",
                  color: "#000000",
                  desc: "Threads, Posts",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
              ].map((p) => (
                <div
                  key={p.name}
                  className="rounded-xl p-4 text-center space-y-2"
                  style={{ background: "white", border: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center" style={{ color: p.color }}>
                    {p.icon}
                  </div>
                  <div className="text-[13px] font-semibold" style={{ color: "var(--carbon)", fontFamily: "var(--font-sans)" }}>{p.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>{p.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ================================================================
           FAQ SECTION
           ================================================================ */}
        <section id="faq" className="w-full py-16 md:py-20" style={{ background: "white" }}>
          <div className="max-w-[700px] mx-auto px-6">
            <SectionFade>
              <div className="text-center mb-10">
                <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 700, color: "var(--carbon)", letterSpacing: "-0.02em" }}>
                  Frequently asked questions
                </h2>
                <p className="text-[14px] leading-relaxed mt-3" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                  Everything you need to know about getting started with Udon.
                </p>
              </div>
            </SectionFade>

            <div className="flex flex-col">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="border-b" style={{ borderColor: "var(--border-light)" }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between py-5 px-0 text-left transition-colors hover:text-[var(--text)]"
                    style={{ color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                  >
                    <span className="text-[14px] leading-[150%] pr-4 font-medium">{item.q}</span>
                    <ChevronDown
                      className="shrink-0 transition-transform duration-200"
                      style={{
                        width: 18,
                        height: 18,
                        color: "var(--text-muted)",
                        transform: openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-200"
                    style={{
                      maxHeight: openFaq === i ? "200px" : "0px",
                      opacity: openFaq === i ? 1 : 0,
                    }}
                  >
                    <p className="text-[13px] leading-[170%] pt-1 pb-5" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
           CTA SECTION - Vertically centered
           ================================================================ */}
        <section className="w-full px-6 py-10 md:py-12">
          <div
            className="max-w-[1000px] mx-auto rounded-2xl overflow-hidden relative"
            style={{
              background: "white",
              border: "1px solid rgba(0,0,0,0.06)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
              <div
                className="cta-gradient-1"
                style={{
                  position: "absolute", top: "-50%", right: "-20%", width: "70%", height: "140%",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse at center, rgba(232,72,85,0.28) 0%, rgba(232,72,85,0.12) 45%, transparent 70%)",
                  filter: "blur(50px)",
                }}
              />
              <div
                className="cta-gradient-2"
                style={{
                  position: "absolute", bottom: "-40%", left: "-15%", width: "60%", height: "120%",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse at center, rgba(232,72,85,0.22) 0%, rgba(232,72,85,0.08) 45%, transparent 70%)",
                  filter: "blur(45px)",
                }}
              />
              <div
                className="cta-gradient-3"
                style={{
                  position: "absolute", top: "10%", left: "20%", width: "40%", height: "80%",
                  borderRadius: "50%",
                  background: "radial-gradient(ellipse at center, rgba(197,40,61,0.18) 0%, transparent 60%)",
                  filter: "blur(40px)",
                }}
              />
            </div>

            <div className="relative z-10 text-center flex flex-col items-center justify-center py-14 px-8 md:py-16 md:px-12">
              <h2
                className="max-w-lg mx-auto mb-3"
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.4rem, 3vw, 1.85rem)",
                  fontWeight: 700,
                  color: "var(--carbon)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                }}
              >
                On-brand marketing intelligence, built for small businesses.
              </h2>
              <p className="max-w-md mx-auto mb-6 text-[14px] leading-relaxed" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
                Simply paste your website, describe your campaign, and get platform-ready content in minutes.
              </p>
              <Link
                href={user ? "/workspace" : "/login"}
                className="inline-flex items-center justify-center cursor-pointer whitespace-nowrap select-none rounded-xl text-[14px] font-semibold transition-all h-11 px-7"
                style={{
                  background: "#E84855",
                  color: "white",
                  boxShadow: "0 2px 12px rgba(232,72,85,0.3)",
                  fontFamily: "var(--font-sans)",
                }}
              >
                {user ? "Go to Dashboard" : "Get Started Free"}
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================
           FOOTER - Dark background, white text
           ================================================================ */}
        <footer
          className="w-full"
          style={{
            background: "white",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div className="max-w-[1000px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <Image src="/udon-logo.png" alt="Udon" width={150} height={50} style={{ height: 50, width: "auto", opacity: 0.85 }} />
            <div className="flex items-center gap-6">
              {[
                { label: "Features", href: "#features" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "FAQ", href: "#faq" },
                { label: "Login", href: "/login" },
                { label: "Sign Up", href: "/login" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[12px] font-medium transition-colors hover:text-[var(--text)]"
                  style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}
                >
                  {item.label}
                </a>
              ))}
            </div>
            <p className="text-[11px]" style={{ color: "var(--text-muted)", fontFamily: "var(--font-sans)" }}>
              &copy; {new Date().getFullYear()} Udon. All rights reserved.
            </p>
          </div>
        </footer>
      </main>

      <style jsx global>{`
        @keyframes ctaGradientFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-28px, 18px) scale(1.08); }
          66% { transform: translate(12px, -8px) scale(1.04); }
        }
        @keyframes ctaGradientFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(22px, -16px) scale(1.06); }
          66% { transform: translate(-16px, 10px) scale(1.03); }
        }
        @keyframes ctaGradientFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-14px, -22px) scale(1.07); }
          66% { transform: translate(18px, 12px) scale(1.04); }
        }
        .cta-gradient-1 {
          animation: ctaGradientFloat1 8s ease-in-out infinite;
        }
        .cta-gradient-2 {
          animation: ctaGradientFloat2 10s ease-in-out infinite;
        }
        .cta-gradient-3 {
          animation: ctaGradientFloat3 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

function SectionFade({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className="transition-all duration-700"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
      }}
    >
      {children}
    </div>
  )
}

function FeatureCard({
  title,
  desc,
  icon,
}: {
  title: string
  desc: string
  icon: React.ReactNode
}) {
  const { ref, inView } = useInView()
  return (
    <div
      ref={ref}
      className="transition-all duration-700 flex"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(20px)",
      }}
    >
      <div
        className="w-full p-5 rounded-xl flex flex-col"
        style={{
          background: "white",
          border: "1px solid rgba(0,0,0,0.06)",
          fontFamily: "var(--font-sans)",
        }}
      >
        <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 shrink-0" style={{ background: "#E8485512", color: "#E84855" }}>
          {icon}
        </div>
        <h3 className="text-[14px] font-semibold mb-1.5" style={{ color: "var(--carbon)" }}>{title}</h3>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
      </div>
    </div>
  )
}

/* ================================================================
   STEP MOCKUPS - Mini dashboard representations for How It Works
   ================================================================ */

function StepMockup1() {
  return (
    <div
      className="w-full max-w-[480px] rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #fef2f2 0%, #fdd5db 50%, #fcc8d0 100%)",
        padding: "24px",
      }}
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          background: "#f7f7f7",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "white" }}>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <div className="flex-1 text-center text-[10px] font-medium" style={{ color: "#a3a3a3" }}>udon.app/workspace</div>
        </div>
        <div className="p-4">
          <div className="rounded-lg p-3" style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
            <div className="text-[9px] font-semibold uppercase tracking-[0.05em] mb-1.5" style={{ color: "#737373" }}>Product / Service Description</div>
            <div
              className="w-full rounded-md p-2.5 text-[10px] leading-relaxed"
              style={{ background: "#f5f5f5", color: "#525252", border: "1px solid #d4d4d4", minHeight: 40 }}
            >
              Organic skincare line made with natural ingredients. Clean beauty for conscious consumers.
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2.5 p-2.5 rounded-lg" style={{ background: "rgba(232,72,85,0.04)", border: "1px solid rgba(232,72,85,0.12)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#E84855" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <div>
              <div className="text-[9px] font-semibold" style={{ color: "#E84855" }}>Brand extracted</div>
              <div className="text-[8px]" style={{ color: "#a3a3a3" }}>Colors, fonts, tone, audience detected</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StepMockup2() {
  const step2Platforms = [
    { id: "instagram", name: "Instagram", sel: true, color: "#E1306C", bgSelected: "rgba(225,48,108,0.06)", borderSelected: "rgba(225,48,108,0.2)" },
    { id: "facebook", name: "Facebook", sel: true, color: "#1877F2", bgSelected: "rgba(24,119,242,0.06)", borderSelected: "rgba(24,119,242,0.2)" },
    { id: "linkedin", name: "LinkedIn", sel: false, color: "#0A66C2", bgSelected: "", borderSelected: "" },
    { id: "x", name: "X (Twitter)", sel: false, color: "#111111", bgSelected: "", borderSelected: "" },
  ]
  return (
    <div
      className="w-full max-w-[480px] rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #fef2f2 0%, #fdd5db 50%, #fcc8d0 100%)",
        padding: "24px",
      }}
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          background: "#f7f7f7",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "white" }}>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <div className="flex-1 text-center text-[10px] font-medium" style={{ color: "#a3a3a3" }}>udon.app/workspace</div>
        </div>
        <div className="p-4">
          <div className="rounded-lg p-3 mb-3" style={{ background: "white", border: "1px solid rgba(0,0,0,0.08)" }}>
            <div className="text-[9px] font-semibold uppercase tracking-[0.05em] mb-1.5" style={{ color: "#737373" }}>Product / Service Description</div>
            <div
              className="w-full rounded-md p-2.5 text-[10px] leading-relaxed"
              style={{ background: "#f5f5f5", color: "#525252", border: "1px solid #d4d4d4", minHeight: 40 }}
            >
              Summer collection with 40% off on all clothing items
            </div>
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.05em] mb-2" style={{ color: "#737373" }}>Select Platforms</div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {step2Platforms.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-[10px] font-medium transition-all"
                style={{
                  background: p.sel ? p.bgSelected : "white",
                  color: p.sel ? p.color : "#a3a3a3",
                  border: `1px solid ${p.sel ? p.borderSelected : "#e5e5e5"}`,
                }}
              >
                {p.id === "instagram" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                )}
                {p.id === "facebook" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                )}
                {p.id === "linkedin" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12, flexShrink: 0 }}>
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                )}
                {p.id === "x" && (
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 12, height: 12, flexShrink: 0 }}>
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                )}
                <span className="truncate">{p.name}</span>
                {p.sel && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 10, height: 10, marginLeft: "auto", flexShrink: 0 }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            ))}
          </div>
          <div
            className="w-full py-2.5 rounded-[10px] text-[10px] font-semibold text-center text-white flex items-center justify-center gap-1.5"
            style={{ background: "#E84855" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            </svg>
            Generate Campaign Content
          </div>
        </div>
      </div>
    </div>
  )
}

function StepMockup3() {
  return (
    <div
      className="w-full max-w-[480px] rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #fef2f2 0%, #fdd5db 50%, #fcc8d0 100%)",
        padding: "24px",
      }}
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
          background: "#f7f7f7",
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "white" }}>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
            <div className="w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <div className="flex-1 text-center text-[10px] font-medium" style={{ color: "#a3a3a3" }}>udon.app/workspace</div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-semibold" style={{ color: "#111111" }}>Generated Content</div>
            <div className="text-[9px]" style={{ color: "#a3a3a3" }}>2 assets</div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { p: "Instagram", type: "Post", color: "#E1306C", platformId: "instagram" },
              { p: "Facebook", type: "Story", color: "#1877F2", platformId: "facebook" },
            ].map((a, i) => (
              <div key={i} className="rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,0,0,0.08)", background: "white" }}>
                <div className="aspect-square" style={{ background: `linear-gradient(135deg, ${a.color}08, ${a.color}04)` }}>
                  <div className="w-full h-full flex items-center justify-center">
                    {a.platformId === "instagram" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28, opacity: 0.4 }}>
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke={a.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28, opacity: 0.4 }}>
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="p-2">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="px-1.5 py-0 rounded text-[7px] font-medium" style={{ background: `${a.color}12`, color: a.color }}>{a.p}</span>
                    <span className="px-1.5 py-0 rounded text-[7px] font-medium" style={{ background: "#f5f5f5", color: "#a3a3a3" }}>{a.type}</span>
                  </div>
                  <div className="text-[8px] leading-snug line-clamp-2" style={{ color: "#525252" }}>
                    Summer collection with 40% off all items. Discover our latest styles crafted for you...
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
