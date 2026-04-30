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
      <section className="relative overflow-hidden border-b px-4 py-7 text-white md:px-6 md:py-12" style={{ background: 'var(--ink)', borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at top left, rgba(255,107,44,0.14), transparent 30%), radial-gradient(circle at top right, rgba(232,201,155,0.10), transparent 28%)' }} />
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
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--champagne)' }}>
              {t('Search results', 'نتائج البحث')}
            </p>
            <h1 className="font-display text-xl font-black md:text-4xl">
              &quot;{search}&quot;
            </h1>
            <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
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
    <section className="relative overflow-hidden border-b" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
      <div className="absolute -start-20 top-16 h-56 w-56 rounded-full blur-3xl" style={{ background: 'rgba(232,201,155,0.15)' }} />
      <div className="absolute end-0 top-10 h-64 w-64 rounded-full blur-3xl" style={{ background: 'rgba(255,107,44,0.08)' }} />

      <div className="relative px-4 py-7 md:px-6 md:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--orange)' }}>
                {t('Curated store browse', 'تصفح منسق للمتجر')}
              </p>
              <h1 className="font-display text-2xl font-black leading-none md:text-5xl" style={{ color: 'var(--ink)' }}>
                {selectedCat
                  ? (isAr ? activeCategory?.nameAr : activeCategory?.nameEn) ?? t('Collection', 'التشكيلة')
                  : t('Our Collection', 'تشكيلتنا')}
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-6" style={{ color: 'var(--mute)' }}>
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
                <div className="rounded-2xl border bg-white px-3.5 py-2.5 shadow-sm" style={{ borderColor: 'var(--line)' }}>
                  <p className="text-xl font-black" style={{ color: 'var(--ink)' }}>{totalCount}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--mute)' }}>{t('Available products', 'منتجات متاحة')}</p>
                </div>
                <div className="rounded-2xl border bg-white px-3.5 py-2.5 shadow-sm" style={{ borderColor: 'var(--line)' }}>
                  <p className="text-xl font-black" style={{ color: 'var(--ink)' }}>{Math.max(categories.length, 1)}</p>
                  <p className="text-xs font-medium" style={{ color: 'var(--mute)' }}>{t('Categories', 'تصنيفات')}</p>
                </div>
              </div>
            </div>

            {activeBranches.length > 1 && (
              <div className="max-w-full rounded-[28px] border bg-white p-3 shadow-sm" style={{ borderColor: 'var(--line)' }}>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--mute)' }}>
                  {t('Store branch', 'فرع المتجر')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeBranches.map((branch) => (
                    <Link
                      key={branch.id}
                      href={buildCategoryUrl(selectedCat, branch.id)}
                      prefetch={false}
                      className="rounded-full px-4 py-2 text-xs font-black transition-all"
                      style={branch.id === selectedBranch
                        ? { background: 'var(--orange)', color: '#fff', boxShadow: '0 10px 28px rgba(255,107,44,0.22)' }
                        : { background: 'var(--paper)', color: 'var(--mute)' }}
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
                className="group relative min-w-[124px] flex-shrink-0 snap-start overflow-hidden rounded-[28px] border px-4 py-4 transition-all duration-300"
                style={!selectedCat
                  ? { borderColor: 'rgba(255,107,44,0.30)', background: 'var(--orange)', color: '#fff', boxShadow: '0 14px 36px rgba(255,107,44,0.22)' }
                  : { borderColor: 'var(--line)', background: '#fff', color: 'var(--ink)' }}
              >
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-2xl">✦</span>
                  <p className="text-xs font-black">{t('All', 'الكل')}</p>
                  <p className="text-[10px] font-bold" style={{ color: !selectedCat ? 'rgba(255,255,255,0.85)' : 'var(--mute)' }}>
                    {totalCount}
                  </p>
                </div>
              </Link>

              {categories.map((category) => {
                const isActive = category.id === selectedCat
                const icon = CATEGORY_ICONS[category.nameEn] ?? CATEGORY_ICONS.default

                return (
                  <Link
                    key={category.id}
                    href={buildCategoryUrl(category.id, selectedBranch)}
                    prefetch={false}
                    className="group relative min-w-[132px] flex-shrink-0 snap-start overflow-hidden rounded-[28px] border bg-white px-4 py-4 transition-all duration-300 hover:-translate-y-1"
                    style={isActive
                      ? { borderColor: 'var(--orange)', boxShadow: '0 16px 40px rgba(255,107,44,0.14)', outline: '2px solid rgba(255,107,44,0.25)', outlineOffset: '1px' }
                      : { borderColor: 'var(--line)', boxShadow: '0 4px 12px rgba(10,31,68,0.04)' }}
                  >
                    {isActive && <span className="absolute end-3 top-3 h-2 w-2 rounded-full" style={{ background: 'var(--orange)' }} />}
                    <div className="flex flex-col items-center gap-2 text-center">
                      <span className="text-2xl transition-transform duration-300 group-hover:scale-110">{icon}</span>
                      <p className="text-xs font-black leading-5" style={{ color: 'var(--ink)' }}>
                        {isAr ? category.nameAr : category.nameEn}
                      </p>
                      <p className="text-[10px] font-bold" style={{ color: isActive ? 'var(--orange)' : 'var(--mute)' }}>
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
