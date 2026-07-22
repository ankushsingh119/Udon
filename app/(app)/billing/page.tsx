"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Zap, Crown, Minus } from "lucide-react"
import { BillingSkeleton } from "@/components/skeletons/billing-skeleton"
import { useSkeletonLoading } from "@/hooks/use-skeleton-loading"
const STRIPE_PRO_PRICE_ID = "price_1Tvz7RIDRagc4eENvjkeiPN2"

function BillingContent() {
  const { isLoading, isExiting } = useSkeletonLoading(2000)
  const [upgrading, setUpgrading] = useState(false)
  const [status, setStatus] = useState<"success" | "canceled" | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    setUpgrading(false)
    if (searchParams.get("success") === "true") {
      setStatus("success")
    } else if (searchParams.get("canceled") === "true") {
      setStatus("canceled")
    }
  }, [searchParams])

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: STRIPE_PRO_PRICE_ID }),
      })

      const { url } = await res.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error("Checkout error:", error)
      setUpgrading(false)
    }
  }

  if (isLoading) {
    return <div className={isExiting ? "skeleton-container-exit" : ""}><BillingSkeleton /></div>
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1
          className="text-[24px] font-bold tracking-tight text-[var(--text)]"
          style={{ letterSpacing: "-0.025em" }}
        >
          Billing
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1.5">
          Choose the plan that fits your content needs. Upgrade anytime.
        </p>
      </div>

      {status === "success" && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-green-800 text-[13px]">
            Payment successful! Your Pro plan is now active.
          </p>
        </div>
      )}

      {status === "canceled" && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-800 text-[13px]">
            Payment was cancelled. You can try again anytime.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Free Plan */}
        <Card className="udon-card flex flex-col">
          <CardContent className="flex flex-col gap-5 p-6 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[var(--bg-surface)] flex items-center justify-center">
                  <Zap size={18} className="text-[var(--text-tertiary)]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--text)]">
                    Free
                  </h3>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    For getting started
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-[36px] font-bold text-[var(--text)] leading-none" style={{ letterSpacing: "-0.03em" }}>
                $0
              </span>
              <span className="text-[13px] text-[var(--text-muted)]">
                /month
              </span>
            </div>

            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              Perfect for small businesses trying out AI-generated marketing
              content. No credit card required.
            </p>

            <Separator className="bg-[var(--border-light)]" />

            <ul className="flex flex-col gap-3 flex-1">
              <li className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--text)]">
                <Check size={15} className="text-[var(--accent)] shrink-0" />
                5 Campaigns per Month
              </li>
              <li className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--text)]">
                <Check size={15} className="text-[var(--accent)] shrink-0" />
                All Platform Sizes
              </li>
              <li className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--text)]">
                <Check size={15} className="text-[var(--accent)] shrink-0" />
                Brand Profile Extraction
              </li>
              <li className="flex items-center gap-2.5 text-[13px] text-[var(--text-muted)]">
                <Minus size={15} className="shrink-0" />
                Watermarked Exports
              </li>
            </ul>

            <Button
              disabled
              className="w-full h-11 text-[13px] font-semibold rounded-[12px] bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-default)] cursor-not-allowed opacity-60"
            >
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="udon-card-elevated flex flex-col" style={{ borderColor: 'var(--accent)', boxShadow: '0 0 0 1px var(--accent), var(--shadow-md)' }}>
          <CardContent className="flex flex-col gap-5 p-6 flex-1">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[var(--accent-light)] flex items-center justify-center">
                  <Crown size={18} className="text-[var(--accent)]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[16px] font-semibold text-[var(--text)]">
                      Pro
                    </h3>
                    <span className="badge-udon-pro text-[10px] px-2 py-0.5">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[12px] text-[var(--text-muted)]">
                    For growing businesses
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-[36px] font-bold text-[var(--text)] leading-none" style={{ letterSpacing: "-0.03em" }}>
                $5
              </span>
              <span className="text-[13px] text-[var(--text-muted)]">
                /month
              </span>
            </div>

            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
              For businesses that need unlimited, on-brand content without
              restrictions. Generate as many campaigns as you need.
            </p>

            <Separator className="bg-[var(--border-light)]" />

            <ul className="flex flex-col gap-3 flex-1">
              <li className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--text)]">
                <Check size={15} className="text-[var(--accent)] shrink-0" />
                Unlimited Campaigns
              </li>
              <li className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--text)]">
                <Check size={15} className="text-[var(--accent)] shrink-0" />
                All Platform Sizes
              </li>
              <li className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--text)]">
                <Check size={15} className="text-[var(--accent)] shrink-0" />
                Brand Profile Extraction
              </li>
              <li className="flex items-center gap-2.5 text-[13px] font-medium text-[var(--text)]">
                <Check size={15} className="text-[var(--accent)] shrink-0" />
                Clean Exports
              </li>
            </ul>

            <Button
              onClick={handleUpgrade}
              disabled={upgrading}
              className="udon-btn udon-btn-primary w-full h-11 text-[13px] font-semibold rounded-[12px]"
            >
              {upgrading ? (
                <span className="flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "currentColor",
                        display: "inline-block",
                        animation: "udon-bounce 1.4s ease-in-out infinite",
                        animationDelay: `${i * 0.16}s`,
                      }}
                    />
                  ))}
                </span>
              ) : (
                "Upgrade to Pro"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingContent />
    </Suspense>
  )
}
