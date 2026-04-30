// src/app/loading.tsx
// skeleton للصفحة الرئيسية — يظهر فورياً قبل اكتمال getHomeData()

export default function HomeLoading() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--paper)' }}>

      {/* ── Hero Skeleton ── */}
      <div className="relative min-h-[90vh] flex items-center" style={{ background: 'var(--black)' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/20" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="max-w-lg space-y-5">
            {/* Eyebrow pill */}
            <div className="h-7 w-72 rounded-full bg-white/10 animate-pulse" />
            {/* Headline */}
            <div className="space-y-2">
              <div className="h-10 w-64 rounded-xl bg-white/10 animate-pulse" />
              <div className="h-10 w-48 rounded-xl animate-pulse" style={{ background: 'rgba(255,107,44,0.2)' }} />
            </div>
            {/* Subtitle */}
            <div className="space-y-2">
              <div className="h-4 w-80 rounded-full bg-white/10 animate-pulse" />
              <div className="h-4 w-64 rounded-full bg-white/10 animate-pulse" />
            </div>
            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <div className="h-12 w-36 rounded-xl animate-pulse" style={{ background: 'rgba(255,107,44,0.3)' }} />
              <div className="h-12 w-36 rounded-xl bg-white/10 animate-pulse" />
            </div>
            {/* Stats */}
            <div className="flex gap-6 pt-8 border-t border-white/10">
              {[0, 1, 2].map(i => (
                <div key={i} className="space-y-1">
                  <div className="h-6 w-12 rounded-lg bg-white/10 animate-pulse" />
                  <div className="h-3 w-16 rounded-full bg-white/10 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust Bar Skeleton ── */}
      <div className="bg-white border-y" style={{ borderColor: 'var(--line)' }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden" style={{ background: 'var(--line)' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="bg-white px-6 py-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg animate-pulse flex-shrink-0" style={{ background: 'var(--paper)' }} />
                <div className="space-y-1.5">
                  <div className="h-3.5 w-24 rounded-full animate-pulse" style={{ background: 'var(--paper)' }} />
                  <div className="h-3 w-16 rounded-full animate-pulse" style={{ background: 'var(--paper)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories Skeleton ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section header */}
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded-full animate-pulse" style={{ background: 'rgba(255,107,44,0.2)' }} />
              <div className="h-9 w-40 rounded-xl animate-pulse" style={{ background: 'var(--paper-2)' }} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border animate-pulse"
                style={{ background: 'var(--paper)', borderColor: 'var(--line)', animationDelay: `${i * 60}ms` }}>
                <div className="w-8 h-8 rounded-lg" style={{ background: 'var(--paper-2)' }} />
                <div className="h-3 w-16 rounded-full" style={{ background: 'var(--paper-2)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Offers Skeleton — dark section ── */}
      <section className="py-16 md:py-20 bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded-full animate-pulse" style={{ background: 'rgba(255,107,44,0.3)' }} />
              <div className="h-9 w-52 rounded-xl bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="aspect-square bg-white/5" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-4/5 rounded-full bg-white/10" />
                  <div className="h-3.5 w-3/5 rounded-full" style={{ background: 'rgba(255,107,44,0.2)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Skeleton ── */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-8">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded-full animate-pulse" style={{ background: 'rgba(255,107,44,0.2)' }} />
              <div className="h-9 w-44 rounded-xl animate-pulse" style={{ background: 'var(--paper-2)' }} />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border overflow-hidden animate-pulse"
                style={{ borderColor: 'var(--line)', animationDelay: `${i * 40}ms` }}>
                <div className="aspect-square" style={{ background: 'var(--paper)' }} />
                <div className="p-3 space-y-2">
                  <div className="h-3.5 w-4/5 rounded-full" style={{ background: 'var(--paper)' }} />
                  <div className="h-3 w-3/5 rounded-full" style={{ background: 'var(--paper)' }} />
                  <div className="flex items-center justify-between pt-1">
                    <div className="h-4 w-16 rounded-full" style={{ background: 'var(--paper-2)' }} />
                    <div className="w-7 h-7 rounded-xl" style={{ background: 'var(--paper)' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </main>
  )
}
