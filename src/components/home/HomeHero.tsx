'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/context/locale'

interface Props {
  featuredCount: number
  categoriesCount: number
  hasOffers: boolean
}

export function HomeHero({ featuredCount, categoriesCount, hasOffers }: Props) {
  const { t, isRTL } = useLocale()

  const highlights = [
    { value: `${Math.max(featuredCount, 12)}+`, label: t('Featured picks', 'منتجات مختارة') },
    { value: `${Math.max(categoriesCount, 6)}+`, label: t('Curated categories', 'تصنيفات منسقة') },
    { value: hasOffers ? t('Live', 'مباشر') : '24/7', label: t('Offers & support', 'العروض والدعم') },
  ]

  const quickTags = [
    { label: t('New arrivals', 'وصل حديثًا'), href: '#new-arrivals' },
    { label: t('Best sellers', 'الأكثر طلبًا'), href: '#best-sellers' },
    { label: t('Premium picks', 'اختيارات فاخرة'), href: '#premium-picks' },
  ]

  const promisePoints = [
    t('Mobile-first browsing', 'تصفح مصمم للموبايل'),
    t('Curated premium edits', 'اختيارات فاخرة منسقة'),
    t('Faster path to checkout', 'طريق أسرع لإتمام الطلب'),
  ]

  return (
    <section className="relative isolate overflow-hidden bg-[#0f1115]">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1800&q=80&auto=format&fit=crop"
          alt="LUXE Store Hero"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.22),transparent_32%),linear-gradient(115deg,rgba(15,17,21,0.96)_22%,rgba(15,17,21,0.82)_56%,rgba(15,17,21,0.42)_100%)]" />
        <div className="absolute -start-24 top-20 h-56 w-56 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute end-0 top-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[88vh] max-w-7xl items-center gap-10 px-6 py-14 md:min-h-[92vh] md:grid-cols-[1.02fr_0.98fr] md:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/75 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.9)]" />
            {t('Curated everyday luxury', 'أناقة يومية مختارة بعناية')}
          </div>

          <h1 className="mt-6 max-w-xl text-xl font-black leading-[1.2] tracking-normal !text-white sm:text-2xl md:text-6xl">
            {t('A sharper storefront for premium everyday picks', 'واجهة أذكى لاكتشاف اختياراتك اليومية الفاخرة')}
          </h1>

          <p className="mt-5 max-w-xl text-[13px] leading-7 !text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] md:text-base">
            {t(
              'Shop a cleaner catalog, discover premium edits faster, and move from browsing to checkout with less friction.',
              'تصفّح كتالوجًا أوضح، واكتشف اختيارات فاخرة أسرع، وانتقل من الاستكشاف إلى الشراء بخطوات أقل.'
            )}
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {quickTags.map((tag) => (
              <a
                key={tag.href}
                href={tag.href}
                className="rounded-full border border-white/12 bg-white/8 px-3.5 py-1.5 text-xs font-bold text-white/80 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/14 hover:text-white"
              >
                {tag.label}
              </a>
            ))}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-white/12 bg-white/8 p-4 backdrop-blur">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">
                {t('Why it feels better', 'لماذا التجربة أفضل')}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {promisePoints.map((item) => (
                  <span key={item} className="rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-bold !text-white">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-amber-300/20 bg-amber-400/10 p-4 backdrop-blur">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-300">
                {t('Coverage notice', 'تنبيه التغطية')}
              </p>
              <p className="mt-2 text-sm leading-6 text-white/80">
                {t(
                  'Delivery is available in selected cities. Confirm your area before finishing checkout.',
                  'التوصيل متاح حاليًا في مدن محددة. تأكد من نطاق خدمتك قبل إنهاء الطلب.'
                )}
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-amber-400 px-6 py-3.5 text-sm font-black text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-300 hover:shadow-[0_12px_36px_rgba(251,191,36,0.35)]"
            >
              {t('Start shopping', 'ابدأ التسوق')}
              <svg
                className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            {hasOffers && (
              <a
                href="#offers"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-white/18 bg-white/8 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition-all duration-300 hover:border-white/30 hover:bg-white/14"
              >
                <span className="text-base">%</span>
                {t('Browse live offers', 'تصفّح العروض الحالية')}
              </a>
            )}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur"
              >
                <p className="text-2xl font-black text-white md:text-3xl">{item.value}</p>
                <p className="mt-1 text-xs font-medium text-white/55">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="mx-auto max-w-md">
            <div className="rounded-[32px] border border-white/12 bg-white/10 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <div className="overflow-hidden rounded-[26px] bg-white/90">
                <div className="relative aspect-[4/4.6]">
                  <Image
                    src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&q=80&auto=format&fit=crop"
                    alt="Fashion collection"
                    fill
                    sizes="(max-width: 1024px) 0vw, 38vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent p-6">
                    <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-900">
                      {t('Editorial selection', 'اختيارات تحريرية')}
                    </span>
                    <h2 className="mt-3 max-w-xs text-2xl font-black leading-tight text-white">
                      {t('Premium pieces with a faster path from interest to order', 'منتجات مميزة مع طريق أسرع من الاكتشاف إلى الطلب')}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 start-6 max-w-[220px] rounded-3xl border border-white/12 bg-[#15181e]/92 p-4 text-white shadow-[0_18px_45px_rgba(0,0,0,0.26)] backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-300/90">
                {t('Fast mobile experience', 'تجربة موبايل سريعة')}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/78">
                {t(
                  'Built for quick browsing, faster product discovery, and smoother checkout steps.',
                  'مصممة لتصفح أسرع، واكتشاف أوضح للمنتجات، وخطوات شراء أكثر سلاسة.'
                )}
              </p>
            </div>

            <div className="absolute -end-6 top-10 max-w-[180px] rounded-3xl border border-amber-300/30 bg-amber-300/12 p-4 text-white shadow-[0_18px_45px_rgba(0,0,0,0.22)] backdrop-blur">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
                {t('Store promise', 'وعد المتجر')}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-white/80">
                {t('Quality, clarity, and trusted delivery at every step.', 'جودة ووضوح وتوصيل موثوق في كل خطوة.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
