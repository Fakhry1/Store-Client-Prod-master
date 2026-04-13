'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/context/locale'
import { translateApiError } from '@/lib/errors'

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLocale()
  const translatedMessage = error.message ? translateApiError(error.message, t) : ''

  useEffect(() => {
    console.error('[product]', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-2">
        {t('Unable to load product', 'تعذر تحميل المنتج')}
      </h2>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        {t(
          'We could not load this product right now. It may be unavailable at the moment.',
          'لم نتمكن من تحميل تفاصيل هذا المنتج. قد يكون غير متاح حاليًا.'
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
          className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-amber-600 transition-colors"
        >
          {t('Try again', 'إعادة المحاولة')}
        </button>
        <Link
          href="/shop"
          className="px-6 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:border-slate-400 transition-colors"
        >
          {t('Back to shop', 'العودة للمتجر')}
        </Link>
      </div>
    </div>
  )
}
