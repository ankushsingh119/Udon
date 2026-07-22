"use client"

export function BillingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8 skeleton-container">
      {/* Page header */}
      <div className="mb-8">
        <div className="skeleton-bone h-7 w-32 mb-2" />
        <div className="skeleton-bone-sm h-4 w-72" />
      </div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Free plan */}
        <div className="rounded-xl border border-[var(--border-light)] bg-white p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="skeleton-bone w-10 h-10 rounded-[10px]" />
              <div>
                <div className="skeleton-bone-sm h-5 w-12 mb-1.5" />
                <div className="skeleton-bone-sm h-3 w-24" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <div className="skeleton-bone h-9 w-16" />
            <div className="skeleton-bone-sm h-4 w-12" />
          </div>
          <div className="skeleton-bone-sm h-3 w-full" />
          <div className="skeleton-bone-sm h-3 w-3/4" />
          <div className="h-px bg-[var(--border-light)]" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="skeleton-bone-sm h-4 w-4 rounded-full" />
                <div className="skeleton-bone-sm h-4 w-36" />
              </div>
            ))}
          </div>
          <div className="skeleton-bone h-11 w-full rounded-[12px]" />
        </div>

        {/* Pro plan */}
        <div className="rounded-xl border border-[var(--border-light)] bg-white p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="skeleton-bone w-10 h-10 rounded-[10px]" />
              <div>
                <div className="flex items-center gap-2">
                  <div className="skeleton-bone-sm h-5 w-10" />
                  <div className="skeleton-bone-sm h-4 w-20 rounded-full" />
                </div>
                <div className="skeleton-bone-sm h-3 w-28 mt-1.5" />
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <div className="skeleton-bone h-9 w-12" />
            <div className="skeleton-bone-sm h-4 w-12" />
          </div>
          <div className="skeleton-bone-sm h-3 w-full" />
          <div className="skeleton-bone-sm h-3 w-4/5" />
          <div className="h-px bg-[var(--border-light)]" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="skeleton-bone-sm h-4 w-4 rounded-full" />
                <div className="skeleton-bone-sm h-4 w-32" />
              </div>
            ))}
          </div>
          <div className="skeleton-bone h-11 w-full rounded-[12px]" />
        </div>
      </div>
    </div>
  )
}
