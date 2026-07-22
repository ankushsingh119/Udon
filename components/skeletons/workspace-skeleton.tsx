"use client"

export function WorkspaceSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8 skeleton-container">
      {/* Page header */}
      <div className="mb-8">
        <div className="skeleton-bone h-7 w-64 mb-2" />
        <div className="skeleton-bone-sm h-4 w-80" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input card */}
          <div className="rounded-xl border border-[var(--border-light)] bg-white p-6 space-y-5">
            {/* Textarea label */}
            <div>
              <div className="skeleton-bone-sm h-3 w-48 mb-3" />
              <div className="skeleton-bone h-28 w-full" />
            </div>
            {/* Platform selector label */}
            <div>
              <div className="skeleton-bone-sm h-3 w-36 mb-3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton-bone-sm h-10 w-full rounded-[10px]" />
                ))}
              </div>
            </div>
            {/* Generate button */}
            <div className="skeleton-bone h-12 w-full rounded-[12px]" />
          </div>

          {/* Empty state placeholder */}
          <div className="rounded-xl border border-dashed border-[var(--border-default)] p-8 flex flex-col items-center">
            <div className="skeleton-bone w-16 h-16 rounded-[16px] mb-4" />
            <div className="skeleton-bone-sm h-4 w-32 mb-2" />
            <div className="skeleton-bone-sm h-3 w-56" />
          </div>
        </div>

        {/* Sidebar — 1 col */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="skeleton-bone-sm h-3 w-32" />
            <div className="skeleton-bone-sm h-3 w-4" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-[var(--border-light)] bg-white p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="skeleton-bone-sm h-4 flex-1" />
                  <div className="skeleton-bone-sm h-4 w-4 ml-2" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="skeleton-bone-sm h-2 w-2 rounded-full" />
                  <div className="skeleton-bone-sm h-3 w-16" />
                </div>
                <div className="flex gap-1">
                  <div className="skeleton-bone-sm h-4 w-16 rounded-full" />
                  <div className="skeleton-bone-sm h-4 w-14 rounded-full" />
                </div>
                <div className="skeleton-bone-sm h-2.5 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
