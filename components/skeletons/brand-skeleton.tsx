"use client"

export function BrandSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8 skeleton-container">
      {/* Page header */}
      <div className="mb-8">
        <div className="skeleton-bone h-7 w-40 mb-2" />
        <div className="skeleton-bone-sm h-4 w-64" />
      </div>

      {/* URL input */}
      <div className="mb-6">
        <div className="skeleton-bone h-11 w-full max-w-2xl rounded-[10px]" />
      </div>

      {/* Content area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - main content */}
        <div className="md:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-bone-sm h-8 w-20 rounded-lg" />
            ))}
          </div>

          {/* Card */}
          <div className="rounded-xl border border-[var(--border-light)] bg-white p-6 space-y-4">
            <div className="skeleton-bone h-5 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="skeleton-bone-sm h-4 w-4 rounded-full" />
                  <div className="skeleton-bone-sm h-4 w-48" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - sidebar */}
        <div className="space-y-6">
          {/* Colors card */}
          <div className="rounded-xl border border-[var(--border-light)] bg-white p-5 space-y-3">
            <div className="skeleton-bone-sm h-4 w-16 mb-3" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-bone w-8 h-8 rounded-full" />
              ))}
            </div>
          </div>

          {/* Fonts card */}
          <div className="rounded-xl border border-[var(--border-light)] bg-white p-5 space-y-3">
            <div className="skeleton-bone-sm h-4 w-12 mb-3" />
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="skeleton-bone h-6 w-6 rounded" />
                <div className="skeleton-bone-sm h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
