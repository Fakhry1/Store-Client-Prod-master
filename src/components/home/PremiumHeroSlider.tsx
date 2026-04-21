'use client'

import type React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocale } from '@/context/locale'
import { getCurrencyLabel } from '@/lib/store'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'

const API_BASE_URL = getPublicApiBaseUrl()
const AUTOPLAY_MS = 6000
const RESUME_AFTER_INTERACTION_MS = 8500
const DRAG_THRESHOLD = 48

export interface HomeHeroSlide {
  id: string
  href: string
  titleEn: string
  titleAr: string
  brand?: string
  categoryNameEn?: string
  categoryNameAr?: string
  imagePath?: string
  currentPrice: number
  basePrice: number
  hasActiveOffer: boolean
  discountPercentage?: number
  badge: 'best-seller' | 'limited-offer' | 'new-arrival'
  offerEndsAt?: string
  ratingValue?: number
  reviewCount?: number
}

export const HOME_HERO_SLIDE_EXAMPLE: HomeHeroSlide = {
  id: 'hero-example-1',
  href: '/product?id=101&variant=201&branch=1',
  titleEn: 'Performance Runner Pro',
  titleAr: 'حذاء الأداء الاحترافي',
  brand: 'AERON',
  categoryNameEn: 'Footwear',
  categoryNameAr: 'أحذية',
  imagePath: '/images/products/performance-runner-pro.avif',
  currentPrice: 249,
  basePrice: 319,
  hasActiveOffer: true,
  discountPercentage: 22,
  badge: 'limited-offer',
  ratingValue: 4.8,
  reviewCount: 128,
}

interface Props {
  slides: HomeHeroSlide[]
}

function getImg(path?: string | null) {
  return joinUrl(API_BASE_URL, path) ?? '/placeholder.jpg'
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setPrefersReducedMotion(mediaQuery.matches)

    onChange()
    mediaQuery.addEventListener('change', onChange)

    return () => {
      mediaQuery.removeEventListener('change', onChange)
    }
  }, [])

  return prefersReducedMotion
}

function useIsMobileViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobileViewport(mediaQuery.matches)

    onChange()
    mediaQuery.addEventListener('change', onChange)

    return () => {
      mediaQuery.removeEventListener('change', onChange)
    }
  }, [])

  return isMobileViewport
}

function getWrappedOffset(index: number, activeIndex: number, total: number) {
  const forward = (index - activeIndex + total) % total
  const backward = (activeIndex - index + total) % total

  if (forward === 0) return 0
  if (forward <= backward) return forward
  return -backward
}

function formatPercent(value?: number) {
  if (!value || value <= 0) return null
  return Math.round(value)
}

export function PremiumHeroSlider({ slides }: Props) {
  const { t, isRTL, locale } = useLocale()
  const [activeIndex, setActiveIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [isTouchPaused, setIsTouchPaused] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [dragOffset, setDragOffset] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})
  const [userPaused, setUserPaused] = useState(false)
  const resumeTimerRef = useRef<number | null>(null)
  const pointerStateRef = useRef<{ id: number | null; startX: number; dragging: boolean }>({
    id: null,
    startX: 0,
    dragging: false,
  })
  const progressValueRef = useRef(0)
  const renderedProgressRef = useRef(0)
  const lastFrameTimeRef = useRef<number | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobileViewport = useIsMobileViewport()
  const currency = getCurrencyLabel(locale)

  const quickLinks = useMemo(
    () => [
      { href: '/shop', label: t('Shop all', 'تسوق الكل') },
      { href: '#best-sellers', label: t('Best sellers', 'الأكثر مبيعًا') },
      { href: '#new-arrivals', label: t('New arrivals', 'وصل حديثًا') },
    ],
    [t]
  )

  const disableAutoplay = prefersReducedMotion || isMobileViewport
  const isPaused = disableAutoplay || isHovered || isTouchPaused || isFocused || userPaused || !isVisible
  useEffect(() => {
    if (activeIndex > Math.max(slides.length - 1, 0)) {
      setActiveIndex(0)
    }
  }, [activeIndex, slides.length])

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }

    onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (slides.length <= 1 || disableAutoplay) {
      setProgress(0)
      progressValueRef.current = 0
      renderedProgressRef.current = 0
      lastFrameTimeRef.current = null
      return
    }

    let frameId = 0

    const animate = (time: number) => {
      if (lastFrameTimeRef.current == null) {
        lastFrameTimeRef.current = time
      }

      const delta = time - lastFrameTimeRef.current
      lastFrameTimeRef.current = time

      if (!isPaused) {
        const nextProgress = Math.min(progressValueRef.current + delta / AUTOPLAY_MS, 1)
        progressValueRef.current = nextProgress
        if (Math.abs(nextProgress - renderedProgressRef.current) >= 0.015 || nextProgress >= 1) {
          renderedProgressRef.current = nextProgress
          setProgress(nextProgress)
        }

        if (nextProgress >= 1) {
          progressValueRef.current = 0
          renderedProgressRef.current = 0
          setProgress(0)
          setActiveIndex((current) => (current + 1) % slides.length)
        }
      }

      frameId = window.requestAnimationFrame(animate)
    }

    frameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frameId)
      lastFrameTimeRef.current = null
    }
  }, [disableAutoplay, isPaused, slides.length])

  useEffect(() => {
    progressValueRef.current = 0
    renderedProgressRef.current = 0
    setProgress(0)
  }, [activeIndex])

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) {
        window.clearTimeout(resumeTimerRef.current)
      }
    }
  }, [])

  function scheduleResume() {
    if (resumeTimerRef.current) {
      window.clearTimeout(resumeTimerRef.current)
    }

    setUserPaused(true)
    resumeTimerRef.current = window.setTimeout(() => {
      setUserPaused(false)
    }, RESUME_AFTER_INTERACTION_MS)
  }

  function goToSlide(index: number) {
    if (slides.length === 0) return
    const nextIndex = (index + slides.length) % slides.length
    setActiveIndex(nextIndex)
  }

  function moveSlide(direction: 1 | -1) {
    scheduleResume()
    goToSlide(activeIndex + direction)
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (slides.length <= 1) return

    pointerStateRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      dragging: true,
    }
    setIsTouchPaused(true)
    setDragOffset(0)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!pointerStateRef.current.dragging || pointerStateRef.current.id !== event.pointerId) return

    setDragOffset(event.clientX - pointerStateRef.current.startX)
  }

  function finishPointerGesture(pointerId: number) {
    if (!pointerStateRef.current.dragging || pointerStateRef.current.id !== pointerId) return

    const delta = dragOffset
    pointerStateRef.current = { id: null, startX: 0, dragging: false }
    setIsTouchPaused(false)
    scheduleResume()

    if (Math.abs(delta) >= DRAG_THRESHOLD) {
      const direction = delta > 0 ? (isRTL ? 1 : -1) : (isRTL ? -1 : 1)
      goToSlide(activeIndex + direction)
    }

    setDragOffset(0)
  }

  function getBadgeLabel(slide: HomeHeroSlide) {
    if (slide.badge === 'limited-offer') return t('Limited Offer', 'عرض محدود')
    if (slide.badge === 'new-arrival') return t('New Arrival', 'وصل حديثًا')
    return t('Best Seller', 'الأكثر مبيعًا')
  }

  function getBadgeClass(slide: HomeHeroSlide) {
    if (slide.badge === 'limited-offer') return 'bg-[#f97316] text-white shadow-[0_16px_30px_rgba(249,115,22,0.28)]'
    if (slide.badge === 'new-arrival') return 'bg-[#0f766e] text-white shadow-[0_16px_30px_rgba(15,118,110,0.22)]'
    return 'bg-[#111827] text-white shadow-[0_16px_30px_rgba(17,24,39,0.24)]'
  }

  if (slides.length === 0) {
    return (
      <section className="relative isolate overflow-hidden border-b border-stone-200 bg-[linear-gradient(180deg,#fffdf9_0%,#f6f8fb_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.10),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="relative overflow-hidden rounded-[36px] border border-white/60 bg-white/75 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-12">
            <div className="hero-shimmer absolute inset-0 opacity-40" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <span className="inline-flex rounded-full border border-stone-200 bg-white/90 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-700">
                {t('Premium storefront', 'واجهة متجر فاخرة')}
              </span>
              <h1 className="mt-6 text-3xl font-black leading-tight text-slate-950 md:text-5xl">
                {t('Fresh hero products will appear here as soon as the catalog is ready.', 'ستظهر المنتجات المميزة هنا فور جاهزية الكتالوج.')}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 md:text-base">
                {t(
                  'The storefront stays fast and stable even when live data is temporarily unavailable. Browse the catalog while the hero refreshes on the next data cycle.',
                  'يبقى المتجر سريعًا ومستقرًا حتى عند تعذر البيانات المباشرة مؤقتًا. يمكنك تصفح الكتالوج بينما يتم تحديث الواجهة في الدورة التالية.'
                )}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#111827_0%,#334155_100%)] px-6 text-sm font-black text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)]"
                >
                  {t('Shop Now', 'تسوق الآن')}
                </Link>
                <span className="inline-flex min-h-12 items-center rounded-2xl border border-stone-200 bg-white/90 px-5 text-sm font-semibold text-slate-600">
                  {t('Automatic fallback active', 'تم تفعيل الوضع الاحتياطي')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

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
                  {t('Carefully selected products', 'منتجات مختارة بعناية')}
                </span>
                <span className="inline-flex items-center whitespace-nowrap rounded-full border border-stone-200/80 bg-stone-50/90 px-3 py-2 text-[10px] font-bold tracking-[0.08em] text-slate-500 sm:px-4 sm:text-[11px] sm:tracking-[0.18em]">
                  {t('Easy exchange and returns', 'تبديل واسترجاع سهل')}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316_0%,#fb7185_100%)] px-6 text-sm font-black text-white shadow-[0_18px_40px_rgba(249,115,22,0.28)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                >
                  {t('Shop Now', 'تسوق الآن')}
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap gap-2.5">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="whitespace-nowrap rounded-full border border-stone-200/80 bg-white/90 px-3 py-2 text-[11px] font-black tracking-[0.08em] text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-600 sm:px-4 sm:text-xs sm:tracking-[0.18em]"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div
              className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[#09101a] shadow-[0_32px_90px_rgba(15,23,42,0.22)]"
              role="region"
              aria-roledescription="carousel"
              aria-label={t('Best sellers hero slider', 'شريط الواجهة للمنتجات الأكثر مبيعًا')}
              tabIndex={0}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onFocusCapture={() => setIsFocused(true)}
              onBlurCapture={() => setIsFocused(false)}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') {
                  event.preventDefault()
                  moveSlide(isRTL ? 1 : -1)
                }

                if (event.key === 'ArrowRight') {
                  event.preventDefault()
                  moveSlide(isRTL ? -1 : 1)
                }

                if (event.key === 'Home') {
                  event.preventDefault()
                  scheduleResume()
                  goToSlide(0)
                }

                if (event.key === 'End') {
                  event.preventDefault()
                  scheduleResume()
                  goToSlide(slides.length - 1)
                }

                if (event.key === ' ' || event.key === 'Spacebar') {
                  event.preventDefault()
                  if (userPaused) {
                    setUserPaused(false)
                    if (resumeTimerRef.current) {
                      window.clearTimeout(resumeTimerRef.current)
                    }
                  } else {
                    scheduleResume()
                  }
                }
              }}
            >
              <div
                className="relative min-h-[520px] touch-pan-y sm:min-h-[560px]"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={(event) => finishPointerGesture(event.pointerId)}
                onPointerCancel={(event) => finishPointerGesture(event.pointerId)}
              >
                {slides.map((slide, index) => {
                  const offset = getWrappedOffset(index, activeIndex, slides.length)
                  const isActive = offset === 0
                  const isNext = offset === 1 || offset === 1 - slides.length
                  const isPrev = offset === -1 || offset === slides.length - 1
                  const shouldRender = isActive || isNext || isPrev

                  if (!shouldRender) return null

                  const imageLoaded = loadedImages[slide.id]
                  const discount = formatPercent(slide.discountPercentage)
                  const localizedTitle = locale === 'ar' ? slide.titleAr || slide.titleEn : slide.titleEn || slide.titleAr
                  const activeDrag = isActive ? dragOffset : 0
                  const slideTranslate = isActive
                    ? activeDrag
                    : isNext
                      ? (isRTL ? -56 : 56)
                      : isPrev
                        ? (isRTL ? 56 : -56)
                        : 0

                  return (
                    <article
                      key={slide.id}
                      className="absolute inset-0 will-change-transform"
                      aria-hidden={!isActive}
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: `translate3d(${slideTranslate}px, 0, 0) scale(${isActive ? 1 : 0.985})`,
                        transition: prefersReducedMotion
                          ? 'opacity 0.01s linear'
                          : 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1), opacity 450ms ease',
                        pointerEvents: isActive ? 'auto' : 'none',
                      }}
                    >
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,23,0.72)_0%,rgba(15,23,42,0.42)_45%,rgba(15,23,42,0.18)_100%)] md:bg-[linear-gradient(120deg,rgba(2,6,23,0.94)_0%,rgba(15,23,42,0.78)_42%,rgba(15,23,42,0.44)_100%)]" />
                        <Image
                          src={getImg(slide.imagePath)}
                          alt={localizedTitle}
                          fill
                          priority={index === 0}
                          loading={index === 0 ? 'eager' : 'lazy'}
                          fetchPriority={index === 0 ? 'high' : 'auto'}
                          sizes="(max-width: 1024px) 100vw, 55vw"
                          className="object-cover object-center opacity-85 md:opacity-60"
                          onLoad={() => {
                            setLoadedImages((current) => ({ ...current, [slide.id]: true }))
                          }}
                          onError={(event) => {
                            setLoadedImages((current) => ({ ...current, [slide.id]: true }))
                            ;(event.target as HTMLImageElement).src = '/placeholder.jpg'
                          }}
                        />
                        <div
                          className="absolute inset-0 bg-[radial-gradient(circle_at_80%_24%,rgba(255,255,255,0.14),transparent_18%),linear-gradient(180deg,rgba(7,10,18,0.02),rgba(7,10,18,0.08)),linear-gradient(0deg,rgba(2,6,23,0.52)_0%,rgba(2,6,23,0.14)_36%,rgba(2,6,23,0)_62%)] md:bg-[radial-gradient(circle_at_80%_24%,rgba(255,255,255,0.20),transparent_18%),linear-gradient(180deg,rgba(7,10,18,0.10),rgba(7,10,18,0.08)),linear-gradient(0deg,rgba(2,6,23,0.64)_0%,rgba(2,6,23,0.22)_38%,rgba(2,6,23,0)_64%)]"
                          style={{
                            transform: isActive ? `translate3d(${activeDrag * -0.08}px, 0, 0) scale(1.04)` : 'scale(1.01)',
                            transition: prefersReducedMotion ? 'none' : 'transform 600ms cubic-bezier(0.22, 1, 0.36, 1)',
                          }}
                        />
                        {!imageLoaded && (
                          <div className="hero-shimmer absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.12),rgba(255,255,255,0.04))]" aria-hidden="true" />
                        )}
                      </div>

                      <div className="relative flex h-full flex-col justify-between gap-6 p-5 sm:p-7 md:p-8">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className={`inline-flex items-center rounded-full px-3.5 py-2 text-[11px] font-black uppercase tracking-[0.18em] ${getBadgeClass(slide)}`}>
                              {getBadgeLabel(slide)}
                            </span>
                            {discount ? (
                              <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500 px-4 py-2 text-sm font-black text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)]">
                                {t('Save', 'وفّر')} {discount}%
                              </span>
                            ) : null}
                          </div>

                          <div className="hidden min-w-[128px] rounded-[24px] border border-white/12 bg-white/10 px-4 py-3 text-white/88 shadow-[0_20px_40px_rgba(2,6,23,0.18)] backdrop-blur-xl sm:block">
                            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">
                              {t('Autoplay', 'التشغيل التلقائي')}
                            </div>
                            <div className="mt-2 text-sm font-black">
                              {isPaused ? t('Paused', 'متوقف') : t('Running', 'يعمل')}
                            </div>
                          </div>
                        </div>

                        <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-6">
                          <div className="max-w-md self-end">
                            <div className="rounded-[26px] border border-white/12 bg-[linear-gradient(180deg,rgba(15,23,42,0.40),rgba(15,23,42,0.64))] px-4 py-4 text-left shadow-[0_20px_50px_rgba(2,6,23,0.24)] backdrop-blur-md sm:px-5 sm:py-5 md:px-5 md:py-5">
                            {slide.brand ? (
                              <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.24em] text-white/68 sm:mb-3 sm:text-[11px]">
                                {slide.brand}
                              </div>
                            ) : null}

                            <div className="flex items-start justify-between gap-4">
                              <div className="order-1 min-w-0 max-w-[62%] text-right">
                                <h2 className="text-right font-[family:var(--font-playfair)] text-sm font-black leading-[1.15] tracking-[-0.02em] text-white drop-shadow-[0_8px_24px_rgba(2,6,23,0.5)] sm:text-base md:text-lg">
                                  {localizedTitle}
                                </h2>

                                <div className="mt-2 flex flex-wrap items-end justify-end gap-x-2 gap-y-1 text-right">
                                  <div className="text-sm font-black text-[#f8deb0] drop-shadow-[0_6px_18px_rgba(2,6,23,0.42)] sm:text-base">
                                    {slide.currentPrice.toFixed(0)}
                                    <span className="ms-1.5 text-[11px] font-semibold text-[#f1e3c8]/90 sm:text-xs">{currency}</span>
                                  </div>
                                  {slide.hasActiveOffer && slide.basePrice > slide.currentPrice ? (
                                    <div className="text-xs font-semibold text-stone-300/50 line-through sm:text-sm">
                                      {slide.basePrice.toFixed(0)} {currency}
                                    </div>
                                  ) : null}
                                </div>
                              </div>

                              <div className="order-2 flex shrink-0 justify-end text-right">
                                <Link
                                  href={slide.href}
                                  className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#fb7185_0%,#f97316_100%)] px-5 text-sm font-black text-white shadow-[0_20px_44px_rgba(249,115,22,0.26)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                                >
                                  {t('Product details', 'تفاصيل المنتج')}
                                </Link>
                              </div>
                            </div>
                            </div>
                          </div>

                          <div className="relative hidden lg:block">
                            <div className="hero-float relative rounded-[28px] border border-white/15 bg-white/10 p-3 shadow-[0_28px_50px_rgba(2,6,23,0.22)] backdrop-blur-2xl">
                              <div className="relative aspect-[0.86] overflow-hidden rounded-[22px] bg-white/8">
                                {!imageLoaded && <div className="hero-shimmer absolute inset-0 z-10" aria-hidden="true" />}
                                <Image
                                  src={getImg(slide.imagePath)}
                                  alt={localizedTitle}
                                  fill
                                  loading="lazy"
                                  sizes="220px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="mt-3 flex items-center justify-between gap-3 rounded-[20px] border border-white/12 bg-black/15 px-3 py-3 text-white/88">
                                <div>
                                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
                                    {t('Conversion cue', 'إشارة التحويل')}
                                  </div>
                                  <div className="mt-1 text-sm font-black">
                                    {discount ? `${discount}% ${t('saved today', 'توفير اليوم')}` : t('Popular now', 'رائج الآن')}
                                  </div>
                                </div>
                                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12">
                                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}

                <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-30 flex items-center justify-between px-3 sm:px-4">
                  <button
                    type="button"
                    onClick={() => moveSlide(isRTL ? 1 : -1)}
                    aria-label={t('Previous slide', 'الشريحة السابقة')}
                    className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-white shadow-[0_16px_32px_rgba(2,6,23,0.18)] backdrop-blur-xl transition-colors duration-300 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    <svg className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => moveSlide(isRTL ? -1 : 1)}
                    aria-label={t('Next slide', 'الشريحة التالية')}
                    className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/12 bg-white/10 text-white shadow-[0_16px_32px_rgba(2,6,23,0.18)] backdrop-blur-xl transition-colors duration-300 hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                  >
                    <svg className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}