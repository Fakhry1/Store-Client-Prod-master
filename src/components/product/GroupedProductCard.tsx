'use client'

import { useState } from 'react'
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
  const [imgError, setImgError] = useState(false)

  const firstVariant = group.variants.length > 0 ? group.variants[0] : null
  const allOutOfStock = group.totalStock === 0
  const name = locale === 'ar' ? group.productNameAr || group.productNameEn : group.productNameEn || group.productNameAr
  const currencyLabel = getCurrencyLabel(locale)
  const rawImgPath = firstVariant?.imagePath || group.imagePath
  const imgSrc = !imgError ? joinUrl(API_BASE_URL, rawImgPath) : null
  const priceDisplay = group.minPrice === group.maxPrice ? group.minPrice.toFixed(0) : `${group.minPrice.toFixed(0)} - ${group.maxPrice.toFixed(0)}`
  const firstVariantId = firstVariant?.variantId ?? 0
  const detailUrl =
    firstVariantId > 0
      ? `/product?id=${group.productId}&variant=${firstVariantId}&branch=${branchId}`
      : `/product?id=${group.productId}&branch=${branchId}`
  const variantCount = group.variants.length

  return (
    <Link
      href={detailUrl}
      className={`group relative flex h-full flex-col overflow-hidden rounded-[28px] border bg-white shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(15,23,42,0.08)] ${
        allOutOfStock ? 'border-stone-200 opacity-75' : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      <div className="relative aspect-[0.94] overflow-hidden bg-[#f7f4ee]">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={name}
            fill
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-700 ${allOutOfStock ? 'opacity-60' : 'group-hover:scale-105'}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-12 w-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {group.brand ? (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 backdrop-blur">
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
          <div className="absolute bottom-3 start-3 rounded-full bg-slate-950/72 px-3 py-1 text-[10px] font-black text-white backdrop-blur">
            {variantCount} {t('options', 'خيارات')}
          </div>
        )}

        {!allOutOfStock && (
          <div className="absolute inset-x-3 bottom-3 translate-y-3 rounded-2xl bg-white/92 px-3 py-2 opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-black text-slate-900">{t('View details', 'عرض التفاصيل')}</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors group-hover:bg-amber-500">
                <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        )}

        {allOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/62 backdrop-blur-[1px]">
            <span className="rounded-full bg-slate-900/88 px-4 py-1.5 text-xs font-black text-white">
              {t('Out of Stock', 'نفد المخزون')}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[3.2rem] text-sm font-black leading-6 text-slate-900 md:text-[15px]">{name}</h3>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {group.variants.slice(0, 3).map((variant) => (
            <span
              key={variant.variantId}
              className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-slate-600"
            >
              {locale === 'ar' ? variant.variantNameAr || variant.variantNameEn : variant.variantNameEn || variant.variantNameAr}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <span className="text-base font-black text-slate-900">
              {priceDisplay}
              <span className="ms-1 text-xs font-medium text-slate-400">{currencyLabel}</span>
            </span>
            {group.hasActiveOffer && firstVariant && firstVariant.basePrice > group.minPrice && (
              <div className="text-xs text-slate-400 line-through">{firstVariant.basePrice.toFixed(0)}</div>
            )}
          </div>

          <span className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-colors ${allOutOfStock ? 'bg-stone-200 text-stone-400' : 'bg-slate-900 text-white group-hover:bg-amber-500'}`}>
            <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
