import { serverApiGet } from '@/lib/api/server'
import { unstable_cache } from 'next/cache'
import type { CatalogItem, Category, ProductPage, ProductSummary } from '@/types'
import { HomeHero } from '@/components/home/HomeHero'
import { TrustBar } from '@/components/home/HomeStatic'
import { HomeBelowFoldEntry } from '@/components/home/HomeBelowFoldEntry'
import { HomeVitals } from '@/components/home/HomeVitals'

export const revalidate = 300

const DEFAULT_BRANCH = Number(process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID ?? '1')
const PRODUCT_PREVIEW_LIMIT = 12

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
 * Fetch candidate branches in parallel and return as soon as the first
 * non-empty branch succeeds. This avoids waiting for slower branches.
 */
async function getCatalogFallback(candidateBranches: number[]) {
  const [primaryBranch, ...fallbackBranches] = candidateBranches

  if (primaryBranch) {
    try {
      const primaryItems = await serverApiGet<CatalogItem[]>(
        `/api/branchinventory/public/branch/${primaryBranch}/catalog`
      )

      if (Array.isArray(primaryItems) && primaryItems.length > 0) {
        return { items: primaryItems, branchId: primaryBranch }
      }
    } catch {
      // Fall through to secondary branches.
    }
  }

  if (fallbackBranches.length === 0) {
    return { items: [] as CatalogItem[], branchId: primaryBranch ?? DEFAULT_BRANCH }
  }

  try {
    return await Promise.any(
      fallbackBranches.map(async (branchId) => {
        const items = await serverApiGet<CatalogItem[]>(
          `/api/branchinventory/public/branch/${branchId}/catalog`
        )

        if (!Array.isArray(items) || items.length === 0) {
          throw new Error('empty')
        }

        return { items, branchId }
      })
    )
  } catch {
    return { items: [] as CatalogItem[], branchId: DEFAULT_BRANCH }
  }
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

const getCachedHomeData = unstable_cache(getHomeData, ['home-page-data'], {
  revalidate,
})

export default async function HomePage() {
  const { categories, offers, newArrivals, bestSellers, premiumPicks, branchId } = await getCachedHomeData()
  const heroProducts = bestSellers.length > 0
    ? bestSellers
    : premiumPicks.length > 0
      ? premiumPicks
      : newArrivals.length > 0
        ? newArrivals
        : offers

  return (
    <main className="min-h-screen bg-[#F8F6F2]">
      <HomeVitals />

      <HomeHero
        branchId={branchId}
        heroProducts={heroProducts}
      />

      <TrustBar />

      <HomeBelowFoldEntry
        categories={categories}
        offers={offers}
        newArrivals={newArrivals}
        bestSellers={bestSellers}
        premiumPicks={premiumPicks}
        branchId={branchId}
      />
    </main>
  )
}
