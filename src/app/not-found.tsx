import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Big 404 */}
      <div className="relative mb-8">
        <span className="font-display text-[120px] font-black leading-none select-none md:text-[180px]"
          style={{ color: 'var(--paper-2)' }}>
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--ink)' }}>
        الصفحة غير موجودة
      </h1>
      <p className="text-sm md:text-base max-w-sm mb-8 leading-relaxed" style={{ color: 'var(--mute)' }}>
        يبدو أن هذه الصفحة لا وجود لها أو تم نقلها.
        <br />
        <span style={{ color: 'var(--mute)', opacity: 0.7 }}>Page not found</span>
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/shop"
          className="px-8 py-3 text-white font-bold rounded-xl transition-colors text-sm"
          style={{ background: 'var(--ink)' }}>
          العودة للمتجر
        </Link>
        <Link href="/"
          className="px-8 py-3 border font-bold rounded-xl transition-colors text-sm"
          style={{ borderColor: 'var(--line)', color: 'var(--mute)' }}>
          الصفحة الرئيسية
        </Link>
      </div>
    </div>
  )
}
