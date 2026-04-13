'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  currentPage: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export function Pagination({ currentPage, totalPages, hasNext, hasPrev }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = useCallback((page: number) => {
    const qs = new URLSearchParams(searchParams.toString())
    qs.set('page', String(page))
    router.push(`/shop?${qs}`)
  }, [searchParams, router])

  if (totalPages <= 1) return null

  // بناء قائمة الصفحات مع ... للتصغير
  const pages = buildPageList(currentPage, totalPages)

  return (
    <div className="flex items-center justify-center gap-1 mt-8 flex-wrap" dir="ltr">

      {/* Previous */}
      <button onClick={() => goToPage(currentPage - 1)} disabled={!hasPrev}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
          disabled:opacity-30 disabled:cursor-not-allowed
          text-slate-600 hover:bg-slate-100 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        السابق
      </button>

      {/* Pages */}
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 py-2 text-slate-400 text-sm">...</span>
        ) : (
          <button key={page} onClick={() => goToPage(page as number)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors
              ${page === currentPage
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
              }`}>
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button onClick={() => goToPage(currentPage + 1)} disabled={!hasNext}
        className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium
          disabled:opacity-30 disabled:cursor-not-allowed
          text-slate-600 hover:bg-slate-100 transition-colors">
        التالي
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end   = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')
  pages.push(total)

  return pages
}