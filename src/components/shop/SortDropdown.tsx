'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from '@/context/locale'

const SORT_OPTIONS = [
  { value: 'newest',       labelAr: 'الأحدث',        labelEn: 'Newest' },
  { value: 'price_asc',    labelAr: 'السعر: الأقل',  labelEn: 'Price: Low' },
  { value: 'price_desc',   labelAr: 'السعر: الأعلى', labelEn: 'Price: High' },
  { value: 'name_ar_asc',  labelAr: 'الاسم: أ-ي',    labelEn: 'Name: A-Z' },
]

interface Props {
  currentSort?: string
}

export function SortDropdown({ currentSort = 'newest' }: Props) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { locale } = useLocale()

  const handleChange = (sort: string) => {
    const qs = new URLSearchParams(searchParams.toString())
    qs.set('sort', sort)
    qs.set('page', '1')
    router.push(`/shop?${qs}`)
  }

  return (
    <div className="relative">
      <select
        value={currentSort}
        onChange={e => handleChange(e.target.value)}
        className="appearance-none ps-8 pe-3 py-2 text-sm border border-slate-200
          rounded-xl bg-white text-slate-700 font-medium
          focus:outline-none focus:border-amber-400 cursor-pointer
          w-[min(52vw,190px)] sm:w-[170px]">
        {SORT_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {locale === 'ar' ? opt.labelAr : opt.labelEn}
          </option>
        ))}
      </select>
      {/* Sort icon — RTL-aware positioning */}
      <svg className="absolute start-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
    </div>
  )
}
