"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PlatformIcon } from "@/components/ui/platform-icon"
import { MoreHorizontal, Copy, Trash2, History } from "lucide-react"
import { HistorySkeleton } from "@/components/skeletons/history-skeleton"
import { useSkeletonLoading } from "@/hooks/use-skeleton-loading"

interface Campaign {
  id: string
  description: string
  platforms: string[]
  date: string
  generationsUsed: number
  status: "ready" | "generating" | "failed" | "downloaded"
}

const mockCampaigns: Campaign[] = [
  { id: "1", description: "Summer sale, 30% off dresses this weekend", platforms: ["instagram", "facebook"], date: "Jul 16", generationsUsed: 1, status: "downloaded" },
  { id: "2", description: "New arrivals \u2014 spring collection launch", platforms: ["linkedin"], date: "Jul 15", generationsUsed: 2, status: "generating" },
  { id: "3", description: "Weekend flash sale \u2014 all categories", platforms: ["x", "instagram"], date: "Jul 12", generationsUsed: 3, status: "failed" },
  { id: "4", description: "Valentine's Day gift guide promotion", platforms: ["instagram", "facebook", "linkedin"], date: "Jul 10", generationsUsed: 4, status: "ready" },
  { id: "5", description: "Back to school \u2014 student discount campaign", platforms: ["x"], date: "Jul 8", generationsUsed: 5, status: "downloaded" },
]

const statusConfig = {
  ready: { label: "Ready", dotClass: "status-ready" },
  generating: { label: "Generating", dotClass: "status-generating" },
  failed: { label: "Failed", dotClass: "status-failed" },
  downloaded: { label: "Downloaded", dotClass: "status-downloaded" },
}

const platformLabels: Record<string, string> = {
  instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", x: "X",
}

export default function HistoryPage() {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const { isLoading, isExiting } = useSkeletonLoading(2000)

  const handleDelete = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id))
  }

  if (isLoading) {
    return <div className={isExiting ? "skeleton-container-exit" : ""}><HistorySkeleton /></div>
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="mb-8">
        <h1
          className="text-[24px] font-bold tracking-tight text-[var(--text)]"
          style={{ letterSpacing: "-0.025em" }}
        >
          Campaign History
        </h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1.5">
          View and manage your past campaigns.
        </p>
      </div>

      <Card className="udon-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2.5 px-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">Campaign</th>
                <th className="text-left py-2.5 px-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">Platforms</th>
                <th className="text-left py-2.5 px-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]" style={{ fontVariantNumeric: "tabular-nums" }}>Date</th>
                <th className="text-right py-2.5 px-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]" style={{ fontVariantNumeric: "tabular-nums" }}>Generations</th>
                <th className="text-left py-2.5 px-4 text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">Status</th>
                <th className="w-10 py-2.5 px-4" />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const status = statusConfig[campaign.status]
                return (
                  <tr key={campaign.id} className="border-b border-[var(--border-light)] last:border-b-0 hover:bg-[var(--bg-secondary)] transition-colors duration-150 cursor-pointer">
                    <td className="py-3 px-4 font-medium text-[var(--text)]">{campaign.description}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {campaign.platforms.map((p) => (
                          <span key={p} className="badge-udon-outline inline-flex items-center gap-1">
                            <PlatformIcon name={p} size={10} />
                            {platformLabels[p] || p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--text-secondary)]" style={{ fontVariantNumeric: "tabular-nums" }}>{campaign.date}</td>
                    <td className="py-3 px-4 text-right text-[var(--text-secondary)]" style={{ fontVariantNumeric: "tabular-nums" }}>{campaign.generationsUsed} of 5</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`status-dot ${status.dotClass}`} />
                        <span className="text-[var(--text-secondary)]">{status.label}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="p-1.5 rounded-[8px] hover:bg-[var(--bg-surface)] text-[var(--text-muted)] transition-colors duration-150">
                          <MoreHorizontal size={14} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-white border-[var(--border-default)] rounded-[12px] shadow-[var(--shadow-lg)]">
                          <DropdownMenuItem className="text-[12px] text-[var(--text)] gap-2 cursor-pointer">
                            <Copy size={12} />Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-[12px] text-[var(--danger)] gap-2 cursor-pointer" onClick={() => handleDelete(campaign.id)}>
                            <Trash2 size={12} />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {campaigns.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-surface)] flex items-center justify-center mb-4">
              <History size={24} className="text-[var(--text-muted)]" />
            </div>
            <p className="text-[14px] font-medium text-[var(--text-secondary)] mb-1">No campaigns yet</p>
            <p className="text-[12px] text-[var(--text-muted)]">Your generated campaigns will appear here.</p>
          </div>
        )}
      </Card>
    </div>
  )
}
