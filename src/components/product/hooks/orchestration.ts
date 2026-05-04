import { useCallback, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { catalogApi, wishlistApi } from '@/lib/api'
import type { BranchProductAvailabilityItem, Product, ProductVariant, VariantAttribute } from '@/types'

type VariantSelectionState = Record<number, string>

type VariantHelpers = {
  getVariantAttrs: (variant: ProductVariant) => VariantAttribute[]
  variantMatchesSel: (variant: ProductVariant, selection: VariantSelectionState) => boolean
  buildSelectionFromVariant: (variant: ProductVariant) => VariantSelectionState
}

type AvailabilitySyncParams = {
  branchId: number
  product: Product | null
  selected: ProductVariant | null
  setProduct: Dispatch<SetStateAction<Product | null>>
  setSelected: Dispatch<SetStateAction<ProductVariant | null>>
}

export function useAvailabilitySync({
  branchId,
  product,
  selected,
  setProduct,
  setSelected,
}: AvailabilitySyncParams) {
  useEffect(() => {
    if (!product?.id) return

    let cancelled = false

    const syncAvailability = async () => {
      const availabilityItems = await catalogApi.getProductAvailability(branchId, product.id).catch(() => [])
      if (cancelled || !Array.isArray(availabilityItems) || availabilityItems.length === 0) return

      const availabilityByVariantId = new Map(
        (availabilityItems as BranchProductAvailabilityItem[]).map((item) => [Number(item.variantId), item] as const)
      )

      setProduct((currentProduct) => {
        if (!currentProduct || currentProduct.id !== product.id) return currentProduct

        return {
          ...currentProduct,
          variants: currentProduct.variants.map((variant) => {
            const availability = availabilityByVariantId.get(variant.id)
            if (!availability) return variant

            const rawStock = availability.isAvailable ? Number(availability.quantityInStock) : 0
            const nextStock = Number.isFinite(rawStock) ? Math.max(0, rawStock) : 0

            return {
              ...variant,
              quantityInStock: nextStock,
            }
          }),
        }
      })

      setSelected((currentSelected) => {
        if (!currentSelected) return currentSelected

        const availability = availabilityByVariantId.get(currentSelected.id)
        if (!availability) return currentSelected

        const rawStock = availability.isAvailable ? Number(availability.quantityInStock) : 0
        const nextStock = Number.isFinite(rawStock) ? Math.max(0, rawStock) : 0

        return {
          ...currentSelected,
          quantityInStock: nextStock,
        }
      })
    }

    const hasIdleCallback = typeof window !== 'undefined' && 'requestIdleCallback' in window
    const handle = hasIdleCallback
      ? window.requestIdleCallback(() => void syncAvailability())
      : window.setTimeout(() => void syncAvailability(), 250)

    return () => {
      cancelled = true
      if (hasIdleCallback && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(handle as number)
      } else {
        window.clearTimeout(handle)
      }
    }
  }, [branchId, product?.id, setProduct, setSelected])
}

type WishlistParams = {
  token: string | null
  productId: number
  selectedVariantId?: number
  branchId: number
  wishlisted: boolean
  setWishlisted: Dispatch<SetStateAction<boolean>>
  setWishlistLoading: Dispatch<SetStateAction<boolean>>
  onRequireLogin: (redirect: string) => void
}

export function useWishlistOrchestration({
  token,
  productId,
  selectedVariantId,
  branchId,
  wishlisted,
  setWishlisted,
  setWishlistLoading,
  onRequireLogin,
}: WishlistParams) {
  return useCallback(async () => {
    if (!token) {
      const redirectParams = new URLSearchParams({
        id: String(productId),
        variant: String(selectedVariantId ?? ''),
        branch: String(branchId),
      })
      onRequireLogin(`/product?${redirectParams.toString()}`)
      return
    }

    if (!selectedVariantId) return

    const previous = wishlisted
    setWishlisted(!previous)
    setWishlistLoading(true)
    try {
      if (previous) {
        await wishlistApi.remove(token, selectedVariantId)
      } else {
        await wishlistApi.add(token, productId, selectedVariantId)
      }
    } catch {
      setWishlisted(previous)
    } finally {
      setWishlistLoading(false)
    }
  }, [
    token,
    productId,
    selectedVariantId,
    branchId,
    onRequireLogin,
    wishlisted,
    setWishlisted,
    setWishlistLoading,
  ])
}

type VariantSelectionParams = {
  activeVariants: ProductVariant[]
  helpers: VariantHelpers
  setSel: Dispatch<SetStateAction<VariantSelectionState>>
}

export function useVariantSelection({ activeVariants, helpers, setSel }: VariantSelectionParams) {
  return useCallback((attrId: number, valueEn: string) => {
    setSel((previousSelection) => {
      const nextSelection: VariantSelectionState = { ...previousSelection, [attrId]: valueEn }
      const exactMatch = activeVariants.some(
        (variant) => variant.isActive && helpers.variantMatchesSel(variant, nextSelection)
      )

      if (exactMatch) {
        return nextSelection
      }

      const compatible = activeVariants.find((variant) =>
        variant.isActive &&
        helpers.getVariantAttrs(variant).some(
          (attribute) => attribute.attributeId === attrId && (attribute.valueEn ?? attribute.rawValue) === valueEn
        )
      )

      if (compatible) {
        return helpers.buildSelectionFromVariant(compatible)
      }

      return { [attrId]: valueEn }
    })
  }, [activeVariants, helpers, setSel])
}
