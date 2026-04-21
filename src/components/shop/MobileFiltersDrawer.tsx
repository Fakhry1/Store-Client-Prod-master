'use client'

import { startTransition, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createPortal } from 'react-dom'
import { useLocale } from '@/context/locale'
import type { Category } from '@/types'

interface Props {
  categories: Category[]
  activeBranches: { id: number; name: string; isActive: boolean }[]
  selectedBranch: number
  selectedCat?: number
}

export function MobileFiltersDrawer({
  categories,
  activeBranches,
  selectedBranch,
  selectedCat,
}: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const drawerRef = useRef<HTMLDivElement>(null)
  const { t, locale } = useLocale()

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const buildUrl = useCallback(
    (updates: Record<string, string | undefined>) => {
      const qs = new URLSearchParams(searchParams.toString())
      qs.set('page', '1')
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined) qs.delete(key)
        else qs.set(key, value)
      })
      return `/shop?${qs}`
    },
    [searchParams]
  )

  const navigate = useCallback(
    (url: string) => {
      startTransition(() => {
        router.replace(url, { scroll: false })
      })
    },
    [router]
  )

  function clearAll() {
    const qs = new URLSearchParams()
    const search = searchParams.get('search')
    if (search) qs.set('search', search)
    navigate(`/shop?${qs}`)
    setOpen(false)
  }

  const hasCategoryFilter = Boolean(selectedCat)
  const hasBrandFilter = Boolean(searchParams.get('brandId'))
  const hasMinPrice = Boolean(searchParams.get('minPrice'))
  const hasMaxPrice = Boolean(searchParams.get('maxPrice'))
  const attrCount = Array.from(searchParams.keys()).filter((key) => key.startsWith('attrs[')).length
  const hasFilters = hasCategoryFilter || hasBrandFilter || hasMinPrice || hasMaxPrice || attrCount > 0
  const activeCount = [hasCategoryFilter, hasBrandFilter, hasMinPrice || hasMaxPrice]
    .filter(Boolean)
    .length + attrCount

  const drawer = open
    ? createPortal(
        <>
          <div className="fixed inset-0 z-[140] bg-slate-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div
            ref={drawerRef}
            className="fixed inset-y-0 end-0 z-[141] w-[88vw] max-w-sm bg-[#fcfbf8] shadow-2xl"
          >
            <div className="flex h-full flex-col">
              <div className="border-b border-stone-200 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">
                      {t('Refine results', '\u062a\u062d\u0633\u064a\u0646 \u0627\u0644\u0646\u062a\u0627\u0626\u062c')}
                    </p>
                    <h2 className="mt-1 text-lg font-black text-slate-900">
                      {t('Filters', '\u0627\u0644\u0641\u0644\u0627\u062a\u0631')}
                    </h2>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-white text-slate-500 transition-colors hover:text-slate-900"
                    aria-label={t('Close filters', '\u0625\u063a\u0644\u0627\u0642 \u0627\u0644\u0641\u0644\u0627\u062a\u0631')}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {activeCount > 0 && (
                  <div className="mt-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                    {activeCount} {t('active filters', '\u0641\u0644\u0627\u062a\u0631 \u0646\u0634\u0637\u0629')}
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {activeBranches.length > 1 && (
                  <FilterSection title={t('Branch', '\u0627\u0644\u0641\u0631\u0639')}>
                    <div className="grid grid-cols-2 gap-2">
                      {activeBranches.map((branch) => {
                        const active = branch.id === selectedBranch
                        return (
                          <button
                            key={branch.id}
                            onClick={() => {
                              navigate(buildUrl({ branch: String(branch.id) }))
                              setOpen(false)
                            }}
                            className={`rounded-2xl border px-3 py-3 text-sm font-black transition-all ${
                              active
                                ? 'border-slate-900 bg-slate-900 text-white'
                                : 'border-stone-200 bg-white text-slate-700'
                            }`}
                          >
                            {branch.name}
                          </button>
                        )
                      })}
                    </div>
                  </FilterSection>
                )}

                {categories.length > 0 && (
                  <FilterSection title={t('Category', '\u0627\u0644\u062a\u0635\u0646\u064a\u0641')}>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          navigate(buildUrl({ category: undefined }))
                          setOpen(false)
                        }}
                        className={`w-full rounded-2xl border px-4 py-3 text-start text-sm font-black transition-all ${
                          !selectedCat
                            ? 'border-amber-300 bg-amber-400 text-slate-950'
                            : 'border-stone-200 bg-white text-slate-700'
                        }`}
                      >
                        {t('All', '\u0627\u0644\u0643\u0644')}
                      </button>
                      {categories.map((category) => {
                        const active = category.id === selectedCat
                        return (
                          <button
                            key={category.id}
                            onClick={() => {
                              navigate(buildUrl({ category: String(category.id) }))
                              setOpen(false)
                            }}
                            className={`w-full rounded-2xl border px-4 py-3 text-start text-sm font-black transition-all ${
                              active
                                ? 'border-amber-300 bg-amber-400 text-slate-950'
                                : 'border-stone-200 bg-white text-slate-700'
                            }`}
                            style={{ paddingInlineStart: `${16 + ((category.level ?? 0) * 18)}px` }}
                          >
                            {locale === 'ar' ? category.nameAr || category.nameEn : category.nameEn || category.nameAr}
                          </button>
                        )
                      })}
                    </div>
                  </FilterSection>
                )}
              </div>

              <div className="border-t border-stone-200 px-5 py-4">
                <div className="flex gap-3">
                  {hasFilters && (
                    <button
                      onClick={clearAll}
                      className="flex-1 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-colors hover:border-red-200 hover:text-red-600"
                    >
                      {t('Clear all', '\u0645\u0633\u062d \u0627\u0644\u0643\u0644')}
                    </button>
                  )}
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-amber-500"
                  >
                    {t('Show results', '\u0639\u0631\u0636 \u0627\u0644\u0646\u062a\u0627\u0626\u062c')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )
    : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition-all hover:border-stone-300 lg:hidden"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        {t('Filters', '\u0627\u0644\u0641\u0644\u0627\u062a\u0631')}
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-black text-white">
            {activeCount}
          </span>
        )}
      </button>

      {drawer}
    </>
  )
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-slate-400">{title}</h3>
      {children}
    </section>
  )
}
