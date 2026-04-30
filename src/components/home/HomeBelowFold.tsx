import type { CatalogItem, Category } from '@/types'
import { HomeCTA, CategoriesSection, OffersHeader, ProductCollectionSection } from '@/components/home/HomeStatic'
import { OfferCard, FeaturedCard } from '@/components/home/HomeCards'
import { OffersCountdown } from '@/components/home/OffersCountdown'

type Props = {
  categories: Category[]
  offers: CatalogItem[]
  newArrivals: CatalogItem[]
  bestSellers: CatalogItem[]
  premiumPicks: CatalogItem[]
  branchId: number
}

export function HomeBelowFold({ categories, offers, newArrivals, bestSellers, premiumPicks, branchId }: Props) {
  return (
    <>
      {categories.length > 0 && <CategoriesSection categories={categories} />}

      {offers.length > 0 && (
        <section id="offers" className="py-16 md:py-20" style={{ background: 'var(--ink)' }}>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <OffersHeader count={offers.length} />
              <OffersCountdown />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ scrollSnapType: 'x mandatory' }}>
              {offers.map((item, index) => (
                <div
                  key={`${item.productId}-${item.variantId}`}
                  className="w-[calc(50%-6px)] min-w-[160px] shrink-0 sm:w-[calc(33.333%-8px)] lg:w-[calc(16.666%-10px)]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <OfferCard item={item} branchId={branchId} priority={index < 2} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {newArrivals.length > 0 && (
        <ProductCollectionSection
          id="new-arrivals"
          eyebrowEn="Latest Drop"
          eyebrowAr="وصل حديثًا"
          titleEn="New Arrivals"
          titleAr="وصل حديثًا"
          linkLabelEn="View all"
          linkLabelAr="عرض الكل"
        >
          {newArrivals.map((item) => (
            <FeaturedCard
              key={`${item.productId}-${item.variantId}-new`}
              item={item}
              branchId={branchId}
              priority={false}
            />
          ))}
        </ProductCollectionSection>
      )}

      {premiumPicks.length > 0 && (
        <ProductCollectionSection
          id="premium-picks"
          eyebrowEn="Premium Edit"
          eyebrowAr="اختيارات فاخرة"
          titleEn="Luxury"
          titleAr="فاخر"
          linkLabelEn="Browse the edit"
          linkLabelAr="تصفح التشكيلة"
        >
          {premiumPicks.map((item) => (
            <FeaturedCard
              key={`${item.productId}-${item.variantId}-premium`}
              item={item}
              branchId={branchId}
              priority={false}
            />
          ))}
        </ProductCollectionSection>
      )}

      {bestSellers.length > 0 && (
        <ProductCollectionSection
          id="best-sellers"
          eyebrowEn="Best Deals"
          eyebrowAr="أفضل الصفقات"
          titleEn="Deals"
          titleAr="صفقات"
          linkLabelEn="Browse products"
          linkLabelAr="تصفح المنتجات"
        >
          {bestSellers.map((item) => (
            <FeaturedCard
              key={`${item.productId}-${item.variantId}-best`}
              item={item}
              branchId={branchId}
              priority={false}
            />
          ))}
        </ProductCollectionSection>
      )}

      <HomeCTA />
    </>
  )
}
