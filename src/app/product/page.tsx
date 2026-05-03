import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import ProductPageClient from '@/components/product/ProductPageClient'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { serverApiGet } from '@/lib/api/server'
import { getSiteUrl, STORE_NAME } from '@/lib/store'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'
import type { Product, ProductPage, ProductSummary } from '@/types'

export const revalidate = 600

type ProductPageSearchParams = Promise<Record<string, string | undefined>>

interface ProductPageProps {
  searchParams: ProductPageSearchParams
}

function parsePositiveInt(value?: string): number | undefined {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

function getCachedProduct(productId: number) {
  return unstable_cache(
    () => serverApiGet<Product>(`/api/product/${productId}`),
    [`product-page-product-${productId}`],
    { revalidate: 600 }
  )()
}

function getCachedRelatedProducts(categoryId: number, branchId: number) {
  return unstable_cache(
    () =>
      serverApiGet<ProductPage>(
        `/api/product?${new URLSearchParams({
          categoryId: String(categoryId),
          branchId: String(branchId),
          page: '1',
          limit: '7',
          sort: 'newest',
        }).toString()}`
      ),
    [`product-page-related-${categoryId}-${branchId}`],
    { revalidate: 600 }
  )()
}

export async function generateMetadata({
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const params = await searchParams
  const productId = parsePositiveInt(params.id)

  const siteUrl = getSiteUrl()

  if (!productId) {
    return {
      title: `${STORE_NAME} - Product`,
      description: `Browse premium products from ${STORE_NAME}.`,
      alternates: { canonical: new URL('/shop', siteUrl).toString() },
    }
  }

  try {
    const product = await getCachedProduct(productId)
    const title = `${product.nameAr || product.nameEn} | ${STORE_NAME}`
    const description =
      product.descriptionAr ||
      product.description ||
      `اكتشف تفاصيل ${product.nameAr || product.nameEn} في ${STORE_NAME}.`
    const canonicalUrl = new URL(`/product?id=${productId}`, getSiteUrl()).toString()

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: 'website',
      },
    }
  } catch {
    return {
      title: `${STORE_NAME} - Product`,
      description: `Browse premium products from ${STORE_NAME}.`,
      alternates: { canonical: new URL(`/product?id=${productId}`, siteUrl).toString() },
    }
  }
}

export default async function ProductPage({ searchParams }: ProductPageProps) {
  const params = await searchParams
  const productId = parsePositiveInt(params.id)
  const initialVariantId = parsePositiveInt(params.variant)
  const branchId = parsePositiveInt(params.branch) ?? Number(process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID ?? '1')

  let initialProduct: Product | null = null
  let initialRelatedProducts: ProductSummary[] = []

  if (productId) {
    initialProduct = await getCachedProduct(productId).catch(() => null)

    if (initialProduct?.categoryId) {
      initialRelatedProducts = await getCachedRelatedProducts(initialProduct.categoryId, branchId)
        .then((page) => (page.items ?? []).filter((item) => item.id !== productId).slice(0, 6))
        .catch(() => [] as ProductSummary[])
    }
  }

  const initialProductImages =
    initialProduct?.images
      ?.slice()
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder)
      .map((image) => image.imagePath) ?? []

  const firstProductImage = initialProductImages[0]
    ? joinUrl(getPublicApiBaseUrl(), initialProductImages[0])
    : null

  return (
    <>
      {firstProductImage && (
        // eslint-disable-next-line @next/next/no-head-element
        <link rel="preload" as="image" href={firstProductImage} fetchPriority="high" />
      )}
      <ProductPageClient
        initialProduct={initialProduct}
        initialProductImages={initialProductImages}
        initialVariantId={initialVariantId}
        branchId={branchId}
      />
      {initialProduct && initialRelatedProducts.length > 0 && (
        <RelatedProducts
          items={initialRelatedProducts}
          categoryId={initialProduct.categoryId}
          branchId={branchId}
        />
      )}
    </>
  )
}
