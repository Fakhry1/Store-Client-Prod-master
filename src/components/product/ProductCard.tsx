'use client'

import Link from 'next/link'
import Image from 'next/image'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { useLocale } from '@/context/locale'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'
import type { CatalogItem } from '@/types'

const API_BASE_URL = getPublicApiBaseUrl()

interface Props {
  item: CatalogItem
  branchId: number
}

export function ProductCard({ item, branchId }: Props) {
  const { locale, t } = useLocale()

  const name = locale === 'ar'
    ? item.productNameAr || item.productNameEn
    : item.productNameEn || item.productNameAr

  const variantName = locale === 'ar'
    ? item.variantNameAr || item.variantNameEn
    : item.variantNameEn || item.variantNameAr

  const imgSrc = joinUrl(API_BASE_URL, item.imagePath) ?? '/placeholder.jpg'
  const outOfStock = item.quantityInStock === 0
  const variantAttributeValues = item.variantAttributes ? Object.values(item.variantAttributes) : []
  const hasVariantAttributes = variantAttributeValues.length > 0

  return (
    <Link
      href={`/product?id=${item.productId}&variant=${item.variantId}&branch=${branchId}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[20px] bg-white border transition-all duration-300 hover:-translate-y-1 active:scale-[0.99]"
      style={{ borderColor: 'var(--line)', boxShadow: '0 2px 12px rgba(10,31,68,0.06)' }}
    >
      {/* ── Image ── */}
      <div className="relative aspect-[0.92] overflow-hidden" style={{ background: 'var(--paper)' }}>
        <Image
          src={imgSrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-700 ${
            outOfStock ? 'opacity-50' : 'group-hover:scale-105'
          }`}
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.jpg' }}
        />

        {/* Badges – top row */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5">
          <div className="flex flex-col gap-1.5">
            {item.brand && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] backdrop-blur"
                style={{ background: 'rgba(255,255,255,0.90)', color: 'var(--ink)' }}
              >
                {item.brand}
              </span>
            )}
            {item.isLowStock && !outOfStock && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-black shadow-sm"
                style={{ background: 'var(--champagne)', color: 'var(--ink)' }}
              >
                {t(`${item.quantityInStock} left`, `${item.quantityInStock} متبقي`)}
              </span>
            )}
          </div>

          {item.hasActiveOffer && item.discountPercentage && (
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-black text-white shadow-sm"
              style={{ background: 'var(--orange)' }}
            >
              -{Math.round(item.discountPercentage)}%
            </span>
          )}
        </div>

        {/* Hover CTA overlay */}
        {!outOfStock && (
          <div
            className="absolute inset-x-2.5 bottom-2.5 translate-y-3 rounded-xl px-3 py-2 opacity-0 shadow-lg backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ background: 'rgba(255,255,255,0.92)' }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black" style={{ color: 'var(--ink)' }}>
                {t('View details', 'عرض التفاصيل')}
              </span>
              <span
                className="flex h-7 w-7 items-center justify-center rounded-lg text-white transition-colors"
                style={{ background: 'var(--orange)' }}
              >
                <ArrowIcon />
              </span>
            </div>
          </div>
        )}

        {/* Out of stock overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px]"
            style={{ background: 'rgba(245,242,236,0.65)' }}>
            <span
              className="rounded-full px-4 py-1.5 text-xs font-black text-white"
              style={{ background: 'rgba(10,31,68,0.88)' }}
            >
              {t('Out of stock', 'نفد المخزون')}
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col p-3.5">
        {/* Name */}
        <div className="min-h-[3.2rem]">
          <h3 className="line-clamp-2 text-sm font-black leading-6 md:text-[15px]" style={{ color: 'var(--ink)' }}>
            {name}
          </h3>
        </div>

        {/* Variant */}
        <p className="mt-1 min-h-[1.2rem] text-xs line-clamp-1" style={{ color: 'var(--mute)' }}>
          {variantName || t('Multiple options available', 'خيارات متعددة متاحة')}
        </p>

        {/* Variant attribute pills */}
        {hasVariantAttributes && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {variantAttributeValues.slice(0, 3).map((value, index) => (
              <span
                key={`${value}-${index}`}
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold"
                style={{ background: 'var(--paper)', color: 'var(--ink)', border: '1px solid var(--line)' }}
              >
                {value}
              </span>
            ))}
          </div>
        )}

        {/* Price row */}
        <div className="mt-auto pt-3">
          <div
            className="flex items-center justify-between gap-2 rounded-[14px] px-3 py-2.5"
            style={{ background: 'var(--paper)' }}
          >
            <PriceDisplay
              basePrice={item.basePrice}
              currentPrice={item.currentPrice}
              hasActiveOffer={item.hasActiveOffer}
              discountPercentage={item.discountPercentage}
              size="sm"
            />
            <span
              className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-xl transition-all ${
                outOfStock ? '' : 'group-hover:shadow-orange'
              }`}
              style={outOfStock
                ? { background: 'var(--paper-2)', color: 'var(--mute)' }
                : { background: 'var(--ink)', color: '#fff' }
              }
            >
              <ArrowIcon />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

const ArrowIcon = () => (
  <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)
