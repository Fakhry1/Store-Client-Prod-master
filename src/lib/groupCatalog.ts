import type { CatalogItem } from '@/types'

export interface ProductGroup {
  productId:      number
  productNameEn:  string
  productNameAr:  string
  brand?:         string
  imagePath?:     string
  categoryId:     number
  variants:       CatalogItem[]
  minPrice:       number
  maxPrice:       number
  hasActiveOffer: boolean
  maxDiscount:    number
  totalStock:     number
}

export function groupCatalogItems(items: CatalogItem[]): ProductGroup[] {
  const map = new Map<number, ProductGroup>()
  items.forEach(item => {
    if (!map.has(item.productId)) {
      map.set(item.productId, {
        productId:      item.productId,
        productNameEn:  item.productNameEn,
        productNameAr:  item.productNameAr,
        brand:          item.brand,
        imagePath:      item.imagePath,
        categoryId:     item.categoryId,
        variants:       [],
        minPrice:       Infinity,
        maxPrice:       0,
        hasActiveOffer: false,
        maxDiscount:    0,
        totalStock:     0,
      })
    }
    const g = map.get(item.productId)!
    g.variants.push(item)
    g.minPrice       = Math.min(g.minPrice, item.currentPrice)
    g.maxPrice       = Math.max(g.maxPrice, item.currentPrice)
    g.hasActiveOffer = g.hasActiveOffer || item.hasActiveOffer
    g.maxDiscount    = Math.max(g.maxDiscount, item.discountPercentage ?? 0)
    g.totalStock    += item.quantityInStock
  })
  return Array.from(map.values())
}

import type { ProductSummary } from '@/types'

/**
 * يحوّل ProductSummary (من API الجديد) إلى ProductGroup
 *
 * ⚠️  BUG FIX: النسخة السابقة كانت تُعيد variants: [] مما يُسبب
 * crash في GroupedProductCard عند الوصول لـ firstVariant.imagePath
 *
 * الحل: نصنع variant وهمياً يحمل البيانات الأساسية حتى يعمل الكارد بشكل صحيح
 */
export function summaryToGroup(p: ProductSummary, branchId: number): ProductGroup {
  // نصنع CatalogItem وهمياً من بيانات الـ ProductSummary
  // هذا يمنع الـ crash ويسمح للكارد بعرض الصورة والسعر بشكل صحيح
  const dummyVariant: CatalogItem = {
    productId:          p.id,
    productNameEn:      p.nameEn,
    productNameAr:      p.nameAr,
    brand:              p.brandNameEn ?? p.brand,
    imagePath:          p.imagePath,
    categoryId:         p.categoryId,
    categoryNameEn:     p.categoryNameEn,
    variantId:          0,           // placeholder — سيُستبدل عند الدخول للتفاصيل
    variantNameEn:      '',
    variantNameAr:      '',
    sku:                '',
    variantAttributes:  {},
    basePrice:          p.minPrice,
    currentPrice:       p.minCurrentPrice,
    hasActiveOffer:     p.hasActiveOffer,
    discountPercentage: undefined,
    offerEndsAt:        undefined,
    quantityInStock:    p.variantCount > 0 ? 1 : 0,
    isLowStock:         false,
  }

  return {
    productId:      p.id,
    productNameEn:  p.nameEn,
    productNameAr:  p.nameAr,
    brand:          p.brandNameEn ?? p.brand,
    imagePath:      p.imagePath,
    categoryId:     p.categoryId,
    variants:       [dummyVariant],
    minPrice:       p.minCurrentPrice,
    maxPrice:       p.minCurrentPrice,
    hasActiveOffer: p.hasActiveOffer,
    maxDiscount:    0,
    totalStock:     p.variantCount > 0 ? 1 : 0,
  }
}