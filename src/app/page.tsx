import { serverApiGet } from '@/lib/api/server'
import type { CatalogItem, Category, ProductPage, ProductSummary } from '@/types'
import { HomeHero } from '@/components/home/HomeHero'
import { TrustBar, CategoriesSection, OffersHeader, ProductCollectionSection, HomeCTA } from '@/components/home/HomeStatic'
import { OfferCard, FeaturedCard } from '@/components/home/HomeCards'

export const revalidate = 300

const DEFAULT_BRANCH = Number(process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID ?? '1')
const PRODUCT_PREVIEW_LIMIT = 24

function summaryToCatalogItem(summary: ProductSummary): CatalogItem {
  return {
    productId: summary.id,
    productNameEn: summary.nameEn,
    productNameAr: summary.nameAr,
    brand: summary.brandNameEn ?? summary.brand,
    imagePath: summary.imagePath,
    categoryId: summary.categoryId,
    categoryNameEn: summary.categoryNameEn,
    categoryNameAr: summary.categoryNameAr,
    variantId: 0,
    variantNameEn: '',
    variantNameAr: '',
    sku: '',
    variantAttributes: {},
    basePrice: summary.minPrice,
    currentPrice: summary.minCurrentPrice,
    hasActiveOffer: summary.hasActiveOffer,
    discountPercentage: undefined,
    offerEndsAt: undefined,
    quantityInStock: summary.variantCount > 0 ? 1 : 0,
    isLowStock: false,
  }
}

function dedupeProducts(items: CatalogItem[]) {
  const seen = new Set<number>()

  return items.filter((item) => {
    if (seen.has(item.productId)) return false
    seen.add(item.productId)
    return true
  })
}

/**
 * Fetches catalog for all candidate branches IN PARALLEL and returns the
 * first one that has results. Previously this was sequential (await inside
 * a for-loop), which caused up to 5 × timeout = 40 s hangs during CI builds
 * when the API is unreachable.
 */
async function getCatalogFallback(candidateBranches: number[]) {
  const results = await Promise.allSettled(
    candidateBranches.map(async (branchId) => {
      const items = await serverApiGet<CatalogItem[]>(
        `/api/branchinventory/public/branch/${branchId}/catalog`
      )
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('empty')
      }
      return { items, branchId }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled') {
      return result.value
    }
  }

  return { items: [] as CatalogItem[], branchId: DEFAULT_BRANCH }
}

async function getHomeData() {
  const candidateBranches = Array.from(new Set([DEFAULT_BRANCH, 1, 2, 3, 4, 5])).filter((id) => id > 0)

  // All three fetches run in parallel. Each has an 8 s timeout (set in serverApiGet).
  // If the API is unreachable during build (CI), every call fails fast and the page
  // builds successfully with empty collections — populated on first revalidate after deploy.
  const [{ items, branchId: resolvedBranchId }, categories, productPage] = await Promise.all([
    getCatalogFallback(candidateBranches),
    serverApiGet<Category[]>('/api/category').catch(() => [] as Category[]),
    serverApiGet<ProductPage>(`/api/product?page=1&limit=${PRODUCT_PREVIEW_LIMIT}&sort=newest`).catch(() => null),
  ])

  const fallbackItems = productPage?.items?.length
    ? productPage.items.map(summaryToCatalogItem)
    : []

  const primaryItems = dedupeProducts(items)
  const fallbackUnique = dedupeProducts(fallbackItems)
  const displayItems = primaryItems.length > 0 ? primaryItems : fallbackUnique
  const offerSource = primaryItems.filter((item) => item.hasActiveOffer).length > 0
    ? primaryItems
    : fallbackUnique
  const inStockSource = displayItems.filter((item) => item.quantityInStock > 0)
  const collectionSource = inStockSource.length > 0 ? inStockSource : displayItems

  const offers = offerSource
    .filter((item) => item.hasActiveOffer && item.quantityInStock > 0)
    .slice(0, 6)
  const newArrivals = (fallbackUnique.length > 0 ? fallbackUnique : collectionSource).slice(0, 4)
  const bestSellers = collectionSource.slice(0, 4)
  const premiumPicks = [...collectionSource]
    .sort((a, b) => b.currentPrice - a.currentPrice)
    .slice(0, 4)

  return {
    categories: Array.isArray(categories) ? categories.filter((category) => !category.parentCategoryId) : [],
    offers,
    newArrivals,
    bestSellers,
    premiumPicks,
    branchId: resolvedBranchId,
  }
}

export default async function HomePage() {
  const { categories, offers, newArrivals, bestSellers, premiumPicks, branchId } = await getHomeData()

  return (
    <main className="min-h-screen bg-[#F8F6F2]">
      <HomeHero
        featuredCount={premiumPicks.length}
        categoriesCount={categories.length}
        hasOffers={offers.length > 0}
      />

      <TrustBar />

      {categories.length > 0 && <CategoriesSection categories={categories} />}

      {offers.length > 0 && (
        <section id="offers" className="bg-[#0F0F0F] py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-6">
            <OffersHeader count={offers.length} />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {offers.map((item, index) => (
                <OfferCard
                  key={`${item.productId}-${item.variantId}`}
                  item={item}
                  branchId={branchId}
                  priority={index < 4}
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
          {newArrivals.map((item, index) => (
            <FeaturedCard
              key={`${item.productId}-${item.variantId}-new`}
              item={item}
              branchId={branchId}
              priority={index < 4}
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
          {bestSellers.map((item, index) => (
            <FeaturedCard
              key={`${item.productId}-${item.variantId}-best`}
              item={item}
              branchId={branchId}
              priority={index < 4}
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
          {premiumPicks.map((item, index) => (
            <FeaturedCard
              key={`${item.productId}-${item.variantId}-premium`}
              item={item}
              branchId={branchId}
              priority={index < 4}
            />
          ))}
        </ProductCollectionSection>
      )}

      <HomeCTA />
    </main>
  )
}
