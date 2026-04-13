import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import ProductPageClient from '@/components/product/ProductPageClient'
import { serverApiGet } from '@/lib/api/server'
import { getSiteUrl, STORE_NAME } from '@/lib/store'
import type { Product } from '@/types'

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

export async function generateMetadata({
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const params = await searchParams
  const productId = parsePositiveInt(params.id)

  if (!productId) {
    return {
      title: `${STORE_NAME} - Product`,
      description: `Browse premium products from ${STORE_NAME}.`,
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
    }
  }
}

export default async function ProductPage({ searchParams }: ProductPageProps) {
  const params = await searchParams
  const productId = parsePositiveInt(params.id)
  const initialVariantId = parsePositiveInt(params.variant)
  const branchId = parsePositiveInt(params.branch) ?? Number(process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID ?? '1')

  let initialProduct: Product | null = null

  if (productId) {
    initialProduct = await getCachedProduct(productId).catch(() => null)
  }

  const initialProductImages =
    initialProduct?.images
      ?.slice()
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder)
      .map((image) => image.imagePath) ?? []

  return (
    <ProductPageClient
      initialProduct={initialProduct}
      initialProductImages={initialProductImages}
      initialVariantId={initialVariantId}
      branchId={branchId}
    />
  )
}