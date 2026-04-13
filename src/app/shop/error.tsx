'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/context/locale'
import { translateApiError } from '@/lib/errors'

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useLocale()
  const translatedMessage = error.message ? translateApiError(error.message, t) : ''

  useEffect(() => {
    console.error('[shop]', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-6">
        <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-black text-slate-900 mb-2">
        {t('Unable to load shop', 'تعذر تحميل المتجر')}
      </h2>
      <p className="text-sm text-slate-500 mb-6 max-w-xs">
        {t(
          'Something went wrong while loading products. Please check your connection and try again.',
          'حدث خطأ أثناء تحميل المنتجات. تحقق من اتصالك ثم حاول مرة أخرى.'
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
          href="/"
          className="px-6 py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:border-slate-400 transition-colors"
        >
          {t('Home', 'الرئيسية')}
        </Link>
      </div>
    </div>
  )
}
