"use client"

export function SettingsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8 skeleton-container">
      {/* Page header */}
      <div className="mb-8">
        <div className="skeleton-bone h-7 w-28 mb-2" />
        <div className="skeleton-bone-sm h-4 w-56" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-bone-sm h-9 w-24 rounded-lg" />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile card */}
          <div className="rounded-xl border border-[var(--border-light)] bg-white p-6 space-y-4">
            <div className="skeleton-bone h-5 w-20 mb-4" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton-bone-sm h-3 w-16" />
                  <div className="skeleton-bone h-10 w-full rounded-[8px]" />
                </div>
              ))}
            </div>
            <div className="skeleton-bone h-10 w-24 rounded-[8px]" />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Avatar card */}
          <div className="rounded-xl border border-[var(--border-light)] bg-white p-5 flex flex-col items-center">
            <div className="skeleton-bone w-20 h-20 rounded-full mb-3" />
            <div className="skeleton-bone-sm h-4 w-24 mb-2" />
            <div className="skeleton-bone-sm h-3 w-16" />
          </div>

          {/* Plan card */}
          <div className="rounded-xl border border-[var(--border-light)] bg-white p-5 space-y-3">
            <div className="skeleton-bone-sm h-4 w-16 mb-2" />
            <div className="skeleton-bone h-8 w-12" />
            <div className="skeleton-bone-sm h-3 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}
