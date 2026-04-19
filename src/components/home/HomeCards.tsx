'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useLocale } from '@/context/locale'
import { getCurrencyLabel } from '@/lib/store'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'
import type { CatalogItem } from '@/types'

const API_BASE_URL = getPublicApiBaseUrl()

function getImg(path?: string | null) {
  return joinUrl(API_BASE_URL, path) ?? '/placeholder.jpg'
}

export function OfferCard({
  item,
  branchId,
  priority = false,
}: {
  item: CatalogItem
  branchId: number
  priority?: boolean
}) {
  const { locale, t } = useLocale()
  const name = locale === 'ar' ? item.productNameAr || item.productNameEn : item.productNameEn || item.productNameAr
  const currency = getCurrencyLabel(locale)

  return (
    <Link
      href={`/product?id=${item.productId}&variant=${item.variantId}&branch=${branchId}`}
      className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-300/35 hover:bg-white/[0.09] hover:shadow-[0_18px_36px_rgba(0,0,0,0.18)]"
    >
      <div className="relative aspect-square overflow-hidden bg-white/6">
        <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3">
          <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white">
            -{Math.round(item.discountPercentage ?? 0)}%
          </span>
          <span className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[10px] font-bold text-white/75">
            {t('Offer', 'عرض')}
          </span>
        </div>

        {item.imagePath ? (
          <Image
            src={getImg(item.imagePath)}
            alt={name}
            fill
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 15vw"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            className="object-cover opacity-92 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/placeholder.jpg'
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-10 w-10 text-white/18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-[#17191f] px-4 py-4">
        <p className="line-clamp-2 min-h-[3rem] text-sm font-black leading-6 text-white">{name}</p>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-base font-black text-amber-300">
              {item.currentPrice.toFixed(0)} {currency}
            </span>
            <span className="text-xs text-white/55 decoration-white/45 line-through">
              {item.basePrice.toFixed(0)}
            </span>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/12 text-white transition-colors group-hover:bg-amber-400 group-hover:text-slate-950">
            <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}

export function FeaturedCard({
  item,
  branchId,
  priority = false,
}: {
  item: CatalogItem
  branchId: number
  priority?: boolean
}) {
  const { locale, t } = useLocale()
  const name = locale === 'ar' ? item.productNameAr || item.productNameEn : item.productNameEn || item.productNameAr
  const currency = getCurrencyLabel(locale)

  return (
    <Link
      href={`/product?id=${item.productId}&variant=${item.variantId}&branch=${branchId}`}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-[0_12px_28px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-stone-300 hover:shadow-[0_22px_42px_rgba(15,23,42,0.08)]"
    >
      <div className="relative aspect-[0.95] overflow-hidden bg-[#f7f4ee]">
        {item.imagePath ? (
          <Image
            src={getImg(item.imagePath)}
            alt={name}
            fill
            sizes="(max-width: 1024px) 46vw, 23vw"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              ;(e.target as HTMLImageElement).src = '/placeholder.jpg'
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg className="h-12 w-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {item.brand ? (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700 backdrop-blur">
              {item.brand}
            </span>
          ) : (
            <span />
          )}

          {item.hasActiveOffer && item.discountPercentage && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-black text-white">
              -{Math.round(item.discountPercentage)}%
            </span>
          )}
        </div>

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
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[3.2rem] text-sm font-black leading-6 text-slate-900 md:text-[15px]">{name}</h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <span className="text-base font-black text-slate-900">
              {item.currentPrice.toFixed(0)}
              <span className="ms-1 text-xs font-medium text-slate-400">{currency}</span>
            </span>
            {item.hasActiveOffer && (
              <div className="text-xs text-slate-400 line-through">{item.basePrice.toFixed(0)}</div>
            )}
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-stone-100 text-slate-600 transition-colors group-hover:bg-slate-900 group-hover:text-white">
            <svg className="h-4 w-4 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
