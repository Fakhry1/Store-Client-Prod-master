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

      <button onClick={() => goToPage(currentPage - 1)} disabled={!hasPrev}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ color: 'var(--mute)' }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        السابق
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 py-2 text-sm" style={{ color: 'var(--mute)' }}>...</span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page as number)}
            className="w-9 h-9 rounded-xl text-sm font-black transition-colors"
            style={page === currentPage
              ? { background: 'var(--ink)', color: '#fff' }
              : { color: 'var(--mute)' }}
          >
            {page}
          </button>
        )
      )}

      <button onClick={() => goToPage(currentPage + 1)} disabled={!hasNext}
        className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ color: 'var(--mute)' }}>
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