'use client'

import { useEffect, useState, useMemo, useCallback, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { catalogApi, productApi, wishlistApi } from '@/lib/api'
import { useCart } from '@/context/cart'
import { useAuth } from '@/context/auth'
import { useLocale } from '@/context/locale'
import { formatSavingsLabel, getCurrencyLabel } from '@/lib/store'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'
import type { Product, ProductVariant, VariantAttribute, BranchProductAvailabilityItem } from '@/types'
import { ProductImageGallery } from '@/components/product/ProductImageGallery'
import { AddToCartPanel } from '@/components/product/AddToCartPanel'

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Attribute Helpers Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

/**
 * Ã˜Â§Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â±Ã˜Â§Ã˜Â¬ Ã˜Â§Ã™â€žÃ™â‚¬ attributes Ã˜Â§Ã™â€žÃ™â€¦Ã™ÂÃ™â€ Ã˜Â¸Ã™Å½Ã™â€˜Ã™â€¦Ã˜Â© Ã™â€¦Ã™â€  variant
 * Ã™Å Ã˜Â¯Ã˜Â¹Ã™â€¦ Ã™Æ’Ã™â€žÃ˜Â§ Ã˜Â§Ã™â€žÃ™â€ Ã™Ë†Ã˜Â¹Ã™Å Ã™â€ : attributes[] Ã˜Â§Ã™â€žÃ˜ÂºÃ™â€ Ã™Å  Ã™Ë† variantAttributes{} Ã˜Â§Ã™â€žÃ™â€šÃ˜Â¯Ã™Å Ã™â€¦
 */
function getVariantAttrs(v: ProductVariant): VariantAttribute[] {
  // Ã˜Â§Ã™â€žÃ™â€ Ã™Ë†Ã˜Â¹ Ã˜Â§Ã™â€žÃ˜ÂºÃ™â€ Ã™Å  (Ã™â€¦Ã˜Â¹ colorHex Ã™Ë†Arabic names) Ã¢â‚¬â€ Ã™ÂÃ™â€žÃ˜ÂªÃ˜Â± Ã˜Â£Ã™Å  attribute Ã˜Â¨Ã˜Â¯Ã™Ë†Ã™â€  Ã™â€šÃ™Å Ã™â€¦Ã˜Â©
  if (v.attributes && v.attributes.length > 0) {
    return v.attributes.filter(a => !!(a.valueEn ?? a.rawValue))
  }

  // Fallback: Ã˜Â­Ã™Ë†Ã™â€˜Ã™â€ž variantAttributes{} Ã˜Â§Ã™â€žÃ™â€šÃ˜Â¯Ã™Å Ã™â€¦ Ã™â€žÃ™â€ Ã™ÂÃ˜Â³ Ã˜Â§Ã™â€žÃ™â€¡Ã™Å Ã™Æ’Ã™â€ž
  // Ã™â€ Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â¯Ã™â€¦ hash Ã˜Â«Ã˜Â§Ã˜Â¨Ã˜Âª Ã™â€žÃ™â€žÃ™â‚¬ key Ã˜Â¨Ã˜Â¯Ã™â€žÃ˜Â§Ã™â€¹ Ã™â€¦Ã™â€  index Ã¢â‚¬â€ Ã™Å Ã˜Â¶Ã™â€¦Ã™â€  Ã™â€ Ã™ÂÃ˜Â³ attributeId Ã™â€žÃ™â€ Ã™ÂÃ˜Â³ Ã˜Â§Ã™â€žÃ™â‚¬ key Ã™ÂÃ™Å  Ã™Æ’Ã™â€ž variant
  if (v.variantAttributes) {
    return Object.entries(v.variantAttributes)
      .filter(([, val]) => val !== undefined && val !== '')
      .map(([key, val]): VariantAttribute => ({
        attributeId:     stableAttrId(key),
        attributeNameEn: key.charAt(0).toUpperCase() + key.slice(1),
        attributeNameAr: key,
        optionId:        undefined,
        valueEn:         val as string,
        valueAr:         val as string,
        colorHex:        undefined,
        rawValue:        val as string,
      }))
  }
  return []
}

/** hash Ã˜Â¨Ã˜Â³Ã™Å Ã˜Â· Ã™Ë†Ã˜Â«Ã˜Â§Ã˜Â¨Ã˜Âª Ã™â€žÃ™â€žÃ™â‚¬ string Ã¢â‚¬â€ Ã™Å Ã˜Â¶Ã™â€¦Ã™â€  Ã˜Â£Ã™â€  Ã™Æ’Ã™â€ž attribute key Ã™Å Ã˜Â­Ã˜ÂµÃ™â€ž Ã˜Â¹Ã™â€žÃ™â€° Ã™â€ Ã™ÂÃ˜Â³ Ã˜Â§Ã™â€žÃ™â‚¬ ID Ã˜Â¯Ã˜Â§Ã˜Â¦Ã™â€¦Ã˜Â§Ã™â€¹ */
function stableAttrId(key: string): number {
  let h = 0
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(31, h) + key.charCodeAt(i) | 0
  }
  return Math.abs(h)
}

/**
 * Ã˜Â§Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â±Ã˜Â§Ã˜Â¬ Ã˜Â§Ã™â€žÃ™â‚¬ attribute keys Ã˜Â§Ã™â€žÃ™ÂÃ˜Â±Ã™Å Ã˜Â¯Ã˜Â© Ã™â€¦Ã™â€  Ã˜Â¬Ã™â€¦Ã™Å Ã˜Â¹ Ã˜Â§Ã™â€žÃ™â‚¬ variants
 * Ã™â€¦Ã˜Â±Ã˜ÂªÃ˜Â¨Ã˜Â©: Ã˜Â§Ã™â€žÃ™â€žÃ™Ë†Ã™â€  Ã˜Â£Ã™Ë†Ã™â€žÃ˜Â§Ã™â€¹Ã˜Å’ Ã˜Â«Ã™â€¦ Ã˜Â§Ã™â€žÃ™â€¦Ã™â€šÃ˜Â§Ã˜Â³Ã˜Å’ Ã˜Â«Ã™â€¦ Ã˜Â¨Ã˜Â§Ã™â€šÃ™Å  Ã˜Â§Ã™â€žÃ˜Â®Ã˜ÂµÃ˜Â§Ã˜Â¦Ã˜Âµ
 */
function getAttrKeys(variants: ProductVariant[]): { id: number; nameEn: string; nameAr: string }[] {
  const map = new Map<number, { id: number; nameEn: string; nameAr: string }>()
  variants.forEach(v => {
    getVariantAttrs(v).forEach(a => {
      if (!map.has(a.attributeId)) {
        map.set(a.attributeId, {
          id:     a.attributeId,
          nameEn: a.attributeNameEn,
          nameAr: a.attributeNameAr,
        })
      }
    })
  })
  const all = Array.from(map.values())
  // Ã˜Â§Ã™â€žÃ™â€žÃ™Ë†Ã™â€  Ã˜Â£Ã™Ë†Ã™â€žÃ˜Â§Ã™â€¹
  return all.sort((a, b) => {
    const order = (k: string) =>
      k.toLowerCase().includes('color') || k.toLowerCase().includes('Ã™â€žÃ™Ë†Ã™â€ ') ? 0
      : k.toLowerCase().includes('size') || k.toLowerCase().includes('Ã™â€¦Ã™â€šÃ˜Â§Ã˜Â³') ? 1
      : 2
    return order(a.nameEn) - order(b.nameEn)
  })
}

/**
 * Ã˜Â§Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â±Ã˜Â§Ã˜Â¬ Ã™â€šÃ™Å Ã™â€¦ attribute Ã™â€¦Ã˜Â¹Ã™Å Ã™â€  Ã™â€¦Ã™â€  Ã˜Â¬Ã™â€¦Ã™Å Ã˜Â¹ Ã˜Â§Ã™â€žÃ™â‚¬ variants (Ã™â€¦Ã˜Â¹ Ã˜Â¥Ã˜Â²Ã˜Â§Ã™â€žÃ˜Â© Ã˜Â§Ã™â€žÃ˜ÂªÃ™Æ’Ã˜Â±Ã˜Â§Ã˜Â±)
 */
interface AttrOption {
  optionId?: number
  valueEn: string
  valueAr: string
  colorHex?: string
}

function getAttrOptions(variants: ProductVariant[], attrId: number): AttrOption[] {
  const seen = new Set<string>()
  const opts: AttrOption[] = []
  variants.forEach(v => {
    const a = getVariantAttrs(v).find(x => x.attributeId === attrId)
    if (!a) return
    const key = a.valueEn ?? a.rawValue ?? ''
    if (!key || seen.has(key)) return
    seen.add(key)
    opts.push({
      optionId: a.optionId,
      valueEn:  a.valueEn  ?? a.rawValue ?? key,
      valueAr:  a.valueAr  ?? a.rawValue ?? key,
      colorHex: a.colorHex,
    })
  })
  return opts
}

/**
 * Ã™â€¡Ã™â€ž variant Ã™â€¦Ã˜Â¹Ã˜Â·Ã™â€° Ã™Å Ã˜Â·Ã˜Â§Ã˜Â¨Ã™â€š Ã˜Â§Ã™â€žÃ™â‚¬ selection Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â§Ã™â€žÃ™Å Ã˜Å¸
 * sel: { attrId Ã¢â€ â€™ valueEn }
 */
function variantMatchesSel(v: ProductVariant, sel: Record<number, string>): boolean {
  const attrs = getVariantAttrs(v)
  return Object.entries(sel).every(([idStr, val]) => {
    const a = attrs.find(x => x.attributeId === Number(idStr))
    return (a?.valueEn ?? a?.rawValue) === val
  })
}

/**
 * Ã™â€¡Ã™â€ž Ã™â€šÃ™Å Ã™â€¦Ã˜Â© Ã™â€¦Ã˜Â¹Ã™Å Ã™â€ Ã˜Â© Ã™â€¦Ã™Ë†Ã˜Â¬Ã™Ë†Ã˜Â¯Ã˜Â© (variant exists) Ã™â€¦Ã˜Â¹ Ã˜Â§Ã™â€žÃ™â‚¬ selection Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â§Ã™â€žÃ™Å Ã˜Å¸
 * Ã™â€ Ã™ÂÃ˜ÂµÃ™â€ž Ã˜Â¨Ã™Å Ã™â€  "Ã™â€¦Ã™Ë†Ã˜Â¬Ã™Ë†Ã˜Â¯" Ã™Ë†"Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â®Ã˜Â²Ã™Ë†Ã™â€ " Ã¢â‚¬â€ Ã™â€ Ã˜Â³Ã™â€¦Ã˜Â­ Ã˜Â¨Ã˜Â§Ã˜Â®Ã˜ÂªÃ™Å Ã˜Â§Ã˜Â± out-of-stock Ã™â€žÃ™Æ’Ã™â€  Ã™â€ Ã™ÂÃ˜Â¹Ã™â€žÃ™â€¦ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â¯Ã™â€¦
 */
/**
 * Ã™â€¡Ã™â€ž Ã™â€šÃ™Å Ã™â€¦Ã˜Â© Ã™â€¦Ã˜Â¹Ã™Å Ã™â€ Ã˜Â© Ã™â€šÃ˜Â§Ã˜Â¨Ã™â€žÃ˜Â© Ã™â€žÃ™â€žÃ˜Â§Ã˜Â®Ã˜ÂªÃ™Å Ã˜Â§Ã˜Â±Ã˜Å¸
 * Ã˜Â§Ã™â€žÃ™â€¦Ã™â€ Ã˜Â·Ã™â€š: Ã™â€¡Ã™â€ž Ã™Å Ã™Ë†Ã˜Â¬Ã˜Â¯ variant Ã™â€ Ã˜Â´Ã˜Â· Ã™Å Ã˜Â­Ã˜ÂªÃ™Ë†Ã™Å  Ã™â€¡Ã˜Â°Ã™â€¡ Ã˜Â§Ã™â€žÃ™â€šÃ™Å Ã™â€¦Ã˜Â©Ã˜Å¸
 * Ã™â€žÃ˜Â§ Ã™â€ Ã™ÂÃ™â€šÃ™Å Ã™â€˜Ã˜Â¯ Ã˜Â¨Ã˜Â§Ã™â€žÃ™â‚¬ selections Ã˜Â§Ã™â€žÃ˜Â£Ã˜Â®Ã˜Â±Ã™â€° Ã¢â‚¬â€ Ã™â€žÃ˜Â£Ã™â€  Ã˜Â§Ã˜Â®Ã˜ÂªÃ™Å Ã˜Â§Ã˜Â± Ã™â€žÃ™Ë†Ã™â€  Ã˜Â¬Ã˜Â¯Ã™Å Ã˜Â¯ Ã™â€šÃ˜Â¯ Ã™Å Ã™ÂÃ˜ÂºÃ™Å Ã™â€˜Ã˜Â± Ã˜Â§Ã™â€žÃ™â€¦Ã™â€šÃ˜Â§Ã˜Â³ Ã˜Â§Ã™â€žÃ™â€¦Ã˜ÂªÃ˜Â§Ã˜Â­
 */
function isOptionAvailable(
  variants: ProductVariant[],
  attrId: number,
  valueEn: string,
  _currentSel: Record<number, string>  // Ã˜ÂºÃ™Å Ã˜Â± Ã™â€¦Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â¯Ã™â€¦ Ã™â€¦Ã™â€šÃ˜ÂµÃ™Ë†Ã˜Â¯ Ã¢â‚¬â€ Ã˜Â§Ã™â€žÃ˜Â§Ã˜Â®Ã˜ÂªÃ™Å Ã˜Â§Ã˜Â± Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â±
): boolean {
  return variants.some(v =>
    v.isActive &&
    getVariantAttrs(v).some(a => a.attributeId === attrId && (a.valueEn ?? a.rawValue) === valueEn)
  )
}

/** Ã™â€¡Ã™â€ž Ã˜Â§Ã™â€žÃ™â‚¬ variant Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â·Ã˜Â§Ã˜Â¨Ã™â€š Ã™â€žÃ™â€žÃ™â‚¬ selection Ã˜Â§Ã™â€žÃ™Æ’Ã˜Â§Ã™â€¦Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â§Ã™â€žÃ™Å  Ã™ÂÃ™Å  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â®Ã˜Â²Ã™Ë†Ã™â€ Ã˜Å¸ */
function isOptionInStock(
  variants: ProductVariant[],
  attrId: number,
  valueEn: string,
  currentSel: Record<number, string>
): boolean {
  const testSel = { ...currentSel, [attrId]: valueEn }
  return variants.some(v =>
    v.isActive &&
    (v.quantityInStock ?? 1) > 0 &&
    variantMatchesSel(v, testSel)
  )
}

/**
 * Ã˜Â§Ã™â€žÃ˜Â¨Ã˜Â­Ã˜Â« Ã˜Â¹Ã™â€  variant Ã™Å Ã˜Â·Ã˜Â§Ã˜Â¨Ã™â€š Ã˜Â§Ã™â€žÃ™â‚¬ selection (Ã˜Â£Ã™Ë† Ã˜Â£Ã™â€šÃ˜Â±Ã˜Â¨ Ã˜ÂªÃ˜Â·Ã˜Â§Ã˜Â¨Ã™â€š Ã˜Â¬Ã˜Â²Ã˜Â¦Ã™Å )
 */
function findMatchingVariant(
  variants: ProductVariant[],
  sel: Record<number, string>
): ProductVariant | null {
  if (!Object.keys(sel).length) return null
  const exact = variants.find(v => v.isActive && variantMatchesSel(v, sel))
  if (exact) return exact
  let best: ProductVariant | null = null
  let bestScore = -1
  variants.filter(v => v.isActive).forEach(v => {
    const score = Object.entries(sel).filter(([id, val]) => {
      const a = getVariantAttrs(v).find(x => x.attributeId === Number(id))
      return (a?.valueEn ?? a?.rawValue) === val
    }).length
    if (score > bestScore) { bestScore = score; best = v }
  })
  return best
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Initial Selection from variant Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function buildSelectionFromVariant(v: ProductVariant): Record<number, string> {
  const attrs = getVariantAttrs(v)
  const result: Record<number, string> = {}
  attrs.forEach(a => {
    const val = a.valueEn ?? a.rawValue
    if (val) result[a.attributeId] = val
  })
  return result
}

const API_BASE_URL = getPublicApiBaseUrl()

function buildStoreImageUrl(path?: string | null): string | null {
  return joinUrl(API_BASE_URL, path)
}

type ProductPageClientProps = {
  initialProduct: Product | null
  initialProductImages: string[]
  initialVariantId?: number
  branchId: number
}

function resolveInitialVariant(product: Product, variantId?: number): ProductVariant | null {
  if (variantId) {
    return (
      product.variants.find((variant) => variant.id === variantId) ??
      product.variants.find((variant) => variant.isActive) ??
      null
    )
  }

  return product.variants.find((variant) => variant.isActive) ?? null
}

function getInitialActiveImageIndex(
  product: Product,
  productImages: string[],
  variant: ProductVariant | null
): number {
  if (!variant?.imagePath) {
    return 0
  }

  if (productImages.length > 0) {
    const imageIndex = productImages.indexOf(variant.imagePath)
    return imageIndex >= 0 ? imageIndex : 0
  }

  const legacyImages = [product.imagePath, ...product.variants.map((item) => item.imagePath)].filter(
    (value): value is string => Boolean(value)
  )
  const imageIndex = legacyImages.indexOf(variant.imagePath)

  return imageIndex > 0 ? imageIndex - 1 : 0
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Page Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function ProductPageInner({
  initialProduct,
  initialProductImages,
  initialVariantId,
  branchId: initialBranchId,
}: ProductPageClientProps) {
  const sp = useSearchParams()
  const router = useRouter()
  const { cart }               = useCart()
  const { token }             = useAuth()
  const { locale, t, isRTL } = useLocale()

  const productId = Number(sp.get('id'))
  const variantId = Number(sp.get('variant'))
  const branchId  = Number(sp.get('branch') || initialBranchId || process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID || '1')
  const preloadedVariantId = variantId || initialVariantId
  const preloadedVariant = initialProduct ? resolveInitialVariant(initialProduct, preloadedVariantId) : null

  const [product,       setProduct]       = useState<Product | null>(initialProduct)
  const [selected,      setSelected]      = useState<ProductVariant | null>(preloadedVariant)
  const [sel,           setSel]           = useState<Record<number, string>>(
    preloadedVariant ? buildSelectionFromVariant(preloadedVariant) : {}
  )
  const [loading,       setLoading]       = useState(!initialProduct)
  const [activeImg,     setActiveImg]     = useState(
    initialProduct ? getInitialActiveImageIndex(initialProduct, initialProductImages, preloadedVariant) : 0
  )
  const [productImages, setProductImages] = useState<string[]>(initialProductImages)
  const [wishlisted,    setWishlisted]    = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const productCacheRef = useRef<Map<number, Product>>(initialProduct ? new Map([[initialProduct.id, initialProduct]]) : new Map())
  const productReqIdRef = useRef(0)
  const branchAvailabilityReqIdRef = useRef(0)

  const activeVariants = useMemo(() => product?.variants.filter(v => v.isActive) ?? [], [product])
  const attrKeys       = useMemo(() => getAttrKeys(activeVariants), [activeVariants])
  const hasAttrs       = attrKeys.length > 0

  // Ã˜Â¬Ã™â€¦Ã˜Â¹ Ã˜Â¬Ã™â€¦Ã™Å Ã˜Â¹ Ã˜Â§Ã™â€žÃ˜ÂµÃ™Ë†Ã˜Â± Ã¢â‚¬â€ Ã™Å Ã™ÂÃ™ÂÃ˜Â¶Ã™â€˜Ã™â€ž API Ã˜Â§Ã™â€žÃ˜ÂµÃ™Ë†Ã˜Â± Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â¯Ã™Å Ã˜Â¯Ã˜Å’ Ã™Ë†Ã™Å Ã˜Â±Ã˜Â¬Ã˜Â¹ Ã™â€žÃ™â€žÃ˜Â·Ã˜Â±Ã™Å Ã™â€šÃ˜Â© Ã˜Â§Ã™â€žÃ™â€šÃ˜Â¯Ã™Å Ã™â€¦Ã˜Â© Ã™Æ’Ã™â‚¬ fallback
  const allImages = useMemo(() => {
    if (productImages.length > 0) return productImages
    if (!product) return []
    const seen = new Set<string>()
    const imgs: string[] = []
    if (product.imagePath) { seen.add(product.imagePath); imgs.push(product.imagePath) }
    activeVariants.forEach(v => {
      if (v.imagePath && !seen.has(v.imagePath)) { seen.add(v.imagePath); imgs.push(v.imagePath) }
    })
    return imgs
  }, [product, activeVariants, productImages])

  // Ã˜ÂªÃ˜Â­Ã™â€¦Ã™Å Ã™â€ž Ã˜Â§Ã™â€žÃ™â€¦Ã™â€ Ã˜ÂªÃ˜Â¬
  useEffect(() => {
    if (!productId) { router.push('/shop'); return }
    if (initialProduct && initialProduct.id === productId) {
      const hydratedImages =
        initialProductImages.length > 0
          ? initialProductImages
          : initialProduct.images
              ?.slice()
              .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder)
              .map((image) => image.imagePath) ?? []
      const hydratedVariant = resolveInitialVariant(initialProduct, preloadedVariantId)

      setProduct(initialProduct)
      setProductImages(hydratedImages)
      setSelected(hydratedVariant)
      setSel(hydratedVariant ? buildSelectionFromVariant(hydratedVariant) : {})
      setActiveImg(getInitialActiveImageIndex(initialProduct, hydratedImages, hydratedVariant))
      setLoading(false)
      return
    }
    const cachedProduct = productCacheRef.current.get(productId)
    if (cachedProduct) {
      const hydratedImages =
        cachedProduct.images
          ?.slice()
          .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder)
          .map((image) => image.imagePath) ?? []
      const initial =
        variantId
          ? (cachedProduct.variants.find(v => v.id === variantId) ?? cachedProduct.variants.find(v => v.isActive))
          : cachedProduct.variants.find(v => v.isActive)

      setProduct(cachedProduct)
      setProductImages(hydratedImages)
      setSelected(initial ?? null)
      setSel(initial ? buildSelectionFromVariant(initial) : {})
      setActiveImg(getInitialActiveImageIndex(cachedProduct, hydratedImages, initial ?? null))
      setLoading(false)
      return
    }

    const reqId = ++productReqIdRef.current
    setLoading(true)
    productApi.getById(productId)
      .then((p) => {
        if (reqId !== productReqIdRef.current) return
        productCacheRef.current.set(productId, p)
        setProduct(p)
        // Ã˜Â§Ã˜Â³Ã˜ÂªÃ˜Â®Ã˜Â¯Ã™â€¦ Ã˜ÂµÃ™Ë†Ã˜Â± API Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â¯Ã™Å Ã˜Â¯Ã˜Â© Ã˜Â¥Ã™â€  Ã™Ë†Ã™ÂÃ˜Â¬Ã˜Â¯Ã˜Âª Ã¢â‚¬â€ Primary Ã˜Â£Ã™Ë†Ã™â€žÃ˜Â§Ã™â€¹ Ã˜Â«Ã™â€¦ sortOrder
        const hydratedImages =
          p.images
            ?.slice()
            .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder)
            .map((image) => image.imagePath) ?? []
        setProductImages(hydratedImages)
        const initial = variantId
          ? (p.variants.find(v => v.id === variantId) ?? p.variants.find(v => v.isActive))
          : p.variants.find(v => v.isActive)
        if (initial) {
          setSelected(initial)
          setSel(buildSelectionFromVariant(initial))
          // Ã˜Â­Ã˜Â¯Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜ÂµÃ™Ë†Ã˜Â±Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â£Ã™Ë†Ã™â€žÃ™â€° Ã™â€žÃ™â€žÃ™â‚¬ variant Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¨Ã˜Â¯Ã˜Â¦Ã™Å 
          setActiveImg(getInitialActiveImageIndex(p, hydratedImages, initial))
        }
      })
      .catch(() => {
        if (reqId === productReqIdRef.current) router.push('/shop')
      })
      .finally(() => {
        if (reqId === productReqIdRef.current) setLoading(false)
      })
  }, [productId, variantId, router, initialProduct, initialProductImages, preloadedVariantId, token, branchId])

  // Keep wishlist + branch availability in sync for all entry paths
  // (SSR initial product, cached product, and fresh fetch).
  useEffect(() => {
    if (!product?.id) return

    const reqId = ++branchAvailabilityReqIdRef.current
    let cancelled = false
    const syncAvailabilityAndWishlist = () => {
      Promise.all([
        token && selected?.id
          ? wishlistApi.check(token, selected.id).catch(() => ({ isWishlisted: false }))
          : Promise.resolve({ isWishlisted: false }),
        branchId
          ? catalogApi.getProductAvailability(branchId, product.id).catch(() => [])
          : Promise.resolve([]),
      ])
        .then(([wishlistResult, availabilityItems]) => {
          if (cancelled || reqId !== branchAvailabilityReqIdRef.current) return

          if (wishlistResult?.isWishlisted !== undefined) {
            setWishlisted(wishlistResult.isWishlisted)
          }

          if (!Array.isArray(availabilityItems) || availabilityItems.length === 0) return

          const availabilityByVariantId = new Map(
            (availabilityItems as BranchProductAvailabilityItem[]).map((item) => [Number(item.variantId), item] as const)
          )

          setProduct((currentProduct) => {
            if (!currentProduct || currentProduct.id !== product.id) return currentProduct

            const nextVariants = currentProduct.variants.map((variant) => {
              const availability = availabilityByVariantId.get(variant.id)
              if (!availability) return variant

              const rawStock = availability.isAvailable ? Number(availability.quantityInStock) : 0
              const nextStock = Number.isFinite(rawStock) ? Math.max(0, rawStock) : 0

              return {
                ...variant,
                quantityInStock: nextStock,
              }
            })

            return {
              ...currentProduct,
              variants: nextVariants,
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
        })
        .catch(() => {})
    }

    const hasIdleCallback = typeof window !== 'undefined' && 'requestIdleCallback' in window
    const handle = hasIdleCallback
      ? window.requestIdleCallback(syncAvailabilityAndWishlist)
      : window.setTimeout(syncAvailabilityAndWishlist, 250)

    return () => {
      cancelled = true
      if (hasIdleCallback && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(handle as number)
      } else {
        window.clearTimeout(handle)
      }
      if (reqId === branchAvailabilityReqIdRef.current) {
        branchAvailabilityReqIdRef.current += 1
      }
    }
  }, [branchId, product?.id, selected?.id, token])

  const handleWishlist = useCallback(async () => {
    if (!token) {
      const redirectParams = new URLSearchParams({
        id: String(productId),
        variant: String(selected?.id ?? ''),
        branch: String(branchId),
      })
      router.push(`/auth/login?redirect=${encodeURIComponent(`/product?${redirectParams.toString()}`)}`)
      return
    }
    if (!selected) return

    // Optimistic update — flip immediately, revert on failure
    const prev = wishlisted
    setWishlisted(!prev)
    setWishlistLoading(true)
    try {
      if (prev) {
        await wishlistApi.remove(token, selected.id)
      } else {
        await wishlistApi.add(token, productId, selected.id)
      }
    } catch {
      setWishlisted(prev)
    } finally {
      setWishlistLoading(false)
    }
  }, [token, productId, selected, wishlisted, router])

  useEffect(() => {
    if (!product || !hasAttrs || !Object.keys(sel).length) return
    const match = findMatchingVariant(activeVariants, sel)
    if (match && match.id !== selected?.id) {
      setSelected(match)
      // Ã˜Â§Ã™â€ Ã˜ÂªÃ™â€šÃ™â€ž Ã™â€žÃ˜ÂµÃ™Ë†Ã˜Â±Ã˜Â© Ã˜Â§Ã™â€žÃ™â‚¬ variant Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â®Ã˜ÂªÃ˜Â§Ã˜Â± Ã˜Â¥Ã™â€  Ã™Ë†Ã™ÂÃ˜Â¬Ã˜Â¯Ã˜Âª
      if (match.imagePath) {
        const idx = allImages.indexOf(match.imagePath)
        if (idx >= 0) setActiveImg(idx)
      }
    }
  }, [sel, product, activeVariants, hasAttrs, allImages, selected?.id])

  const selectOption = useCallback((attrId: number, valueEn: string) => {
    setSel(prev => {
      const next: Record<number, string> = { ...prev, [attrId]: valueEn }

      // Ã™â€¡Ã™â€ž Ã™Å Ã™Ë†Ã˜Â¬Ã˜Â¯ variant Ã™Å Ã˜Â·Ã˜Â§Ã˜Â¨Ã™â€š Ã˜Â§Ã™â€žÃ™â‚¬ selection Ã˜Â§Ã™â€žÃ™Æ’Ã˜Â§Ã™â€¦Ã™â€žÃ˜Å¸
      const exactMatch = activeVariants.some(v => v.isActive && variantMatchesSel(v, next))
      if (exactMatch) return next

      // Ã™â€žÃ˜Â§ Ã™Å Ã™Ë†Ã˜Â¬Ã˜Â¯ Ã˜ÂªÃ˜Â·Ã˜Â§Ã˜Â¨Ã™â€š Ã™Æ’Ã˜Â§Ã™â€¦Ã™â€ž Ã¢â€ â€™ Ã˜Â§Ã˜Â¨Ã˜Â­Ã˜Â« Ã˜Â¹Ã™â€  Ã˜Â£Ã™â€šÃ˜Â±Ã˜Â¨ variant Ã™Å Ã˜Â­Ã˜ÂªÃ™Ë†Ã™Å  Ã˜Â§Ã™â€žÃ™â€šÃ™Å Ã™â€¦Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â¯Ã™Å Ã˜Â¯Ã˜Â©
      // Ã™Ë†Ã˜Â¹Ã˜Â¯Ã™â€˜Ã™â€ž Ã˜Â¨Ã˜Â§Ã™â€šÃ™Å  Ã˜Â§Ã™â€žÃ˜Â®Ã˜ÂµÃ˜Â§Ã˜Â¦Ã˜Âµ Ã˜ÂªÃ™â€žÃ™â€šÃ˜Â§Ã˜Â¦Ã™Å Ã˜Â§Ã™â€¹ Ã™â€žÃ˜ÂªÃ˜ÂªÃ™Ë†Ã˜Â§Ã™ÂÃ™â€š Ã™â€¦Ã˜Â¹Ã™â€¡
      const compatible = activeVariants.find(v =>
        v.isActive &&
        getVariantAttrs(v).some(a => a.attributeId === attrId && (a.valueEn ?? a.rawValue) === valueEn)
      )
      if (compatible) return buildSelectionFromVariant(compatible)

      // fallback: Ã™ÂÃ™â€šÃ˜Â· Ã˜Â§Ã™â€žÃ™â€šÃ™Å Ã™â€¦Ã˜Â© Ã˜Â§Ã™â€žÃ˜Â¬Ã˜Â¯Ã™Å Ã˜Â¯Ã˜Â©
      return { [attrId]: valueEn }
    })
  }, [activeVariants])

  const selectedVariantId = selected?.id ?? 0
  const baseStock = Math.max(0, selected?.quantityInStock ?? 0)
  const cartQuantityForSelected = useMemo(() => {
    if (!cart?.items?.length || !selected) return 0
    return cart.items
      .filter((item) => item.productVariantId === selected.id && item.branchId === branchId)
      .reduce((sum, item) => sum + item.quantity, 0)
  }, [branchId, cart, selected])
  const remainingStock = Math.max(0, baseStock - cartQuantityForSelected)
  const maxSelectableQty = Math.max(1, Math.min(10, remainingStock))
  const inStock = Boolean(selected?.isActive) && remainingStock > 0

  if (loading) return <ProductSkeleton />
  if (!product || !selected) return null

  const name     = locale === 'ar' ? (product.nameAr || product.nameEn) : product.nameEn
  const desc     = locale === 'ar' ? ((product as any).descriptionAr || product.description) : product.description
  const catName  = locale === 'ar' ? ((product as any).categoryNameAr || product.categoryNameEn) : product.categoryNameEn
  const currencyLabel = getCurrencyLabel(locale)
  const selectedVariantLabel = locale === 'ar' ? (selected.nameAr || selected.nameEn) : selected.nameEn
  const shortDesc = desc && desc.length > 180 ? `${desc.slice(0, 180)}...` : desc

  const rawPath  = allImages[activeImg] || selected.imagePath || product.imagePath
  const imgSrc   = buildStoreImageUrl(rawPath) ?? '/placeholder.jpg'
  const savings  = selected.hasActiveOffer
    ? Math.max(0, selected.basePrice - selected.currentPrice)
    : 0
  const hasSavings = selected.hasActiveOffer && savings > 0 && (selected.discountPercentage ?? 0) > 0
  const lowStock = inStock && remainingStock <= 5
  const offerEndLabel = hasSavings && selected.offerEndsAt
    ? t(
        `Offer ends ${new Date(selected.offerEndsAt).toLocaleDateString('en-SA', { day: 'numeric', month: 'long' })}`,
        `ينتهي العرض ${new Date(selected.offerEndsAt).toLocaleDateString('ar-SA', { day: 'numeric', month: 'long' })}`,
      )
    : null

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f6f2_0%,#ffffff_42%,#f4ede1_100%)]">

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pb-2 pt-5 md:px-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs" style={{ color: "var(--mute)" }}>
          <a href={`/shop${branchId ? `?branch=${branchId}` : ''}`} className="hover:text-[var(--ink)] transition-colors">{t('Shop', '\u0627\u0644\u0645\u062a\u062c\u0631')}</a>
          <span>&rsaquo;</span>
          {catName && (
            <>
              <a href={`/shop?category=${product.categoryId}&branch=${branchId}`}
                className="hover:text-[var(--ink)] transition-colors">{catName}</a>
              <span>&rsaquo;</span>
            </>
          )}
          <span className="truncate max-w-[200px]" style={{ color: 'var(--mute)' }}>{name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-16">
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ Left: Image Gallery Ã¢â€â‚¬Ã¢â€â‚¬ */}
          {/* Image Gallery */}
          <ProductImageGallery
            allImages={allImages}
            activeImg={activeImg}
            onActiveImgChange={setActiveImg}
            imgSrc={imgSrc}
            name={name}
            sku={selected.sku}
            inStock={inStock}
            hasSavings={hasSavings}
            discountPercentage={selected.discountPercentage ?? 0}
            wishlisted={wishlisted}
            wishlistLoading={wishlistLoading}
            onWishlist={handleWishlist}
            t={t}
          />
          {/* Ã¢â€â‚¬Ã¢â€â‚¬ Right: Details Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="flex flex-col gap-5 rounded-[34px] border bg-white p-5 backdrop-blur md:p-7" style={{ borderColor: 'var(--line)', boxShadow: '0 16px 44px rgba(10,31,68,0.06)' }}>

            <div className="flex flex-wrap items-center gap-2">
              {product.brand && (
                <span className="rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em]" style={{ background: 'rgba(255,107,44,0.10)', color: 'var(--orange)' }}>
                  {product.brand}
                </span>
              )}
              {catName && (
                <span className="rounded-full border px-3 py-1 text-[11px] font-bold" style={{ borderColor: 'var(--line)', background: 'var(--paper)', color: 'var(--mute)' }}>
                  {catName}
                </span>
              )}
              <span className="rounded-full border bg-white px-3 py-1 font-mono text-[11px]" style={{ borderColor: 'var(--line)', color: 'var(--mute)' }}>
                SKU: {selected.sku}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-2xl font-black leading-[1.18] md:text-3xl lg:text-4xl lg:leading-[1.12]" style={{ color: 'var(--ink)' }}>
              {name}
            </h1>

            {shortDesc && (
              <p className="max-w-2xl text-sm leading-8 md:text-[15px]" style={{ color: 'var(--mute)' }}>
                {shortDesc}
              </p>
            )}

            <div className="rounded-[30px] border p-4" style={{ borderColor: 'var(--line)', background: 'var(--paper)', boxShadow: '0 12px 26px rgba(10,31,68,0.04)' }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--mute)' }}>
                      {t('Current price', 'السعر الحالي')}
                    </p>
                    <span className="text-4xl font-black leading-none" style={{ color: 'var(--ink)' }}>
                    {selected.currentPrice.toFixed(2)}
                    <span className="ms-1 text-lg font-bold" style={{ color: 'var(--mute)' }}>
                      {currencyLabel}
                    </span>
                    </span>
                  </div>
                  {hasSavings && (
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-base line-through" style={{ color: 'var(--mute)' }}>
                        {selected.basePrice.toFixed(2)}
                      </span>
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-black text-green-700">
                        {formatSavingsLabel(savings, locale)}
                      </span>
                    </div>
                  )}
                </div>

                {offerEndLabel ? (
                  <div className="flex min-w-[12rem] items-center justify-end self-end text-xs font-bold text-red-500 sm:text-sm">
                    {offerEndLabel}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Stock badge */}
            {inStock && lowStock && (
              <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--orange)' }}>
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'var(--orange)' }} />
                {t(`Only ${remainingStock} left to add`, `باقي ${remainingStock} فقط للإضافة`)}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[24px] border px-4 py-3" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
                <p className="text-[11px] font-bold text-[11px]" style={{ color: "var(--mute)" }}>{t('Availability', '\u0627\u0644\u062a\u0648\u0641\u0631')}</p>
                <p className={`mt-1 text-sm font-black ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                  {inStock ? t('In stock', '\u0645\u062a\u0648\u0641\u0631') : t('Sold out', '\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631')}
                </p>
                <p className="mt-1 text-[11px]" style={{ color: "var(--mute)" }}>
                  {inStock
                    ? t(`${remainingStock} available to add`, `${remainingStock} متاح للإضافة`)
                    : t('No units available right now', 'لا توجد وحدات متاحة حاليًا')}
                </p>
              </div>
              <div className="rounded-[24px] border px-4 py-3" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
                <p className="text-[11px] font-bold" style={{ color: 'var(--mute)' }}>{t('Branch', '\u0627\u0644\u0641\u0631\u0639')}</p>
                <p className="mt-1 text-sm font-black" style={{ color: 'var(--ink)' }}>#{branchId}</p>
              </div>
            </div>

            <div className="h-px w-full" style={{ background: "var(--line)" }} />

            {/* Ã¢â€â‚¬Ã¢â€â‚¬ Variant Attribute Selectors Ã¢â€â‚¬Ã¢â€â‚¬ */}
            {hasAttrs && (
              <div className="space-y-6">
                {attrKeys.map(attr => {
                  const options    = getAttrOptions(activeVariants, attr.id)
                  const currentVal = sel[attr.id]
                  const attrName   = locale === 'ar' ? (attr.nameAr || attr.nameEn) : attr.nameEn
                  const isColor    = attr.nameEn.toLowerCase().includes('color')
                    || attr.nameAr.includes('\u0644\u0648\u0646')
                  const isSize     = attr.nameEn.toLowerCase().includes('size')
                    || attr.nameAr.includes('\u0645\u0642\u0627\u0633') || attr.nameAr.includes('\u062d\u062c\u0645')

                  return (
                    <div key={attr.id}>
                      {/* Attribute label + selected value */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-black" style={{ color: "var(--ink)" }}>
                          {attrName}
                        </span>
                        {currentVal && (
                          <span className="text-sm font-medium px-2.5 py-0.5 rounded-full" style={{ color: "var(--mute)", background: "var(--paper-2)" }}>
                            {options.find(o => o.valueEn === currentVal)?.[locale === 'ar' ? 'valueAr' : 'valueEn'] ?? currentVal}
                          </span>
                        )}
                      </div>

                      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Color Swatches Ã¢â€â‚¬Ã¢â€â‚¬ */}
                      {isColor ? (
                        <div className="flex flex-wrap gap-3">
                          {options.map(opt => {
                            const isSel  = currentVal === opt.valueEn
                            const avail  = isOptionAvailable(activeVariants, attr.id, opt.valueEn, sel)
                            const inStk  = isOptionInStock(activeVariants, attr.id, opt.valueEn, sel)
                            const hex    = opt.colorHex ?? opt.valueEn.toLowerCase()
                            const displayVal = locale === 'ar' ? (opt.valueAr || opt.valueEn || opt.valueEn) : (opt.valueEn || opt.valueAr || '')

                            return (
                              <button
                                key={opt.valueEn}
                                onClick={() => avail && selectOption(attr.id, opt.valueEn)}
                                title={displayVal}
                                disabled={!avail}
                                className={`relative flex flex-col items-center gap-1.5 group
                                  transition-all duration-200
                                  ${!avail ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                                {/* Swatch circle */}
                                <div className={`w-10 h-10 rounded-full transition-all duration-200
                                  ${isSel
                                    ? 'ring-3 ring-[var(--ink)] ring-offset-2 scale-110 shadow-lg'
                                    : avail
                                      ? 'ring-1 ring-black/15 hover:scale-110 hover:shadow-md hover:ring-[var(--ink)]'
                                      : 'ring-1 ring-black/10'
                                  }`}
                                  style={{ backgroundColor: hex }}>
                                  {/* checkmark Ã™â€žÃ™â€žÃ™â€¦Ã˜Â­Ã˜Â¯Ã˜Â¯ */}
                                  {isSel && (() => {
                                    const isDark = isColorDark(hex)
                                    return (
                                      <div className="w-full h-full flex items-center justify-center rounded-full">
                                        <svg className={`w-4 h-4 ${isDark ? 'text-white' : 'text-[var(--ink)]'}`}
                                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round"
                                            strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    )
                                  })()}
                                  {/* Ã˜Â®Ã˜Â· Ã™â€¦Ã˜Â§Ã˜Â¦Ã™â€ž Ã™â€žÃ™â€žÃ™â€ Ã˜Â§Ã™ÂÃ˜Â¯ Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â®Ã˜Â²Ã™Ë†Ã™â€  */}
                                  {!inStk && (
                                    <div className="absolute inset-0 overflow-hidden rounded-full flex items-center justify-center">
                                      <div className="w-[130%] h-px bg-white/70 rotate-[-45deg]" />
                                    </div>
                                  )}
                                </div>
                                {/* label Ã˜ÂªÃ˜Â­Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â§Ã˜Â¦Ã˜Â±Ã˜Â© */}
                                <span className="text-[10px] font-bold max-w-[48px] text-center leading-tight"
                                  style={{ color: isSel ? 'var(--ink)' : 'var(--mute)' }}>
                                  {displayVal}
                                </span>
                              </button>
                            )
                          })}
                        </div>


                      ) : isSize ? (
                        <div className="flex flex-wrap gap-2">
                          {options.map(opt => {
                            const isSel  = currentVal === opt.valueEn
                            const avail  = isOptionAvailable(activeVariants, attr.id, opt.valueEn, sel)
                            const inStk  = isOptionInStock(activeVariants, attr.id, opt.valueEn, sel)
                            const displayVal = locale === 'ar' ? (opt.valueAr || opt.valueEn || opt.valueEn) : (opt.valueEn || opt.valueAr || '')

                            return (
                              <button
                                key={opt.valueEn}
                                onClick={() => avail && selectOption(attr.id, opt.valueEn)}
                                disabled={!avail}
                                className={`relative min-w-[52px] px-4 py-2.5 rounded-xl text-sm font-black
                                  border-2 transition-all duration-150 text-center
                                  ${isSel
                                    ? 'text-white scale-[1.05]'
                                    : avail
                                      ? 'bg-white hover:bg-paper'
                                      : 'cursor-not-allowed'
                                  }`}
                                style={isSel
                                  ? { background: 'var(--ink)', borderColor: 'var(--ink)', boxShadow: '0 4px 12px rgba(10,31,68,0.20)' }
                                  : avail
                                    ? { color: 'var(--ink)', borderColor: 'var(--line)' }
                                    : { background: 'var(--paper)', color: 'var(--mute)', borderColor: 'var(--line)' }
                                }>
                                {!inStk && avail && (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-full h-px absolute rotate-[-15deg]" style={{ background: 'var(--mute)' }} />
                                  </span>
                                )}
                                <span className={!inStk && avail ? 'opacity-60' : ''}>{displayVal}</span>
                              </button>
                            )
                          })}
                        </div>


                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {options.map(opt => {
                            const isSel  = currentVal === opt.valueEn
                            const avail  = isOptionAvailable(activeVariants, attr.id, opt.valueEn, sel)
                            const inStk  = isOptionInStock(activeVariants, attr.id, opt.valueEn, sel)
                            const displayVal = locale === 'ar' ? (opt.valueAr || opt.valueEn || opt.valueEn) : (opt.valueEn || opt.valueAr || '')

                            return (
                              <button
                                key={opt.valueEn}
                                onClick={() => avail && selectOption(attr.id, opt.valueEn)}
                                disabled={!avail}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
                                  font-bold border-2 transition-all duration-150
                                  ${isSel
                                    ? 'text-white shadow-md'
                                    : avail
                                      ? 'bg-white'
                                      : 'cursor-not-allowed'
                                  }`}
                                style={isSel
                                  ? { background: 'var(--orange)', borderColor: 'var(--orange)' }
                                  : avail
                                    ? { color: 'var(--ink)', borderColor: 'var(--line)' }
                                    : { background: 'var(--paper)', color: 'var(--mute)', borderColor: 'var(--line)' }
                                }>
                                {opt.colorHex && (
                                  <span className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                                    style={{ backgroundColor: opt.colorHex }} />
                                )}
                                <span className={!avail ? 'line-through opacity-50' : ''}>{displayVal}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Fallback: variants Ã˜Â¨Ã˜Â¯Ã™Ë†Ã™â€  attributes */}
            {!hasAttrs && activeVariants.length > 1 && (
              <div>
                <p className="text-sm font-black mb-3" style={{ color: "var(--ink)" }}>
                  {t('Select Option', '\u0627\u062e\u062a\u0631 \u0627\u0644\u062e\u064a\u0627\u0631')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeVariants.map(v => {
                    const isSel = v.id === selected.id
                    const avail = v.isActive && (v.quantityInStock ?? 1) > 0
                    return (
                      <button key={v.id}
                        onClick={() => avail && setSelected(v)}
                        disabled={!avail}
                        className={`px-4 py-2.5 rounded-xl text-sm font-bold border-2
                          transition-all duration-150
                          ${isSel
                            ? 'text-white'
                            : avail
                              ? 'bg-white'
                              : 'cursor-not-allowed'
                          }`}
                        style={isSel
                          ? { background: 'var(--ink)', borderColor: 'var(--ink)', boxShadow: '0 4px 12px rgba(10,31,68,0.18)' }
                          : avail
                            ? { color: 'var(--ink)', borderColor: 'var(--line)' }
                            : { background: 'var(--paper)', color: 'var(--mute)', borderColor: 'var(--line)' }
                        }>
                        <span className={!avail ? 'line-through opacity-60' : ''}>
                          {locale === 'ar' ? (v.nameAr || v.nameEn) : v.nameEn}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {desc && (
              <>
                <div className="w-full h-px" style={{ background: "var(--line)" }} />
                <div className="rounded-[28px] border px-5 py-4" style={{ borderColor: "var(--line)", background: "var(--paper)" }}>
                  <p className="mb-2 text-xs font-black uppercase tracking-widest" style={{ color: "var(--mute)" }}>
                    {t('Description', '\u0627\u0644\u0648\u0635\u0641')}
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--mute)" }}>{desc}</p>
                </div>
              </>
            )}

            <div className="w-full h-px" style={{ background: "var(--line)" }} />

            {/* Add to Cart */}
            <AddToCartPanel
              selected={selected}
              product={product}
              branchId={branchId}
              inStock={inStock}
              remainingStock={remainingStock}
              maxSelectableQty={maxSelectableQty}
              hasAttrs={hasAttrs}
              attrKeys={attrKeys}
              sel={sel}
            />
      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Zoom Modal Ã¢â€â‚¬Ã¢â€â‚¬ */}
          </div>
        </div>
      </div>
    </div>
  )
}


// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Color Utility Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

/**
 * Ã™â€¡Ã™â€ž Ã˜Â§Ã™â€žÃ™â€žÃ™Ë†Ã™â€  Ã˜Â¯Ã˜Â§Ã™Æ’Ã™â€ Ã˜Å¸ (Ã™â€žÃ˜ÂªÃ˜Â­Ã˜Â¯Ã™Å Ã˜Â¯ Ã™â€žÃ™Ë†Ã™â€  checkmark Ã˜Â§Ã™â€žÃ˜Â£Ã˜Â¨Ã™Å Ã˜Â¶ Ã˜Â£Ã™Ë† Ã˜Â§Ã™â€žÃ˜Â£Ã˜Â³Ã™Ë†Ã˜Â¯)
 */
function isColorDark(hex: string): boolean {
  const DARK_NAMES = ['black', 'navy', 'darkblue', 'darkgreen', 'brown',
    'maroon', 'indigo', 'purple', 'gray', 'grey', 'charcoal', 'Ã˜Â£Ã˜Â³Ã™Ë†Ã˜Â¯', 'Ã™Æ’Ã˜Â­Ã™â€žÃ™Å ']
  const lower = hex.toLowerCase()
  if (DARK_NAMES.some(d => lower.includes(d))) return true
  if (!lower.startsWith('#') || lower.length < 7) return false
  try {
    const r = parseInt(lower.slice(1, 3), 16)
    const g = parseInt(lower.slice(3, 5), 16)
    const b = parseInt(lower.slice(5, 7), 16)
    // luminance formula
    return (0.299 * r + 0.587 * g + 0.114 * b) < 128
  } catch { return true }
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Skeleton Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 grid md:grid-cols-2 gap-8 animate-pulse">
      <div className="flex flex-col gap-3">
        <div className="aspect-square rounded-3xl bg-[var(--paper-2)]" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-16 h-16 rounded-xl bg-[var(--paper-2)]" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5 pt-2">
        <div className="h-3 w-16 bg-[var(--paper-2)] rounded-full" />
        <div className="h-9 bg-[var(--paper-2)] rounded-xl" />
        <div className="h-10 w-40 bg-[var(--paper-2)] rounded-xl" />
        <div className="h-px bg-[var(--paper-2)]" />
        {/* Attribute skeletons */}
        <div className="space-y-5">
          {[1, 2].map(i => (
            <div key={i}>
              <div className="h-4 w-20 bg-[var(--paper-2)] rounded-full mb-3" />
              <div className="flex gap-2">
                {[1,2,3,4].map(j => (
                  <div key={j} className={i === 1 ? 'w-10 h-10 rounded-full bg-[var(--paper-2)]' : 'w-14 h-10 rounded-xl bg-[var(--paper-2)]'} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="h-14 bg-[var(--paper-2)] rounded-2xl" />
      </div>
    </div>
  )
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Export Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

export default function ProductPage(props: ProductPageClientProps) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductPageInner {...props} />
    </Suspense>
  )
}










