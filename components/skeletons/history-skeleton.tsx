"use client"

export function HistorySkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8 skeleton-container">
      {/* Page header */}
      <div className="mb-8">
        <div className="skeleton-bone h-7 w-52 mb-2" />
        <div className="skeleton-bone-sm h-4 w-60" />
      </div>

      {/* Table card */}
      <div className="rounded-xl border border-[var(--border-light)] bg-white overflow-hidden">
        {/* Table header */}
        <div className="flex items-center border-b border-[var(--border)] px-4 py-2.5">
          <div className="skeleton-bone-sm h-3 w-24" />
          <div className="skeleton-bone-sm h-3 w-24 ml-auto" style={{ marginLeft: "15%" }} />
          <div className="skeleton-bone-sm h-3 w-16" style={{ marginLeft: "10%" }} />
          <div className="skeleton-bone-sm h-3 w-20 ml-auto" />
          <div className="skeleton-bone-sm h-3 w-16" style={{ marginLeft: "8%" }} />
          <div className="w-10" />
        </div>

        {/* Table rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center border-b border-[var(--border-light)] last:border-b-0 px-4 py-3"
          >
            {/* Campaign */}
            <div className="skeleton-bone-sm h-4 flex-1 max-w-[240px]" />
            {/* Platforms */}
            <div className="flex gap-1.5" style={{ marginLeft: "8%" }}>
              <div className="skeleton-bone-sm h-5 w-16 rounded-full" />
              <div className="skeleton-bone-sm h-5 w-14 rounded-full" />
            </div>
            {/* Date */}
            <div className="skeleton-bone-sm h-4 w-12" style={{ marginLeft: "8%" }} />
            {/* Generations */}
            <div className="skeleton-bone-sm h-4 w-10 ml-auto" />
            {/* Status */}
            <div className="flex items-center gap-1.5" style={{ marginLeft: "8%" }}>
              <div className="skeleton-bone-sm h-2 w-2 rounded-full" />
              <div className="skeleton-bone-sm h-3 w-16" />
            </div>
            {/* Actions */}
            <div className="skeleton-bone-sm h-7 w-7 rounded-[8px] ml-4" />
          </div>
        ))}
      </div>
    </div>
  )
}
