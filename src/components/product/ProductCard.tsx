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

  const name = locale === 'ar' ? item.productNameAr || item.productNameEn : item.productNameEn || item.productNameAr
  const variantName = locale === 'ar' ? item.variantNameAr || item.variantNameEn : item.variantNameEn || item.variantNameAr
  const imgSrc = joinUrl(API_BASE_URL, item.imagePath) ?? '/placeholder.jpg'
  const outOfStock = item.quantityInStock === 0
  const hasVariantAttributes = item.variantAttributes && Object.keys(item.variantAttributes).length > 0
  const variantAttributeValues = item.variantAttributes ? Object.values(item.variantAttributes) : []

  return (
    <Link
      href={`/product?id=${item.productId}&variant=${item.variantId}&branch=${branchId}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_20px_44px_rgba(15,23,42,0.08)] active:scale-[0.99]"
    >
      <div className="relative aspect-[0.92] overflow-hidden bg-[#f7f4ee]">
        <Image
          src={imgSrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-700 ${outOfStock ? 'opacity-50' : 'group-hover:scale-105'}`}
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/placeholder.jpg'
          }}
        />

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col gap-2">
            {item.brand && (
              <span className="rounded-full bg-white/88 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 backdrop-blur">
                {item.brand}
              </span>
            )}
            {item.isLowStock && !outOfStock && (
              <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black text-slate-950 shadow-sm">
                {t(`${item.quantityInStock} left`, `${item.quantityInStock} متبقي`)}
              </span>
            )}
          </div>

          {item.hasActiveOffer && item.discountPercentage && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white shadow-sm">
              -{Math.round(item.discountPercentage)}%
            </span>
          )}
        </div>

        {!outOfStock && (
          <div className="absolute inset-x-3 bottom-3 translate-y-3 rounded-2xl bg-white/90 px-3 py-2 opacity-0 shadow-lg backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
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

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/62 backdrop-blur-[1px]">
            <span className="rounded-full bg-slate-900/88 px-4 py-1.5 text-xs font-black text-white">
              {t('Out of stock', 'نفد المخزون')}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="min-h-[3.4rem]">
          <h3 className="line-clamp-2 text-sm font-black leading-6 text-slate-900 md:text-[15px]">{name}</h3>
        </div>

        <p className="mt-1 min-h-[1.25rem] text-xs text-slate-500 line-clamp-1">
          {variantName || t('Multiple options available', 'خيارات متعددة متاحة')}
        </p>

        {hasVariantAttributes && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {variantAttributeValues.slice(0, 3).map((value, index) => (
              <span
                key={`${value}-${index}`}
                className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold text-slate-600"
              >
                {value}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3 rounded-[22px] bg-[#faf7f1] px-3.5 py-3">
            <PriceDisplay
              basePrice={item.basePrice}
              currentPrice={item.currentPrice}
              hasActiveOffer={item.hasActiveOffer}
              discountPercentage={item.discountPercentage}
              size="sm"
            />
            <span
              className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-2xl transition-all ${
                outOfStock ? 'bg-stone-200 text-stone-400' : 'bg-slate-900 text-white group-hover:bg-amber-500'
              }`}
            >
              <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
