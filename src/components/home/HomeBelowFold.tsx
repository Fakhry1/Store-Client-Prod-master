import type { CatalogItem, Category } from '@/types'
import { HomeCTA, CategoriesSection, OffersHeader, ProductCollectionSection } from '@/components/home/HomeStatic'
import { OfferCard, FeaturedCard } from '@/components/home/HomeCards'

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
        <section id="offers" className="bg-[#0F0F0F] py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <OffersHeader count={offers.length} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {offers.map((item) => (
                <OfferCard
                  key={`${item.productId}-${item.variantId}`}
                  item={item}
                  branchId={branchId}
                  priority={false}
                />
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

      {bestSellers.length > 0 && (
        <ProductCollectionSection
          id="best-sellers"
          eyebrowEn="Top Picks"
          eyebrowAr="الأكثر طلبًا"
          titleEn="Best Sellers"
          titleAr="الأكثر طلبًا"
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

      {premiumPicks.length > 0 && (
        <ProductCollectionSection
          id="premium-picks"
          eyebrowEn="Premium Edit"
          eyebrowAr="اختيارات فاخرة"
          titleEn="Premium Picks"
          titleAr="اختيارات فاخرة"
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

      <HomeCTA />
    </>
  )
}