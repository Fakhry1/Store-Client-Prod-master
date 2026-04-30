'use client'

import type React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
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

function getMediaMatch(query: string): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(query).matches
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => getMediaMatch('(prefers-reduced-motion: reduce)'))

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  return prefersReducedMotion
}

function useIsMobileViewport() {
  const [isMobileViewport, setIsMobileViewport] = useState(() => getMediaMatch('(max-width: 767px)'))

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const onChange = () => setIsMobileViewport(mediaQuery.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
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
  const prefersReducedMotion = usePrefersReducedMotion()
  const isMobileViewport = useIsMobileViewport()
  const currency = getCurrencyLabel(locale)

  const disableAutoplay = prefersReducedMotion || isMobileViewport
  const isPaused = disableAutoplay || isHovered || isTouchPaused || isFocused || userPaused || !isVisible

  useEffect(() => {
    if (activeIndex > Math.max(slides.length - 1, 0)) {
      setActiveIndex(0)
    }
  }, [activeIndex, slides.length])

  useEffect(() => {
    const onVisibilityChange = () => setIsVisible(!document.hidden)
    onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useEffect(() => {
    if (slides.length <= 1 || disableAutoplay || isPaused) return
    const timer = window.setTimeout(() => {
      setActiveIndex((current: number) => (current + 1) % slides.length)
    }, AUTOPLAY_MS)
    return () => window.clearTimeout(timer)
  }, [activeIndex, disableAutoplay, isPaused, slides.length])

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current)
    }
  }, [])

  function scheduleResume() {
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current)
    setUserPaused(true)
    resumeTimerRef.current = window.setTimeout(() => setUserPaused(false), RESUME_AFTER_INTERACTION_MS)
  }

  function goToSlide(index: number) {
    if (slides.length === 0) return
    setActiveIndex((index + slides.length) % slides.length)
  }

  function moveSlide(direction: 1 | -1) {
    scheduleResume()
    goToSlide(activeIndex + direction)
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (slides.length <= 1) return
    pointerStateRef.current = { id: event.pointerId, startX: event.clientX, dragging: true }
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
      goToSlide(activeIndex + (delta > 0 ? (isRTL ? 1 : -1) : (isRTL ? -1 : 1)))
    }
    setDragOffset(0)
  }

  function getBadgeLabel(slide: HomeHeroSlide) {
    if (slide.badge === 'limited-offer') return t('Limited Offer', 'عرض محدود')
    if (slide.badge === 'new-arrival') return t('New Arrival', 'وصل حديثًا')
    return t('Best Seller', 'الأكثر مبيعًا')
  }

  function getBadgeStyle(slide: HomeHeroSlide): React.CSSProperties {
    if (slide.badge === 'limited-offer') return { background: 'var(--orange)', boxShadow: '0 8px 20px rgba(255,107,44,0.30)' }
    if (slide.badge === 'new-arrival') return { background: '#0f766e', boxShadow: '0 8px 20px rgba(15,118,110,0.25)' }
    return { background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.22)' }
  }

  if (slides.length === 0) {
    return (
      <section className="relative isolate overflow-hidden border-b" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
        <div className="pointer-events-none absolute -start-20 -top-20 h-80 w-80 rounded-full blur-3xl" style={{ background: 'rgba(255,107,44,0.09)' }} />
        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="relative overflow-hidden rounded-[36px] border bg-white p-8 md:p-12" style={{ borderColor: 'var(--line)', boxShadow: '0 24px 80px rgba(10,31,68,0.08)' }}>
            <div className="inone-skeleton absolute inset-0 opacity-40" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <span className="inline-flex rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em]" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}>
                {t('Premium storefront', 'واجهة متجر فاخرة')}
              </span>
              <h1 className="mt-6 text-3xl font-black leading-tight md:text-5xl" style={{ color: 'var(--ink)' }}>
                {t('Fresh hero products will appear here as soon as the catalog is ready.', 'ستظهر المنتجات المميزة هنا فور جاهزية الكتالوج.')}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 md:text-base" style={{ color: 'var(--mute)' }}>
                {t(
                  'The storefront stays fast and stable even when live data is temporarily unavailable.',
                  'يبقى المتجر سريعًا ومستقرًا حتى عند تعذر البيانات المباشرة مؤقتًا.'
                )}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl px-6 text-sm font-black text-white"
                  style={{ background: 'var(--orange)', boxShadow: '0 20px 40px rgba(255,107,44,0.22)' }}
                >
                  {t('Shop Now', 'تسوق الآن')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative isolate overflow-hidden border-b" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
      {/* Corner glow decorations */}
      <div className="pointer-events-none absolute -start-20 -top-20 h-80 w-80 rounded-full blur-3xl" style={{ background: 'rgba(255,107,44,0.09)' }} />
      <div className="pointer-events-none absolute -end-20 bottom-0 h-72 w-72 rounded-full blur-3xl" style={{ background: 'rgba(255,107,44,0.06)' }} />

      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 md:py-10">
        <div
          className="relative overflow-hidden rounded-[32px] sm:rounded-[36px]"
          style={{ boxShadow: '0 32px 90px rgba(10,31,68,0.20)', background: 'var(--ink)' }}
          role="region"
          aria-roledescription="carousel"
          aria-label={t('Best sellers hero slider', 'شريط الواجهة للمنتجات الأكثر مبيعًا')}
          tabIndex={0}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setIsFocused(true)}
          onBlurCapture={() => setIsFocused(false)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') { event.preventDefault(); moveSlide(isRTL ? 1 : -1) }
            if (event.key === 'ArrowRight') { event.preventDefault(); moveSlide(isRTL ? -1 : 1) }
            if (event.key === 'Home') { event.preventDefault(); scheduleResume(); goToSlide(0) }
            if (event.key === 'End') { event.preventDefault(); scheduleResume(); goToSlide(slides.length - 1) }
            if (event.key === ' ' || event.key === 'Spacebar') {
              event.preventDefault()
              if (userPaused) { setUserPaused(false); if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current) }
              else scheduleResume()
            }
          }}
        >
          <div
            className="relative min-h-[560px] touch-pan-y sm:min-h-[580px] lg:min-h-[520px]"
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
              const localizedCategory = locale === 'ar'
                ? slide.categoryNameAr || slide.categoryNameEn
                : slide.categoryNameEn || slide.categoryNameAr
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
                  <div className="flex h-full flex-col lg:grid lg:grid-cols-[45%_55%]">

                    {/* ── TEXT PANEL: bottom on mobile, left on desktop ── */}
                    <div
                      className="flex flex-col justify-center px-6 py-7 order-2 sm:px-8 sm:py-8 lg:order-1 lg:px-10 lg:py-10"
                      style={{ background: 'var(--ink)' }}
                    >
                      {/* Badges */}
                      <div className="mb-5 flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-white"
                          style={getBadgeStyle(slide)}
                        >
                          {getBadgeLabel(slide)}
                        </span>
                        {discount ? (
                          <span className="inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-black text-white" style={{ background: '#10b981', boxShadow: '0 4px 12px rgba(16,185,129,0.30)' }}>
                            {t('Save', 'وفّر')} {discount}%
                          </span>
                        ) : null}
                        {localizedCategory ? (
                          <span className="inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.50)' }}>
                            {localizedCategory}
                          </span>
                        ) : null}
                      </div>

                      {/* Brand */}
                      {slide.brand ? (
                        <div className="mb-2 text-[10px] font-black uppercase tracking-[0.28em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                          {slide.brand}
                        </div>
                      ) : null}

                      {/* Title — large editorial */}
                      <h2
                        className="font-display text-2xl font-black leading-[1.15] tracking-[-0.02em] sm:text-3xl md:text-[2.25rem]"
                        style={{ color: '#fff' }}
                      >
                        {localizedTitle}
                      </h2>

                      {/* Price */}
                      <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                        <div className="text-xl font-black sm:text-2xl" style={{ color: 'var(--champagne)' }}>
                          {slide.currentPrice.toFixed(0)}
                          <span className="ms-1.5 text-xs font-semibold" style={{ color: 'rgba(232,201,155,0.72)' }}>{currency}</span>
                        </div>
                        {slide.hasActiveOffer && slide.basePrice > slide.currentPrice ? (
                          <div className="mb-0.5 text-sm font-semibold line-through" style={{ color: 'rgba(255,255,255,0.36)' }}>
                            {slide.basePrice.toFixed(0)} {currency}
                          </div>
                        ) : null}
                      </div>

                      {/* CTAs */}
                      <div className="mt-5 flex flex-wrap gap-2.5">
                        <Link
                          href="/shop"
                          className="inline-flex min-h-10 items-center justify-center rounded-2xl px-5 text-sm font-black text-white transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
                          style={{ background: 'var(--orange)', boxShadow: '0 12px 28px rgba(255,107,44,0.28)' }}
                        >
                          {t('Shop Now', 'تسوق الآن')}
                        </Link>
                        <Link
                          href={slide.href}
                          className="inline-flex min-h-10 items-center justify-center rounded-2xl border px-5 text-sm font-semibold transition-colors duration-300 hover:border-white/35 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                          style={{ borderColor: 'rgba(255,255,255,0.20)', color: 'rgba(255,255,255,0.80)' }}
                        >
                          {t('Product details', 'تفاصيل المنتج')}
                        </Link>
                      </div>

                    </div>

                    {/* ── IMAGE PANEL: top on mobile, right on desktop ── */}
                    <div className="relative order-1 lg:order-2" style={{ minHeight: '260px' }}>
                      {!imageLoaded && (
                        <div
                          className="hero-shimmer absolute inset-0 z-10"
                          style={{ background: 'linear-gradient(90deg,rgba(255,255,255,0.04),rgba(255,255,255,0.12),rgba(255,255,255,0.04))' }}
                          aria-hidden="true"
                        />
                      )}
                      <Image
                        src={getImg(slide.imagePath)}
                        alt={localizedTitle}
                        fill
                        priority={index === 0}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : 'low'}
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        className="object-cover object-center"
                        onLoad={() => setLoadedImages((current) => ({ ...current, [slide.id]: true }))}
                        onError={(event) => {
                          setLoadedImages((current) => ({ ...current, [slide.id]: true }))
                          ;(event.target as HTMLImageElement).src = '/placeholder.jpg'
                        }}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(7,13,31,0.30)_0%,transparent_42%)]" />

                      {/* Navigation — overlaid on image */}
                      {slides.length > 1 && (
                        <div className="pointer-events-none absolute bottom-4 start-4 end-4 z-20 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => moveSlide(isRTL ? 1 : -1)}
                            aria-label={t('Previous slide', 'الشريحة السابقة')}
                            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/15 bg-black/28 text-white backdrop-blur-xl transition-colors duration-300 hover:bg-black/42 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                          >
                            <svg className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>

                          <div className="flex items-center gap-1.5" role="tablist">
                            {slides.map((_, i) => (
                              <button
                                key={i}
                                type="button"
                                role="tab"
                                aria-selected={i === activeIndex}
                                aria-label={`${t('Slide', 'شريحة')} ${i + 1}`}
                                onClick={() => { scheduleResume(); goToSlide(i) }}
                                className="pointer-events-auto rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                                style={{
                                  height: '6px',
                                  width: i === activeIndex ? '24px' : '6px',
                                  background: i === activeIndex ? 'var(--orange)' : 'rgba(255,255,255,0.40)',
                                }}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => moveSlide(isRTL ? -1 : 1)}
                            aria-label={t('Next slide', 'الشريحة التالية')}
                            className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/15 bg-black/28 text-white backdrop-blur-xl transition-colors duration-300 hover:bg-black/42 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                          >
                            <svg className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
