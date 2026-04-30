'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useLocale } from '@/context/locale'

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl shadow-sm" style={{ background: 'rgba(255,107,44,0.10)', color: 'var(--orange)' }}>
      {children}
    </span>
  )
}

export function TrustBar() {
  const { t } = useLocale()
  const items = [
    {
      title: t('Easy Returns', 'استرجاع سهل'),
      sub: t('Return or exchange within 14 days', 'استرجع أو استبدل خلال 14 يوم'),
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      title: t('Selected-city coverage', 'تغطية لمدن محددة'),
      sub: t('Confirm your city before delivery checkout', 'تأكد من مدينتك قبل إكمال طلب التوصيل'),
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 11a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="border-y bg-white" style={{ borderColor: 'var(--line)' }}>
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-[28px] border px-5 py-4"
              style={{ borderColor: 'var(--line)', background: 'var(--paper)', boxShadow: '0 8px 22px rgba(10,31,68,0.04)' }}
            >
              <IconWrap>{item.icon}</IconWrap>
              <div>
                <p className="text-sm font-black" style={{ color: 'var(--ink)' }}>{item.title}</p>
                <p className="mt-1 text-xs leading-5" style={{ color: 'var(--mute)' }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SectionHeader({
  eyebrow,
  title,
  link,
}: {
  eyebrow: string
  title: string
  link?: { href: string; label: string }
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--orange)' }}>{eyebrow}</p>
        <h2 className="font-display text-2xl font-black leading-[1.2] md:text-[32px]" style={{ color: 'var(--ink)' }}>
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="inline-flex items-center gap-2 text-[13px] font-bold transition-colors hover:opacity-75"
          style={{ color: 'var(--mute)' }}
        >
          {link.label}
          <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  )
}

export function HomeCTA() {
  const { t } = useLocale()

  return (
    <section
      className="py-16 md:py-20"
      style={{ background: 'var(--paper)', contentVisibility: 'auto', containIntrinsicSize: '560px' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="relative overflow-hidden rounded-[36px] px-6 py-12 text-center md:px-10 md:py-16"
          style={{ background: 'var(--ink)', boxShadow: '0 30px 90px rgba(10,31,68,0.22)' }}
        >
          <div className="absolute inset-x-0 top-0 h-40" style={{ background: 'radial-gradient(circle at top, rgba(255,107,44,0.18), transparent 55%)' }} />
          <div className="absolute -start-12 bottom-6 h-36 w-36 rounded-full blur-3xl" style={{ background: 'rgba(232,201,155,0.10)' }} />
          <div className="absolute -end-12 top-6 h-40 w-40 rounded-full blur-3xl" style={{ background: 'rgba(255,107,44,0.12)' }} />

          <div className="relative mx-auto max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: 'var(--champagne)' }}>
              {t('A sharper store experience is ready', 'تجربة متجر أوضح أصبحت جاهزة')}
            </p>
            <h2 className="font-display text-xl font-black leading-[1.2] text-white md:text-[2rem] md:leading-[1.15]">
              {t('Browse the full collection in one polished flow', 'تصفح المجموعة الكاملة في رحلة أكثر أناقة')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7" style={{ color: 'rgba(255,255,255,0.65)' }}>
              {t(
                'From discovery to checkout, the experience is designed to feel cleaner, faster, and easier to trust.',
                'من الاستكشاف وحتى الدفع، تم تصميم التجربة لتكون أوضح وأسرع وأسهل في الثقة.'
              )}
            </p>

            <div className="my-8 flex items-center justify-center gap-8 md:gap-12">
              {[
                { num: '500+', en: 'Products', ar: 'منتج' },
                { num: '1,000+', en: 'Happy Customers', ar: 'عميل سعيد' },
                { num: '10+', en: 'Categories', ar: 'تصنيف' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-8 md:gap-12">
                  {i > 0 && <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.12)' }} />}
                  <div className="text-center">
                    <p className="text-xl font-black text-white md:text-2xl">{stat.num}</p>
                    <p className="mt-0.5 text-[11px]" style={{ color: 'rgba(255,255,255,0.48)' }}>{t(stat.en, stat.ar)}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-sm font-black text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: 'var(--orange)', boxShadow: '0 16px 38px rgba(255,107,44,0.32)' }}
            >
              {t('Browse Store', 'تصفح المتجر')}
              <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function OffersHeader({ count }: { count: number }) {
  const { t } = useLocale()

  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: 'rgba(255,107,44,0.25)', background: 'rgba(255,107,44,0.12)' }}>
          <span className="h-2 w-2 rounded-full" style={{ background: 'var(--orange)' }} />
          <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--champagne)' }}>
            {t('Limited offers', 'عروض محدودة')}
          </span>
        </div>
        <h2 className="font-display text-xl font-black leading-[1.2] text-white md:text-[28px]">
          {t('Deals worth catching', 'عروض تستحق المتابعة')}
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {t(`${count} picks available right now`, `يوجد ${count} عرضًا متاحًا الآن`)}
        </p>
      </div>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:opacity-75"
        style={{ color: 'var(--champagne)' }}
      >
        {t('View All', 'عرض الكل')}
        <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

const CATEGORY_ACCENT_COLORS = [
  'rgba(255,107,44,0.12)',
  'rgba(10,31,68,0.09)',
  'rgba(15,118,110,0.11)',
  'rgba(124,58,237,0.09)',
  'rgba(220,38,38,0.08)',
  'rgba(29,78,216,0.09)',
  'rgba(202,138,4,0.10)',
  'rgba(6,95,70,0.09)',
]

const CATEGORY_ICON_MAP: Array<{ keywords: string[]; icon: string }> = [
  { keywords: ['عطر', 'عطور', 'perfume', 'perfumes', 'fragrance'], icon: '🌸' },
  { keywords: ['اطفال', 'أطفال', 'طفل', 'kids', 'children', 'child', 'baby'], icon: '👶' },
  { keywords: ['رجال', 'رجالي', 'men', 'man', 'male'], icon: '👔' },
  { keywords: ['نساء', 'نسائي', 'سيدات', 'women', 'woman', 'female', 'ladies'], icon: '👗' },
  { keywords: ['احذية', 'أحذية', 'حذاء', 'shoes', 'shoe', 'footwear'], icon: '👟' },
  { keywords: ['الكترون', 'إلكترون', 'تقنية', 'electronics', 'tech', 'gadget'], icon: '📱' },
  { keywords: ['منزل', 'بيت', 'home', 'house', 'furniture'], icon: '🏠' },
  { keywords: ['رياض', 'رياضة', 'sport', 'sports', 'fitness'], icon: '⚽' },
  { keywords: ['جمال', 'مكياج', 'beauty', 'makeup', 'cosmetics'], icon: '💄' },
  { keywords: ['طعام', 'غذاء', 'food', 'grocery'], icon: '🛒' },
]

const FALLBACK_ICONS = ['🛍️', '✨', '💎', '🎁', '⭐', '🔖']

function getCategoryIcon(nameAr: string, nameEn: string, index: number): string {
  const combined = `${nameAr} ${nameEn}`.toLowerCase()
  const match = CATEGORY_ICON_MAP.find((entry) => entry.keywords.some((kw) => combined.includes(kw)))
  return match ? match.icon : FALLBACK_ICONS[index % FALLBACK_ICONS.length]
}

export function CategoriesSection({ categories }: { categories: any[] }) {
  const { t, locale, isRTL } = useLocale()
  const scrollRef = useRef<HTMLDivElement | null>(null)

  function scrollCategories(direction: 'next' | 'prev') {
    if (!scrollRef.current) return
    const amount = Math.min(scrollRef.current.clientWidth * 0.82, 320)
    const signedAmount = direction === 'next'
      ? (isRTL ? -amount : amount)
      : (isRTL ? amount : -amount)
    scrollRef.current.scrollBy({ left: signedAmount, behavior: 'smooth' })
  }

  return (
    <section
      className="py-16 md:py-20"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '480px' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-center justify-between gap-4">
          <SectionHeader
            eyebrow={t('Browse by', 'تصفح حسب')}
            title={t('Categories', 'التصنيفات')}
            link={{ href: '/shop', label: t('View All', 'عرض الكل') }}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollCategories('prev')}
              aria-label={t('Previous categories', 'التصنيفات السابقة')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-white transition-colors hover:opacity-75"
              style={{ borderColor: 'var(--line)', color: 'var(--mute)', boxShadow: '0 8px 20px rgba(10,31,68,0.05)' }}
            >
              <svg className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollCategories('next')}
              aria-label={t('Next categories', 'التصنيفات التالية')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-white transition-colors hover:opacity-75"
              style={{ borderColor: 'var(--line)', color: 'var(--mute)', boxShadow: '0 8px 20px rgba(10,31,68,0.05)' }}
            >
              <svg className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="mt-6 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {categories.map((cat: any, index: number) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className="group flex min-h-[160px] min-w-[150px] snap-start flex-col items-center justify-center rounded-[28px] border bg-white px-4 py-5 text-center transition-all duration-300 hover:-translate-y-1 sm:min-w-[170px]"
              style={{ borderColor: 'var(--line)', boxShadow: '0 4px 16px rgba(10,31,68,0.05)', scrollSnapAlign: 'start' }}
            >
              <span
                className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                style={{ background: CATEGORY_ACCENT_COLORS[index % CATEGORY_ACCENT_COLORS.length] }}
              >
                {getCategoryIcon(cat.nameAr ?? '', cat.nameEn ?? '', index)}
              </span>
              <p className="mt-4 text-[13px] font-black leading-5 md:text-sm" style={{ color: 'var(--ink)' }}>
                {locale === 'ar' ? cat.nameAr : cat.nameEn}
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--mute)' }}>
                {t('Explore', 'استكشف')}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProductCollectionSection({
  id,
  eyebrowEn,
  eyebrowAr,
  titleEn,
  titleAr,
  linkLabelEn,
  linkLabelAr,
  children,
}: {
  id?: string
  eyebrowEn: string
  eyebrowAr: string
  titleEn: string
  titleAr: string
  linkLabelEn: string
  linkLabelAr: string
  children: React.ReactNode
}) {
  const { t } = useLocale()

  return (
    <section
      id={id}
      className="py-16 md:py-20"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '920px' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow={t(eyebrowEn, eyebrowAr)}
          title={t(titleEn, titleAr)}
          link={{ href: '/shop', label: t(linkLabelEn, linkLabelAr) }}
        />
        <div className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">{children}</div>
      </div>
    </section>
  )
}
