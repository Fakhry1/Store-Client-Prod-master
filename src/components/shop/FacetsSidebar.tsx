'use client'

import { memo, startTransition, useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from '@/context/locale'
import { getCurrencyLabel } from '@/lib/store'
import type { Facets, ProductQuery } from '@/types'

interface Props {
  facets: Facets
  currentQuery: ProductQuery
}

export function FacetsSidebar({ facets, currentQuery }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t, locale } = useLocale()
  const currency = getCurrencyLabel(locale)

  const navigate = useCallback(
    (url: string) => {
      startTransition(() => {
        router.replace(url, { scroll: false })
      })
    },
    [router]
  )

  const buildUrl = useCallback(
    (updates: Partial<ProductQuery> & { attrs?: Record<number, string> }) => {
      const qs = new URLSearchParams(searchParams.toString())
      qs.set('page', '1')

      if ('categoryId' in updates) {
        updates.categoryId ? qs.set('categoryId', String(updates.categoryId)) : qs.delete('categoryId')
      }
      if ('brandId' in updates) {
        updates.brandId ? qs.set('brandId', String(updates.brandId)) : qs.delete('brandId')
      }
      if ('minPrice' in updates) {
        updates.minPrice != null ? qs.set('minPrice', String(updates.minPrice)) : qs.delete('minPrice')
      }
      if ('maxPrice' in updates) {
        updates.maxPrice != null ? qs.set('maxPrice', String(updates.maxPrice)) : qs.delete('maxPrice')
      }
      if ('attrs' in updates && updates.attrs) {
        Array.from(qs.keys())
          .filter((key) => key.startsWith('attrs['))
          .forEach((key) => qs.delete(key))

        Object.entries(updates.attrs).forEach(([id, value]) => {
          if (value) qs.set(`attrs[${id}]`, value)
        })
      }

      return `/shop?${qs}`
    },
    [searchParams]
  )

  const toggleAttrOption = useCallback(
    (attributeId: number, optionId: number) => {
      const currentAttrs = parseAttrs(searchParams)
      const current = currentAttrs[attributeId] ?? ''
      const ids = current ? current.split(',').map(Number) : []
      const next = ids.includes(optionId) ? ids.filter((id) => id !== optionId) : [...ids, optionId]
      const newAttrs = { ...currentAttrs }

      if (next.length > 0) newAttrs[attributeId] = next.join(',')
      else delete newAttrs[attributeId]

      navigate(buildUrl({ attrs: newAttrs }))
    },
    [searchParams, navigate, buildUrl]
  )

  const toggleBrand = useCallback(
    (brandId: number) => {
      const current = currentQuery.brandId
      navigate(buildUrl({ brandId: current === brandId ? undefined : brandId }))
    },
    [currentQuery.brandId, navigate, buildUrl]
  )

  const clearAll = useCallback(() => {
    const qs = new URLSearchParams()
    if (searchParams.get('branch')) qs.set('branch', searchParams.get('branch')!)
    if (searchParams.get('branchId')) qs.set('branchId', searchParams.get('branchId')!)
    if (searchParams.get('search')) qs.set('search', searchParams.get('search')!)
    navigate(`/shop?${qs}`)
  }, [searchParams, navigate])

  const currentAttrs = useMemo(() => parseAttrs(searchParams), [searchParams])
  const hasFilters =
    Boolean(currentQuery.brandId) ||
    Boolean(currentQuery.minPrice) ||
    Boolean(currentQuery.maxPrice) ||
    Object.keys(currentAttrs).length > 0

  const filterCount = [
    currentQuery.brandId ? 1 : 0,
    currentQuery.minPrice || currentQuery.maxPrice ? 1 : 0,
    Object.keys(currentAttrs).length,
  ].reduce((sum, value) => sum + value, 0)

  return (
    <aside className="flex w-full flex-col gap-4 rounded-[30px] border border-stone-200 bg-white p-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f4efe4] text-slate-900">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">{t('Refine browse', 'تحسين التصفح')}</p>
              <p className="text-sm font-black text-slate-900">{t('Filters', 'الفلاتر')}</p>
            </div>
          </div>
        </div>

        {filterCount > 0 && (
          <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-black text-white">{filterCount}</span>
        )}
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition-colors hover:bg-red-100"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {t('Clear all filters', 'مسح كل الفلاتر')}
        </button>
      )}

      {(facets.priceRange.min > 0 || facets.priceRange.max > 0) && (
        <FacetSection title={t('Price', 'السعر')} eyebrow={t('Range', 'النطاق')}>
          <PriceRangeFilter
            min={facets.priceRange.min}
            max={facets.priceRange.max}
            currentMin={currentQuery.minPrice}
            currentMax={currentQuery.maxPrice}
            currency={currency}
            onApply={(min, max) => navigate(buildUrl({ minPrice: min, maxPrice: max }))}
          />
        </FacetSection>
      )}

      {facets.brands.length > 0 && (
        <FacetSection title={t('Brand', 'الماركة')} eyebrow={t('Popular', 'الأشهر')}>
          <div className="flex flex-col gap-1.5">
            {facets.brands.map((brand) => {
              const active = currentQuery.brandId === brand.id
              const brandName = locale === 'ar' ? brand.nameAr || brand.nameEn : brand.nameEn || brand.nameAr
              return (
                <FilterButton
                  key={brand.id}
                  label={brandName}
                  count={brand.count}
                  active={active}
                  onClick={() => toggleBrand(brand.id)}
                />
              )
            })}
          </div>
        </FacetSection>
      )}

      {facets.attributes.map((attribute, attributeIndex) => {
        const selectedIds = currentAttrs[attribute.attributeId] ? currentAttrs[attribute.attributeId].split(',').map(Number) : []
        const isColorAttribute = attribute.options.some((option) => option.colorHex)
        const title = locale === 'ar' ? attribute.nameAr || attribute.nameEn : attribute.nameEn || attribute.nameAr
        const attributeKey = `${attribute.attributeId}-${attribute.nameEn || attribute.nameAr || 'attribute'}-${attributeIndex}`

        return (
          <FacetSection key={attributeKey} title={title} eyebrow={t('Options', 'خيارات')}>
            {isColorAttribute ? (
              <div className="flex flex-wrap gap-2 px-1 pt-1">
                {attribute.options.map((option, optionIndex) => {
                  const active = selectedIds.includes(option.optionId)
                  const colorLabel = locale === 'ar' ? option.valueAr || option.valueEn : option.valueEn || option.valueAr
                  const optionKey = `${attribute.attributeId}-${option.optionId}-${option.valueEn || option.valueAr || 'option'}-${optionIndex}`
                  return (
                    <button
                      key={optionKey}
                      onClick={() => toggleAttrOption(attribute.attributeId, option.optionId)}
                      title={colorLabel}
                      className={`relative h-9 w-9 rounded-full border-2 transition-all ${
                        active ? 'scale-110 border-slate-900 shadow-md' : 'border-stone-200 hover:border-stone-400'
                      }`}
                      style={{ backgroundColor: option.colorHex ?? '#ccc' }}
                    >
                      {active && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="h-3 w-3 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {attribute.options.map((option, optionIndex) => {
                  const active = selectedIds.includes(option.optionId)
                  const optionLabel = locale === 'ar' ? option.valueAr || option.valueEn : option.valueEn || option.valueAr
                  const optionKey = `${attribute.attributeId}-${option.optionId}-${option.valueEn || option.valueAr || 'option'}-${optionIndex}`
                  return (
                    <FilterButton
                      key={optionKey}
                      label={optionLabel}
                      count={option.count}
                      active={active}
                      onClick={() => toggleAttrOption(attribute.attributeId, option.optionId)}
                      checkbox
                    />
                  )
                })}
              </div>
            )}
          </FacetSection>
        )
      })}
    </aside>
  )
}

const FilterButton = memo(function FilterButton({
  label,
  count,
  active,
  onClick,
  checkbox = false,
}: {
  label: string
  count?: number
  active: boolean
  onClick: () => void
  checkbox?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm text-right transition-all duration-150 group ${
        active
          ? 'bg-slate-900 text-white shadow-[0_10px_22px_rgba(15,23,42,0.12)]'
          : 'bg-[#faf7f1] text-slate-700 hover:bg-stone-100'
      }`}
    >
      {checkbox ? (
        <div
          className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border transition-all ${
            active ? 'border-amber-300 bg-amber-300' : 'border-stone-300 bg-white'
          }`}
        >
          {active && (
            <svg className="h-2.5 w-2.5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      ) : (
        <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${active ? 'bg-amber-300' : 'bg-stone-300'}`} />
      )}

      <span className="flex-1 truncate text-right font-semibold">{label}</span>

      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
            active ? 'bg-white/18 text-white' : 'bg-white text-slate-400'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  )
})

const FacetSection = memo(function FacetSection({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <section className="rounded-[26px] border border-stone-200 bg-[#fcfbf8] p-3">
      <button onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 px-1 py-1.5">
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600">{eyebrow}</p>
          <p className="mt-1 text-sm font-black text-slate-900">{title}</p>
        </div>
        <svg
          className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${open ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>
      {open && <div className="pt-3">{children}</div>}
    </section>
  )
})

function PriceRangeFilter({
  min,
  max,
  currentMin,
  currentMax,
  currency,
  onApply,
}: {
  min: number
  max: number
  currentMin?: number
  currentMax?: number
  currency: string
  onApply: (min?: number, max?: number) => void
}) {
  const { t } = useLocale()
  const [minVal, setMinVal] = useState<string>(currentMin?.toString() ?? '')
  const [maxVal, setMaxVal] = useState<string>(currentMax?.toString() ?? '')

  useEffect(() => {
    setMinVal(currentMin?.toString() ?? '')
    setMaxVal(currentMax?.toString() ?? '')
  }, [currentMin, currentMax])

  function handleApply() {
    const minNum = minVal ? Number(minVal) : undefined
    const maxNum = maxVal ? Number(maxVal) : undefined
    onApply(minNum, maxNum)
  }

  const isActive = Boolean(currentMin || currentMax)

  return (
    <div className="flex flex-col gap-3 px-1">
      {isActive && (
        <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs">
          <span className="font-bold text-amber-700">
            {currentMin ?? min} - {currentMax ?? max}
          </span>
          <span className="font-black text-amber-600">{currency}</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder={`${min}`}
          value={minVal}
          onChange={(event) => setMinVal(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleApply()}
          className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-center text-sm font-bold outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
        />
        <span className="text-stone-300">-</span>
        <input
          type="number"
          placeholder={`${max}`}
          value={maxVal}
          onChange={(event) => setMaxVal(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleApply()}
          className="w-full rounded-2xl border border-stone-200 bg-white px-3 py-2.5 text-center text-sm font-bold outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-100"
        />
      </div>

      <button
        onClick={handleApply}
        className="rounded-2xl bg-slate-900 px-4 py-3 text-xs font-black text-white transition-all hover:bg-amber-500 active:scale-[0.98]"
      >
        {t('Apply', 'تطبيق')}
      </button>
    </div>
  )
}

function parseAttrs(searchParams: ReturnType<typeof useSearchParams>): Record<number, string> {
  const attrs: Record<number, string> = {}
  searchParams.forEach((value, key) => {
    const match = key.match(/^attrs\[(\d+)\]$/)
    if (match) attrs[Number(match[1])] = value
  })
  return attrs
}
