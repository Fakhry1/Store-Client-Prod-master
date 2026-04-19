'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { useLocale } from '@/context/locale'

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4efe4] text-slate-900 shadow-sm">
      {children}
    </span>
  )
}

export function TrustBar() {
  const { t } = useLocale()
  const items = [
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
  const isSingleItem = items.length === 1

  return (
    <section className="border-y border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className={isSingleItem ? 'mx-auto max-w-3xl' : ''}>
          <div className={`grid gap-3 ${isSingleItem ? 'grid-cols-1' : 'md:grid-cols-2 xl:grid-cols-4'}`}>
          {items.map((item) => (
            <div
              key={item.title}
              className="flex items-center gap-4 rounded-[28px] border border-stone-200 bg-[#fcfbf8] px-5 py-4 shadow-[0_8px_22px_rgba(15,23,42,0.03)]"
            >
              <IconWrap>{item.icon}</IconWrap>
              <div>
                <p className="text-sm font-black text-slate-900">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.sub}</p>
              </div>
            </div>
          ))}
          </div>
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
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-600">{eyebrow}</p>
        <h2
          className="font-display text-2xl font-black leading-[1.2] text-slate-900 md:text-[32px]"
        >
          {title}
        </h2>
      </div>
      {link && (
        <Link
          href={link.href}
          className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-500 transition-colors hover:text-slate-900"
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
      className="bg-white py-16 md:py-20"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '560px' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[36px] border border-[#2f3138] bg-[#101216] px-6 py-12 text-center shadow-[0_30px_90px_rgba(2,6,23,0.18)] md:px-10 md:py-16">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.22),transparent_55%)]" />
          <div className="absolute -start-12 bottom-6 h-36 w-36 rounded-full bg-white/8 blur-3xl" />
          <div className="absolute -end-12 top-6 h-40 w-40 rounded-full bg-amber-400/12 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
              {t('A sharper store experience is ready', 'تجربة متجر أوضح أصبحت جاهزة')}
            </p>
            <h2
              className="font-display text-xl font-black leading-[1.2] text-white md:text-[2rem] md:leading-[1.15]"
            >
              {t('Browse the full collection in one polished flow', 'تصفح المجموعة الكاملة في رحلة أكثر أناقة')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-300">
              {t(
                'From discovery to checkout, the experience is designed to feel cleaner, faster, and easier to trust.',
                'من الاستكشاف وحتى الدفع، تم تصميم التجربة لتكون أوضح وأسرع وأسهل في الثقة.'
              )}
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-3 rounded-2xl bg-amber-400 px-8 py-4 text-sm font-black text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-[0_16px_38px_rgba(251,191,36,0.35)]"
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
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
            {t('Limited offers', 'عروض محدودة')}
          </span>
        </div>
        <h2
          className="font-display text-xl font-black leading-[1.2] text-white md:text-[28px]"
        >
          {t('Deals worth catching', 'عروض تستحق المتابعة')}
        </h2>
        <p className="mt-2 text-sm text-white/55">
          {t(`${count} picks available right now`, `يوجد ${count} عرضًا متاحًا الآن`)}
        </p>
      </div>
      <Link
        href="/shop"
        className="inline-flex items-center gap-2 text-sm font-bold text-amber-300 transition-colors hover:text-amber-200"
      >
        {t('View All', 'عرض الكل')}
        <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  )
}

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

const CARD_ACCENTS = [
  'from-sky-50 to-white border-sky-100',
  'from-amber-50 to-white border-amber-100',
  'from-emerald-50 to-white border-emerald-100',
  'from-rose-50 to-white border-rose-100',
  'from-violet-50 to-white border-violet-100',
  'from-cyan-50 to-white border-cyan-100',
]

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
      style={{ contentVisibility: 'auto', containIntrinsicSize: '760px' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow={t('Browse by', 'تصفح حسب')}
          title={t('Categories', 'التصنيفات')}
          link={{ href: '/shop', label: t('View All', 'عرض الكل') }}
        />
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => scrollCategories('prev')}
            aria-label={t('Previous categories', 'التصنيفات السابقة')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-white text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition-colors hover:text-slate-900"
          >
            <svg className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollCategories('next')}
            aria-label={t('Next categories', 'التصنيفات التالية')}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-white text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.05)] transition-colors hover:text-slate-900"
          >
            <svg className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div
          ref={scrollRef}
          className="mt-5 flex gap-3 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map((cat: any, index: number) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.id}`}
              className={`group flex min-h-[170px] min-w-[160px] snap-start flex-col items-center justify-center rounded-[28px] border bg-gradient-to-br px-4 py-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)] sm:min-w-[180px] ${CARD_ACCENTS[index % CARD_ACCENTS.length]}`}
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm">
                {getCategoryIcon(cat.nameAr ?? '', cat.nameEn ?? '', index)}
              </span>
              <p className="mt-4 text-[13px] font-black leading-5 text-slate-900 md:text-sm">
                {locale === 'ar' ? cat.nameAr : cat.nameEn}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {t('Explore products', 'استكشف المنتجات')}
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
