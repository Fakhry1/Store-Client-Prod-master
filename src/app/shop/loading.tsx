// src/app/shop/loading.tsx
// يُعرض تلقائياً من Next.js فوراً قبل اكتمال بيانات الـ server
// لا يحتاج import أو 'use client'

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Hero Skeleton ── */}
      <div className="bg-slate-900 px-4 pt-8 pb-5">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="h-3 w-24 rounded-full bg-white/10 animate-pulse" />
          <div className="h-10 w-56 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-3 w-16 rounded-full bg-white/10 animate-pulse" />
        </div>

        {/* Category Cards Skeleton */}
        <div className="max-w-7xl mx-auto mt-5">
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[100px] h-[88px] rounded-2xl bg-white/8 animate-pulse"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-8 flex gap-6">

        {/* Sidebar Skeleton — desktop only */}
        <aside className="hidden lg:flex flex-col gap-4 w-56 flex-shrink-0">
          {/* Section headers + items */}
          {[4, 3, 5].map((count, s) => (
            <div key={s}>
              <div className="h-2.5 w-16 rounded-full bg-slate-200 animate-pulse mb-3" />
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: count }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 rounded-xl bg-slate-100 animate-pulse"
                    style={{ animationDelay: `${(s * 4 + i) * 50}ms` }}
                  />
                ))}
              </div>
              <div className="h-px bg-slate-100 mt-3" />
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">

          {/* Mobile chips skeleton */}
          <div className="lg:hidden flex gap-2 mb-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 h-9 rounded-full bg-slate-200 animate-pulse"
                style={{
                  width: `${[56, 72, 80, 64, 72][i]}px`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
            ))}
          </div>

          {/* Toolbar skeleton */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="lg:hidden h-10 w-24 rounded-xl bg-slate-200 animate-pulse" />
              <div className="h-4 w-16 rounded-full bg-slate-200 animate-pulse" />
            </div>
            <div className="h-9 w-28 rounded-xl bg-slate-200 animate-pulse" />
          </div>

          {/* Product Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} delay={i * 40} />
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}

// ── Product Card Skeleton ─────────────────────────────────────────────────────

function ProductCardSkeleton({ delay }: { delay: number }) {
  return (
    <div
      className="rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image placeholder */}
      <div
        className="aspect-[4/5] bg-slate-100 animate-pulse"
        style={{ animationDelay: `${delay}ms` }}
      />

      {/* Text placeholders */}
      <div className="p-3 space-y-2">
        <div
          className="h-3.5 rounded-full bg-slate-100 animate-pulse w-4/5"
          style={{ animationDelay: `${delay + 30}ms` }}
        />
        <div
          className="h-3 rounded-full bg-slate-100 animate-pulse w-3/5"
          style={{ animationDelay: `${delay + 60}ms` }}
        />
        <div className="flex items-center justify-between pt-1">
          <div
            className="h-4 rounded-full bg-slate-200 animate-pulse w-16"
            style={{ animationDelay: `${delay + 90}ms` }}
          />
          <div
            className="h-7 w-7 rounded-full bg-slate-100 animate-pulse"
            style={{ animationDelay: `${delay + 120}ms` }}
          />
        </div>
      </div>
    </div>
  )
}