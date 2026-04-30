'use client'
import { memo, useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'

const API_BASE = getPublicApiBaseUrl()
function buildUrl(path?: string | null) {
  return joinUrl(API_BASE, path)
}

type Props = {
  allImages: string[]
  activeImg: number
  onActiveImgChange: React.Dispatch<React.SetStateAction<number>>
  imgSrc: string
  name: string
  sku: string
  inStock: boolean
  hasSavings: boolean
  discountPercentage: number
  wishlisted: boolean
  wishlistLoading: boolean
  onWishlist: () => void
  t: (en: string, ar: string) => string
}

export const ProductImageGallery = memo(function ProductImageGallery({
  allImages,
  activeImg,
  onActiveImgChange,
  imgSrc,
  name,
  sku,
  inStock,
  hasSavings,
  discountPercentage,
  wishlisted,
  wishlistLoading,
  onWishlist,
  t,
}: Props) {
  const [zoomed, setZoomed] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setZoomed(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="flex flex-col gap-3 md:sticky md:top-24">
      <div
        className="relative aspect-square overflow-hidden rounded-[34px] border cursor-zoom-in group"
        style={{ borderColor: 'var(--line)', background: '#fff', boxShadow: '0 18px 50px rgba(10,31,68,0.08)' }}
        onClick={() => imgSrc && setZoomed(true)}
        onTouchStart={e => {
          touchStartX.current = e.touches[0].clientX
          touchStartY.current = e.touches[0].clientY
        }}
        onTouchEnd={e => {
          if (touchStartX.current === null || touchStartY.current === null) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          const dy = e.changedTouches[0].clientY - touchStartY.current
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            if (dx < 0) onActiveImgChange(i => (i + 1) % allImages.length)
            else onActiveImgChange(i => (i - 1 + allImages.length) % allImages.length)
          }
          touchStartX.current = null
          touchStartY.current = null
        }}
      >
        <div
          className="relative w-full aspect-[1/1] min-h-[340px] max-h-[520px] overflow-hidden flex items-center justify-center"
          style={{ background: 'var(--paper)', aspectRatio: '1/1', minHeight: 340, maxHeight: 520 }}
        >
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={name}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 520px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onError={e => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3" style={{ color: 'var(--line)' }}>
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium" style={{ color: 'var(--mute)' }}>{t('No image', 'لا توجد صورة')}</p>
            </div>
          )}
        </div>

        {hasSavings && (
          <div className="absolute start-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-sm font-black text-white shadow-lg pointer-events-none">
            -{Math.round(discountPercentage)}% OFF
          </div>
        )}

        {imgSrc && (
          <div className="absolute bottom-3 end-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity duration-200 pointer-events-none group-hover:opacity-100">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            {t('Zoom', 'تكبير')}
          </div>
        )}

        <button
          onClick={e => { e.stopPropagation(); onWishlist() }}
          disabled={wishlistLoading}
          className={`absolute end-3 top-3 flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 shadow-md
            ${wishlisted ? 'bg-red-500 text-white scale-110' : 'bg-white/90 hover:text-red-500 hover:bg-white text-[var(--mute)]'}`}
        >
          {wishlistLoading ? (
            <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>

        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/58 backdrop-blur-[2px] pointer-events-none">
            <span className="px-5 py-2 text-white text-sm font-black rounded-full" style={{ background: 'rgba(10,31,68,0.80)' }}>
              {t('Out of stock', 'نفد المخزون')}
            </span>
          </div>
        )}

        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden pointer-events-none">
            {allImages.map((_, idx) => (
              <span key={idx} className={`rounded-full transition-all duration-300
                ${activeImg === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>

      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {allImages.map((img, idx) => {
            const src = buildUrl(img)
            return (
              <button
                key={idx}
                onClick={() => onActiveImgChange(idx)}
                className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-all
                  ${activeImg === idx ? 'scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                style={activeImg === idx ? { borderColor: 'var(--ink)' } : undefined}
              >
                {src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={`${name} ${idx + 1}`} loading={idx === 0 ? 'eager' : 'lazy'} className="w-full h-full object-cover" />
                )}
              </button>
            )
          })}
        </div>
      )}

      <p className="text-center font-mono text-xs" style={{ color: 'var(--mute)' }}>SKU: {sku}</p>

      {zoomed && imgSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomed(false)}
        >
          <button
            className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setZoomed(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {allImages.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); onActiveImgChange(i => (i - 1 + allImages.length) % allImages.length) }}
                className="absolute start-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); onActiveImgChange(i => (i + 1) % allImages.length) }}
                className="absolute end-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-3xl aspect-square"
            onClick={e => e.stopPropagation()}
            onTouchStart={e => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY }}
            onTouchEnd={e => {
              if (touchStartX.current === null) return
              const dx = e.changedTouches[0].clientX - touchStartX.current
              if (Math.abs(dx) > 40) {
                if (dx < 0) onActiveImgChange(i => (i + 1) % allImages.length)
                else onActiveImgChange(i => (i - 1 + allImages.length) % allImages.length)
              }
              touchStartX.current = null
            }}
          >
            <Image src={imgSrc} alt={name} fill sizes="100vw" className="object-contain" />
          </div>

          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={e => { e.stopPropagation(); onActiveImgChange(idx) }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${activeImg === idx ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
})
