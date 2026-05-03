import type { CatalogItem } from '@/types'
import type { HomeHeroSlide } from '@/components/home/PremiumHeroSlider'
import { HomeHeroClient } from '@/components/home/HomeHeroClient'

interface Props {
  branchId: number
  heroProducts: CatalogItem[]
}

function toOptionalDiscount(item: CatalogItem) {
  if (typeof item.discountPercentage === 'number' && item.discountPercentage > 0) {
    return Math.round(item.discountPercentage)
  }

  if (item.hasActiveOffer && item.basePrice > item.currentPrice && item.basePrice > 0) {
    return Math.round(((item.basePrice - item.currentPrice) / item.basePrice) * 100)
  }

  return undefined
}

function getBadge(index: number, item: CatalogItem): HomeHeroSlide['badge'] {
  if (item.hasActiveOffer) {
    return 'limited-offer'
  }

  if (index === 1) {
    return 'new-arrival'
  }

  return 'best-seller'
}

function buildSlides(products: CatalogItem[], branchId: number): HomeHeroSlide[] {
  return products
    .filter((item) => item.quantityInStock > 0)
    .slice(0, 5)
    .map((item, index) => ({
      id: `${item.productId}-${item.variantId || 'base'}`,
      href: `/product?id=${item.productId}&variant=${item.variantId}&branch=${branchId}`,
      titleEn: item.productNameEn,
      titleAr: item.productNameAr,
      brand: item.brand,
      categoryNameEn: item.categoryNameEn,
      categoryNameAr: item.categoryNameAr,
      imagePath: item.imagePath,
      currentPrice: item.currentPrice,
      basePrice: item.basePrice,
      hasActiveOffer: item.hasActiveOffer,
      discountPercentage: toOptionalDiscount(item),
      badge: getBadge(index, item),
      offerEndsAt: item.offerEndsAt,
    }))
}

export function HomeHero({ branchId, heroProducts }: Props) {
  return (
    <div style={{ minHeight: '560px', contain: 'layout style' }}>
      <HomeHeroClient slides={buildSlides(heroProducts, branchId)} />
    </div>
  )
}
