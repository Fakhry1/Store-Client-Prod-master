'use client'

import Link from 'next/link'
import { useLocale } from '@/context/locale'
import type { Branch, Category } from '@/types'

interface Props {
  totalCount: number
  search?: string
  categories: Category[]
  activeBranches: Branch[]
  selectedBranch: number
  selectedCat?: number
  currentSearch?: string
}

const CATEGORY_ICONS: Record<string, string> = {
  Perfumes: '🌸',
  'Kids Clothes': '🧒',
  'Men Clothes': '👔',
  'Female Clothes': '👜',
  Electronics: '📱',
  'Kids Shoes': '👟',
  default: '✦',
}

const CARD_GRADIENTS = [
  'from-rose-50 to-white border-rose-100',
  'from-amber-50 to-white border-amber-100',
  'from-sky-50 to-white border-sky-100',
  'from-emerald-50 to-white border-emerald-100',
  'from-violet-50 to-white border-violet-100',
  'from-orange-50 to-white border-orange-100',
]

function buildCategoryUrl(catId: number | undefined, branch: number): string {
  const qs = new URLSearchParams()
  qs.set('branch', String(branch))
  if (catId) qs.set('category', String(catId))
  return `/shop?${qs}`
}

export function ShopHeader({
  totalCount,
  search,
  categories,
  activeBranches,
  selectedBranch,
  selectedCat,
}: Props) {
  const { t, locale } = useLocale()
  const isAr = locale === 'ar'
  const activeCategory = categories.find((category) => category.id === selectedCat)

  if (search) {
    return (
      <section className="relative overflow-hidden border-b border-stone-200 bg-[#0b1220] px-4 py-7 text-white md:px-6 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(249,115,22,0.14),transparent_34%)]" />
        <div className="relative mx-auto flex max-w-7xl items-center gap-4">
          <Link
            href="/shop"
            prefetch={false}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 transition-colors hover:bg-white/14"
          >
            <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
              {t('Search results', 'نتائج البحث')}
            </p>
            <h1
              className="font-display text-xl font-black md:text-4xl"
            >
              &quot;{search}&quot;
            </h1>
            <p className="mt-2 text-sm text-white/82">
              {totalCount > 0
                ? `${totalCount} ${t('products found', 'منتج مطابق')}`
                : t('No results found', 'لا توجد نتائج')}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.07),transparent_24%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_24%)]" />
      <div className="absolute -start-20 top-16 h-56 w-56 rounded-full bg-sky-400/10 blur-3xl" />
      <div className="absolute end-0 top-10 h-64 w-64 rounded-full bg-orange-300/10 blur-3xl" />

      <div className="relative px-4 py-7 md:px-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-sky-600">
                {t('Curated store browse', 'تصفح منسق للمتجر')}
              </p>
              <h1
                className="font-display text-2xl font-black leading-none md:text-5xl"
              >
                {selectedCat
                  ? (isAr ? activeCategory?.nameAr : activeCategory?.nameEn) ?? t('Collection', 'التشكيلة')
                  : t('Our Collection', 'تشكيلتنا')}
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-600">
                {selectedCat
                  ? t(
                      'Browse cleaner, faster listings inside this category with a mobile-first layout.',
                      'تصفح منتجات هذا التصنيف في عرض أوضح وأسرع وملائم للموبايل.'
                    )
                  : t(
                      'Explore the full catalog with sharper filters, richer cards, and a cleaner browsing flow.',
                      'استكشف كامل المتجر مع فلاتر أوضح وبطاقات أغنى وتجربة تصفح أنظف.'
                    )}
              </p>

              <div className="mt-4 flex flex-wrap gap-2.5">
                <div className="rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 shadow-sm">
                  <p className="text-xl font-black text-slate-900">{totalCount}</p>
                  <p className="text-xs font-medium text-slate-500">{t('Available products', 'منتجات متاحة')}</p>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-white px-3.5 py-2.5 shadow-sm">
                  <p className="text-xl font-black text-slate-900">{Math.max(categories.length, 1)}</p>
                  <p className="text-xs font-medium text-slate-500">{t('Categories', 'تصنيفات')}</p>
                </div>
              </div>
            </div>

            {activeBranches.length > 1 && (
              <div className="max-w-full rounded-[28px] border border-stone-200 bg-white p-3 shadow-sm">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                  {t('Store branch', 'فرع المتجر')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeBranches.map((branch) => (
                    <Link
                      key={branch.id}
                      href={buildCategoryUrl(selectedCat, branch.id)}
                      prefetch={false}
                      className={`rounded-full px-4 py-2 text-xs font-black transition-all ${
                        branch.id === selectedBranch
                          ? 'bg-orange-500 text-white shadow-[0_10px_28px_rgba(249,115,22,0.22)]'
                          : 'bg-stone-50 text-slate-700 hover:bg-orange-50 hover:text-orange-600'
                      }`}
                    >
                      {branch.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {categories.length > 0 && (
        <div className="relative px-4 pb-4 md:px-6 md:pb-7">
          <div className="mx-auto max-w-7xl">
            <div className="scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-1">
              <Link
                href={buildCategoryUrl(undefined, selectedBranch)}
                prefetch={false}
                className={`group relative min-w-[124px] flex-shrink-0 snap-start overflow-hidden rounded-[28px] border px-4 py-4 transition-all duration-300 ${
                  !selectedCat
                    ? 'border-orange-200 bg-orange-500 text-white shadow-[0_14px_36px_rgba(249,115,22,0.22)]'
                    : 'border-stone-200 bg-white text-slate-700 shadow-sm hover:border-orange-200 hover:bg-orange-50'
                }`}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-2xl">✦</span>
                  <p className="text-xs font-black">{t('All', 'الكل')}</p>
                  <p className={`text-[10px] font-bold ${!selectedCat ? 'text-white/90' : 'text-slate-600'}`}>
                    {totalCount}
                  </p>
                </div>
              </Link>

              {categories.map((category, index) => {
                const isActive = category.id === selectedCat
                const icon = CATEGORY_ICONS[category.nameEn] ?? CATEGORY_ICONS.default
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length]

                return (
                  <Link
                    key={category.id}
                    href={buildCategoryUrl(category.id, selectedBranch)}
                    prefetch={false}
                    className={`group relative min-w-[132px] flex-shrink-0 snap-start overflow-hidden rounded-[28px] border bg-gradient-to-br px-4 py-4 transition-all duration-300 ${
                      isActive
                        ? `${gradient} ring-2 ring-sky-300 shadow-[0_16px_40px_rgba(15,23,42,0.12)]`
                        : `${gradient} hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]`
                    }`}
                  >
                    {isActive && <span className="absolute end-3 top-3 h-2 w-2 rounded-full bg-orange-400" />}
                    <div className="flex flex-col items-center gap-2 text-center">
                      <span className="text-2xl transition-transform duration-300 group-hover:scale-110">{icon}</span>
                      <p className="text-xs font-black leading-5 text-slate-900">
                        {isAr ? category.nameAr : category.nameEn}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500">
                        {isActive ? t('Selected', 'محدد') : t('Explore', 'استكشف')}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
