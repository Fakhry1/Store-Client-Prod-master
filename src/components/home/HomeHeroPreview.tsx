"use client"

import Image from 'next/image'
import Link from 'next/link'
import type { HomeHeroSlide } from '@/components/home/PremiumHeroSlider'
import { getCurrencyLabel } from '@/lib/store'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'

const API_BASE_URL = getPublicApiBaseUrl()

function getImg(path?: string | null) {
  return joinUrl(API_BASE_URL, path) ?? '/placeholder.jpg'
}

export function HomeHeroPreview({
  slide,
}: {
  slide?: HomeHeroSlide
}) {
  const displaySlide = slide ?? {
    id: 'home-hero-preview',
    href: '/shop',
    titleEn: 'Browse the latest curated picks',
    titleAr: 'تصفح أحدث الاختيارات المنسقة',
    currentPrice: 0,
    basePrice: 0,
    hasActiveOffer: false,
    badge: 'best-seller' as const,
  }

  const currency = getCurrencyLabel('ar')
  const hasPrice = displaySlide.currentPrice > 0
  const hasDiscount = displaySlide.hasActiveOffer && displaySlide.basePrice > displaySlide.currentPrice

  return (
    <section className="relative isolate overflow-hidden border-b border-stone-200 bg-[linear-gradient(180deg,#fffdf9_0%,#f7f9fc_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.10),transparent_22%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.10),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.45),rgba(255,255,255,0.88))]" />
      <div className="absolute -left-12 top-16 hidden h-64 w-64 rounded-full bg-sky-300/15 blur-3xl md:block" aria-hidden="true" />
      <div className="absolute -right-10 top-24 hidden h-72 w-72 rounded-full bg-orange-300/20 blur-3xl md:block" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:py-12">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] lg:items-center">
          <div className="order-2 lg:order-1">
            <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/60 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-stone-200 bg-white/90 px-3 py-2 text-[10px] font-black tracking-[0.08em] text-slate-700 sm:px-4 sm:text-[11px] sm:tracking-[0.22em]">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                  منتجات مختارة بعناية
                </span>
                <span className="inline-flex items-center whitespace-nowrap rounded-full border border-stone-200/80 bg-stone-50/90 px-3 py-2 text-[10px] font-bold tracking-[0.08em] text-slate-500 sm:px-4 sm:text-[11px] sm:tracking-[0.18em]">
                  تبديل واسترجاع سهل
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#fb7185_100%)] px-6 text-sm font-black text-white shadow-[0_18px_40px_rgba(249,115,22,0.28)]"
                >
                  تسوق الآن
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link href="/shop" className="whitespace-nowrap rounded-full border border-stone-200/80 bg-white/90 px-3 py-2 text-[11px] font-black tracking-[0.08em] text-slate-600 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
                  تسوق الكل
                </Link>
                <Link href="#best-sellers" className="whitespace-nowrap rounded-full border border-stone-200/80 bg-white/90 px-3 py-2 text-[11px] font-black tracking-[0.08em] text-slate-600 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
                  الأكثر مبيعًا
                </Link>
                <Link href="#new-arrivals" className="whitespace-nowrap rounded-full border border-stone-200/80 bg-white/90 px-3 py-2 text-[11px] font-black tracking-[0.08em] text-slate-600 sm:px-4 sm:text-xs sm:tracking-[0.18em]">
                  وصل حديثًا
                </Link>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[#09101a] shadow-[0_32px_90px_rgba(15,23,42,0.22)]">
              <div className="relative min-h-[520px] sm:min-h-[560px]">
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.72)_0%,rgba(15,23,42,0.42)_45%,rgba(15,23,42,0.18)_100%)] md:bg-[linear-gradient(120deg,rgba(2,6,23,0.94)_0%,rgba(15,23,42,0.78)_42%,rgba(15,23,42,0.44)_100%)]" />
                  <Image
                    src={getImg(displaySlide.imagePath)}
                    alt={displaySlide.titleAr || displaySlide.titleEn}
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover object-center opacity-85 md:opacity-60"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_24%,rgba(255,255,255,0.20),transparent_18%),linear-gradient(180deg,rgba(7,10,18,0.10),rgba(7,10,18,0.08)),linear-gradient(0deg,rgba(2,6,23,0.64)_0%,rgba(2,6,23,0.22)_38%,rgba(2,6,23,0)_64%)]" />
                </div>

                <div className="relative flex h-full flex-col justify-between gap-6 p-5 sm:p-7 md:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="inline-flex items-center rounded-full bg-[#111827] px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-[0_16px_30px_rgba(17,24,39,0.24)]">
                        عرض مميز
                      </span>
                    </div>

                    <div className="hidden min-w-[128px] rounded-[24px] border border-white/12 bg-white/10 px-4 py-3 text-white/88 shadow-[0_20px_40px_rgba(2,6,23,0.18)] backdrop-blur-xl sm:block">
                      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                        تمهيد ثابت
                      </div>
                      <div className="mt-2 text-sm font-black">
                        تحميل التفاعل لاحقًا
                      </div>
                    </div>
                  </div>

                  <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-6">
                    <div className="max-w-md self-end">
                      <div className="rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.40),rgba(15,23,42,0.64))] px-4 py-4 text-left shadow-[0_20px_50px_rgba(2,6,23,0.24)] backdrop-blur-md sm:px-5 sm:py-5 md:px-5 md:py-5">
                        {displaySlide.brand ? (
                          <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.24em] text-white/68 sm:mb-3 sm:text-[11px]">
                            {displaySlide.brand}
                          </div>
                        ) : null}

                        <div className="flex items-start justify-between gap-4">
                          <div className="order-1 min-w-0 max-w-[62%] text-right">
                            <h1 className="text-right font-[family:var(--font-playfair)] text-sm font-black leading-[1.15] tracking-[-0.02em] text-white drop-shadow-[0_8px_24px_rgba(2,6,23,0.5)] sm:text-base md:text-lg">
                              {displaySlide.titleAr || displaySlide.titleEn}
                            </h1>

                            {hasPrice && (
                              <div className="mt-2 flex flex-wrap items-end justify-end gap-x-2 gap-y-1 text-right">
                                <div className="text-sm font-black text-[#f8deb0] drop-shadow-[0_6px_18px_rgba(2,6,23,0.42)] sm:text-base">
                                  {displaySlide.currentPrice.toFixed(0)}
                                  <span className="ms-1.5 text-[11px] font-semibold text-[#f1e3c8]/90 sm:text-xs">{currency}</span>
                                </div>
                                {hasDiscount ? (
                                  <div className="text-xs font-semibold text-stone-300/50 line-through sm:text-sm">
                                    {displaySlide.basePrice.toFixed(0)} {currency}
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>

                          <div className="order-2 flex shrink-0 justify-end text-right">
                            <Link
                              href={displaySlide.href}
                              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fb7185_0%,#f97316_100%)] px-5 text-sm font-black text-white shadow-[0_20px_44px_rgba(249,115,22,0.26)]"
                            >
                              تفاصيل المنتج
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative hidden lg:block">
                      <div className="relative rounded-[28px] border border-white/15 bg-white/10 p-3 shadow-[0_28px_50px_rgba(2,6,23,0.22)] backdrop-blur-2xl">
                        <div className="relative aspect-[0.86] overflow-hidden rounded-[22px] bg-white/8">
                          <Image
                            src={getImg(displaySlide.imagePath)}
                            alt={displaySlide.titleAr || displaySlide.titleEn}
                            fill
                            loading="lazy"
                            sizes="220px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}