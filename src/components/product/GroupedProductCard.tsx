'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/context/locale'
import type { ProductGroup } from '@/lib/groupCatalog'
import { getCurrencyLabel } from '@/lib/store'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'

const API_BASE_URL = getPublicApiBaseUrl()

export function GroupedProductCard({
  group,
  branchId,
  priority = false,
}: {
  group: ProductGroup
  branchId: number
  priority?: boolean
}) {
  const { locale, t } = useLocale()

  const firstVariant = group.variants.length > 0 ? group.variants[0] : null
  const allOutOfStock = group.totalStock === 0
  const name = locale === 'ar' ? group.productNameAr || group.productNameEn : group.productNameEn || group.productNameAr
  const currencyLabel = getCurrencyLabel(locale)
  const rawImgPath = firstVariant?.imagePath || group.imagePath
  const imgSrc = joinUrl(API_BASE_URL, rawImgPath) ?? '/placeholder.jpg'
  const priceDisplay = group.minPrice === group.maxPrice ? group.minPrice.toFixed(0) : `${group.minPrice.toFixed(0)} - ${group.maxPrice.toFixed(0)}`
  const firstVariantId = firstVariant?.variantId ?? 0
  const detailUrl =
    firstVariantId > 0
      ? `/product?id=${group.productId}&variant=${firstVariantId}&branch=${branchId}`
      : `/product?id=${group.productId}&branch=${branchId}`
  const variantCount = group.variants.length
  const hasOfferPrice = group.hasActiveOffer && firstVariant && firstVariant.basePrice > group.minPrice

  return (
    <Link
      href={detailUrl}
      prefetch={false}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[30px] border bg-white shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_rgba(15,23,42,0.1)] ${allOutOfStock ? 'opacity-75' : ''}`}
      style={{ borderColor: 'var(--line)' }}
    >
      <div className="relative aspect-[0.94] overflow-hidden" style={{ background: 'var(--paper)' }}>
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={name}
            fill
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            className={`object-cover transition-transform duration-700 ${allOutOfStock ? 'opacity-60' : 'group-hover:scale-105'}`}
            onError={(event) => {
              ;(event.target as HTMLImageElement).src = '/placeholder.jpg'
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-12 w-12" style={{ color: 'var(--line)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {group.brand ? (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] backdrop-blur"
              style={{ color: 'var(--ink)' }}>
              {group.brand}
            </span>
          ) : (
            <span />
          )}

          {group.hasActiveOffer && group.maxDiscount > 0 && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white shadow-sm">
              -{Math.round(group.maxDiscount)}%
            </span>
          )}
        </div>

        {variantCount > 1 && (
          <div className="absolute bottom-3 start-3 rounded-full px-3 py-1 text-[10px] font-black text-white backdrop-blur"
            style={{ background: 'rgba(10,31,68,0.72)' }}>
            {variantCount} {t('options', 'خيارات')}
          </div>
        )}

        {!allOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 translate-y-3 rounded-2xl bg-white/92 px-3 py-2 opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black" style={{ color: 'var(--ink)' }}>{t('View details', 'عرض التفاصيل')}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl text-white transition-colors bg-[var(--ink)] group-hover:bg-[var(--orange)]">
                <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        )}

        {allOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/62 backdrop-blur-[1px]">
            <span className="rounded-full px-4 py-1.5 text-xs font-black text-white"
              style={{ background: 'rgba(10,31,68,0.88)' }}>
              {t('Out of Stock', 'نفد المخزون')}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[3.2rem] text-sm font-black leading-6 md:text-[15px]"
          style={{ color: 'var(--ink)' }}>{name}</h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {group.variants.slice(0, 3).map((variant) => (
            <span
              key={variant.variantId}
              className="rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={{ background: 'var(--paper)', color: 'var(--mute)' }}
            >
              {locale === 'ar' ? variant.variantNameAr || variant.variantNameEn : variant.variantNameEn || variant.variantNameAr}
            </span>
          ))}
        </div>

        <div className="mt-3 rounded-[22px] border px-3 py-2.5"
          style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em]" style={{ color: 'var(--mute)' }}>
              {t('From', 'يبدأ من')}
            </p>
            <div className="mt-1 flex flex-col gap-1">
              <span className="inline-flex items-end gap-1 text-lg font-black" style={{ color: 'var(--ink)' }}>
                {priceDisplay}
                <span className="mb-0.5 text-[11px] font-bold" style={{ color: 'var(--mute)' }}>{currencyLabel}</span>
              </span>

              {hasOfferPrice && (
                <div className="text-xs line-through" style={{ color: 'var(--mute)' }}>
                  {firstVariant.basePrice.toFixed(0)}
                  <span className="ms-1 text-[10px] font-bold">{currencyLabel}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--mute)' }}>
              {t('Best for', 'مناسب لـ')}
            </p>
            <p className="mt-1 text-sm font-bold" style={{ color: 'var(--mute)' }}>
              {variantCount > 1 ? t('Comparison and selection', 'المقارنة والاختيار') : t('Quick purchase', 'شراء سريع')}
            </p>
          </div>

          {allOutOfStock ? (
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl"
              style={{ background: 'var(--paper-2)', color: 'var(--mute)' }}>
              <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          ) : (
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl text-white transition-colors bg-[var(--ink)] group-hover:bg-[var(--orange)]">
              <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
