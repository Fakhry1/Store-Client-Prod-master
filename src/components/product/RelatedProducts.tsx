import Image from 'next/image'
import Link from 'next/link'
import { getServerLocale } from '@/lib/locale-server'
import { t as translate } from '@/lib/locale'
import { getCurrencyLabel } from '@/lib/store'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'
import type { ProductSummary } from '@/types'

const API_BASE_URL = getPublicApiBaseUrl()

export async function RelatedProducts({
  items,
  categoryId,
  branchId,
}: {
  items: ProductSummary[]
  categoryId: number
  branchId: number
}) {
  if (items.length === 0) return null

  const locale = await getServerLocale()
  const currencyLabel = getCurrencyLabel(locale)

  return (
    <div className="mx-auto max-w-7xl border-t px-4 py-12 md:px-6" style={{ borderColor: 'var(--line)' }}>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-black md:text-xl" style={{ color: 'var(--ink)' }}>
          {translate(locale, 'You might also like', 'قد يعجبك أيضًا')}
        </h2>
        <Link
          href={`/shop?category=${categoryId}&branch=${branchId}`}
          className="text-xs font-bold transition-colors hover:opacity-70"
          style={{ color: 'var(--orange)' }}
        >
          {translate(locale, 'View all', 'عرض الكل')} &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6">
        {items.map((item) => {
          const name = locale === 'ar' ? item.nameAr || item.nameEn : item.nameEn
          const brand =
            locale === 'ar'
              ? item.brandNameAr || item.brandNameEn || item.brand
              : item.brandNameEn || item.brandNameAr || item.brand
          const imgSrc = joinUrl(API_BASE_URL, item.imagePath)
          const hasOffer = item.hasActiveOffer && item.minCurrentPrice < item.minPrice
          const discountPercentage =
            hasOffer && item.minPrice > 0
              ? Math.round(((item.minPrice - item.minCurrentPrice) / item.minPrice) * 100)
              : undefined

          return (
            <Link
              key={item.id}
              href={`/product?id=${item.id}&branch=${branchId}`}
              className="group overflow-hidden rounded-2xl border bg-white transition-all duration-200 hover:shadow-md"
              style={{ borderColor: 'var(--line)' }}
            >
              <div className="relative aspect-square overflow-hidden" style={{ background: 'var(--paper)' }}>
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--line)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}

                {hasOffer && (
                  <span className="absolute start-2 top-2 rounded-full px-1.5 py-0.5 text-[10px] font-black text-white" style={{ background: 'var(--orange)' }}>
                    -{discountPercentage}%
                  </span>
                )}
              </div>

              <div className="p-2.5">
                {brand && (
                  <p className="mb-0.5 truncate text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--orange)' }}>
                    {brand}
                  </p>
                )}

                <p className="mb-1.5 line-clamp-2 text-xs font-bold leading-snug" style={{ color: 'var(--ink)' }}>{name}</p>

                <div className="flex flex-col gap-1">
                  <span className="text-base font-bold" style={{ color: 'var(--ink)' }}>
                    {item.minCurrentPrice.toFixed(2)} {currencyLabel}
                  </span>
                  {hasOffer && (
                    <span className="text-sm line-through" style={{ color: 'var(--mute)' }}>
                      {item.minPrice.toFixed(2)} {currencyLabel}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
