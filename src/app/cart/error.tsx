'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/context/locale'
import { translateApiError } from '@/lib/errors'

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLocale()
  const translatedMessage = error.message ? translateApiError(error.message, t) : ''

  useEffect(() => {
    console.error('[cart]', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-black mb-2" style={{ color: 'var(--ink)' }}>
        {t('Cart error', 'خطأ في السلة')}
      </h2>
      <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--mute)' }}>
        {t(
          'Something went wrong while loading your cart. Your data is safe and you can try again.',
          'حدث خطأ أثناء تحميل سلة التسوق. بياناتك محفوظة ويمكنك المحاولة مجددًا.'
        )}
      </p>
      {process.env.NODE_ENV === 'development' && translatedMessage && (
        <p className="text-xs font-mono text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-5 max-w-sm">
          {translatedMessage}
        </p>
      )}
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-2.5 text-white text-sm font-bold rounded-xl transition-colors"
          style={{ background: 'var(--ink)' }}
        >
          {t('Try again', 'إعادة المحاولة')}
        </button>
        <Link
          href="/shop"
          className="px-6 py-2.5 border text-sm font-bold rounded-xl transition-colors"
          style={{ borderColor: 'var(--line)', color: 'var(--mute)' }}
        >
          {t('Browse shop', 'تصفح المتجر')}
        </Link>
      </div>
    </div>
  )
}
