'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/context/locale'
import { translateApiError } from '@/lib/errors'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()
  const { t } = useLocale()
  const translatedMessage = error.message ? translateApiError(error.message, t) : ''

  useEffect(() => {
    console.error('[global]', error)
  }, [error])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative mb-8">
        <span
          className="font-display text-[120px] font-black leading-none select-none md:text-[160px]"
          style={{ color: 'var(--paper-2)' }}
        >
          500
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>
      </div>

      <h1 className="text-2xl md:text-3xl font-black mb-2" style={{ color: 'var(--ink)' }}>
        {t('Something went wrong', 'حدث خطأ غير متوقع')}
      </h1>
      <p className="text-sm max-w-sm mb-8 leading-relaxed" style={{ color: 'var(--mute)' }}>
        {t(
          'We are sorry for this issue. Please try again in a moment.',
          'نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى بعد قليل.'
        )}
      </p>

      {process.env.NODE_ENV === 'development' && translatedMessage && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-mono max-w-md text-start">
          {translatedMessage}
          {error.digest && <p className="mt-1 text-red-400">digest: {error.digest}</p>}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="px-8 py-3 text-white font-bold rounded-xl transition-colors text-sm"
          style={{ background: 'var(--ink)' }}
        >
          {t('Try again', 'إعادة المحاولة')}
        </button>
        <button
          onClick={() => router.back()}
          className="px-8 py-3 border font-bold rounded-xl transition-colors text-sm"
          style={{ borderColor: 'var(--line)', color: 'var(--mute)' }}
        >
          {t('Previous page', 'الصفحة السابقة')}
        </button>
        <a
          href="/shop"
          className="px-8 py-3 border font-bold rounded-xl transition-colors text-sm"
          style={{ borderColor: 'var(--line)', color: 'var(--mute)' }}
        >
          {t('Back to shop', 'العودة للمتجر')}
        </a>
      </div>
    </div>
  )
}
