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
      <section className="relative overflow-hidden border-b border-stone-200 bg-[#121418] px-4 py-10 text-white md:px-6 md:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_34%)]" />
        <div className="relative mx-auto flex max-w-7xl items-center gap-4">
          <Link
            href="/shop"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 transition-colors hover:bg-white/14"
          >
            <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              {t('Search results', 'نتائج البحث')}
            </p>
            <h1
              className="text-2xl font-black md:text-4xl"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              &quot;{search}&quot;
            </h1>
            <p className="mt-2 text-sm text-white/58">
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
    <section className="relative overflow-hidden border-b border-stone-200 bg-[#111317] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_28%)]" />
      <div className="absolute -start-20 top-16 h-56 w-56 rounded-full bg-white/6 blur-3xl" />
      <div className="absolute end-0 top-10 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative px-4 py-10 md:px-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
                {t('Curated store browse', 'تصفح منسق للمتجر')}
              </p>
              <h1
                className="text-3xl font-black leading-none md:text-5xl"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {selectedCat
                  ? (isAr ? activeCategory?.nameAr : activeCategory?.nameEn) ?? t('Collection', 'التشكيلة')
                  : t('Our Collection', 'تشكيلتنا')}
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-7 text-white/58">
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

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur">
                  <p className="text-2xl font-black text-white">{totalCount}</p>
                  <p className="text-xs font-medium text-white/55">{t('Available products', 'منتجات متاحة')}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 backdrop-blur">
                  <p className="text-2xl font-black text-white">{Math.max(categories.length, 1)}</p>
                  <p className="text-xs font-medium text-white/55">{t('Categories', 'تصنيفات')}</p>
                </div>
              </div>
            </div>

            {activeBranches.length > 1 && (
              <div className="max-w-full rounded-[28px] border border-white/10 bg-white/8 p-3 backdrop-blur">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/45">
                  {t('Store branch', 'فرع المتجر')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeBranches.map((branch) => (
                    <Link
                      key={branch.id}
                      href={buildCategoryUrl(selectedCat, branch.id)}
                      className={`rounded-full px-4 py-2 text-xs font-black transition-all ${
                        branch.id === selectedBranch
                          ? 'bg-amber-400 text-slate-950 shadow-[0_8px_24px_rgba(251,191,36,0.28)]'
                          : 'bg-white/10 text-white/75 hover:bg-white/16'
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
        <div className="relative px-4 pb-6 md:px-6 md:pb-7">
          <div className="mx-auto max-w-7xl">
            <div className="scrollbar-hide flex snap-x gap-3 overflow-x-auto pb-1">
              <Link
                href={buildCategoryUrl(undefined, selectedBranch)}
                className={`group relative min-w-[124px] flex-shrink-0 snap-start overflow-hidden rounded-[28px] border px-4 py-4 transition-all duration-300 ${
                  !selectedCat
                    ? 'border-amber-300 bg-amber-400 text-slate-950 shadow-[0_14px_36px_rgba(251,191,36,0.26)]'
                    : 'border-white/10 bg-white/8 text-white hover:bg-white/12'
                }`}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-2xl">✦</span>
                  <p className="text-xs font-black">{t('All', 'الكل')}</p>
                  <p className={`text-[10px] font-bold ${!selectedCat ? 'text-slate-800/70' : 'text-white/45'}`}>
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
                    className={`group relative min-w-[132px] flex-shrink-0 snap-start overflow-hidden rounded-[28px] border bg-gradient-to-br px-4 py-4 transition-all duration-300 ${
                      isActive
                        ? `${gradient} ring-2 ring-amber-300 shadow-[0_16px_40px_rgba(15,23,42,0.12)]`
                        : `${gradient} hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]`
                    }`}
                  >
                    {isActive && <span className="absolute end-3 top-3 h-2 w-2 rounded-full bg-amber-500" />}
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
