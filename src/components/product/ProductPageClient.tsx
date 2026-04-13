'use client'

import { useEffect, useState, useMemo, Suspense, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { catalogApi, productApi, wishlistApi } from '@/lib/api'
import { useCart } from '@/context/cart'
import { useAuth } from '@/context/auth'
import { useLocale } from '@/context/locale'
import { OfferCountdown } from '@/components/ui/OfferBadge'
import { translateApiError } from '@/lib/errors'
import { formatSavingsLabel, getCurrencyLabel } from '@/lib/store'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'
import type { Product, ProductVariant, VariantAttribute, BranchProductAvailabilityItem, ProductSummary } from '@/types'

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
  const { cart, addItem }     = useCart()
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
  const [qty,           setQty]           = useState(1)
  const [adding,        setAdding]        = useState(false)
  const [added,         setAdded]         = useState(false)
  const [error,         setError]         = useState('')
  const [imgError,      setImgError]      = useState(false)
  const [activeImg,     setActiveImg]     = useState(
    initialProduct ? getInitialActiveImageIndex(initialProduct, initialProductImages, preloadedVariant) : 0
  )
  const [productImages, setProductImages] = useState<string[]>(initialProductImages)
  const [zoomed,        setZoomed]        = useState(false)
  const [wishlisted,    setWishlisted]    = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  // Touch/swipe state for mobile image gallery
  const touchStartX   = useRef<number | null>(null)
  const touchStartY   = useRef<number | null>(null)
  const productCacheRef = useRef<Map<number, Product>>(initialProduct ? new Map([[initialProduct.id, initialProduct]]) : new Map())
  const productReqIdRef = useRef(0)
  const wishlistReqIdRef = useRef(0)
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
  }, [productId, variantId, router, initialProduct, initialProductImages, preloadedVariantId])

  // Check wishlist status when variant changes
  useEffect(() => {
    if (!token || !selected) {
      setWishlisted(false)
      return
    }
    const reqId = ++wishlistReqIdRef.current
    wishlistApi.check(token, selected.id)
      .then(r => {
        if (reqId === wishlistReqIdRef.current) {
          setWishlisted(r.isWishlisted)
        }
      })
      .catch(() => {})
  }, [token, selected])

  useEffect(() => {
    if (!product?.id || !branchId) return

    const reqId = ++branchAvailabilityReqIdRef.current

    catalogApi.getProductAvailability(branchId, product.id)
      .then((items: BranchProductAvailabilityItem[]) => {
        if (reqId !== branchAvailabilityReqIdRef.current) return

        const availabilityByVariantId = new Map(
          items.map((item) => [item.variantId, item] as const)
        )

        setProduct((currentProduct) => {
          if (!currentProduct || currentProduct.id !== product.id) return currentProduct

          const nextVariants = currentProduct.variants.map((variant) => {
            const availability = availabilityByVariantId.get(variant.id)
            return {
              ...variant,
              quantityInStock:
                availability && availability.isAvailable
                  ? Math.max(0, availability.quantityInStock)
                  : 0,
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
          return {
            ...currentSelected,
            quantityInStock:
              availability && availability.isAvailable
                ? Math.max(0, availability.quantityInStock)
                : 0,
          }
        })
      })
      .catch(() => {})
  }, [branchId, product?.id])

  // Close zoom on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setZoomed(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  async function handleWishlist() {
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
    setWishlistLoading(true)
    try {
      if (wishlisted) {
        await wishlistApi.remove(token, selected.id)
        setWishlisted(false)
      } else {
        await wishlistApi.add(token, productId, selected.id)
        setWishlisted(true)
      }
    } catch {}
    finally { setWishlistLoading(false) }
  }
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

  function selectOption(attrId: number, valueEn: string) {
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
    setError('')
  }

  async function handleAddToCart() {
    if (!selected || !product) return
    if (hasAttrs && attrKeys.length !== Object.keys(sel).length) {
      setError(t('Please select all options', '\u064a\u0631\u062c\u0649 \u062a\u062d\u062f\u064a\u062f \u062c\u0645\u064a\u0639 \u0627\u0644\u062e\u064a\u0627\u0631\u0627\u062a'))
      return
    }
    if (!selected.isActive || remainingStock <= 0) {
      setError(t('This option is out of stock', '\u0647\u0630\u0627 \u0627\u0644\u062e\u064a\u0627\u0631 \u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631'))
      return
    }
    if (qty > remainingStock) {
      setError(
        t(
          `Only ${remainingStock} item(s) can be added for this option`,
          `يمكن إضافة ${remainingStock} قطعة فقط من هذا الخيار`
        )
      )
      return
    }
    setAdding(true)
    setError('')
    try {
      await addItem(product.id, selected.id, branchId, qty)
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch (e: any) {
      const message = typeof e?.message === 'string' ? e.message : ''
      const requestedBranch = sp.get('branch')
      const shouldTryFallbackBranch =
        !requestedBranch &&
        (message.includes('Product variant not available in this branch') || message.includes('items available'))

      if (shouldTryFallbackBranch) {
        const candidateBranches = Array.from(
          new Set([branchId, Number(process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID ?? '1'), 1, 2, 3, 4, 5])
        ).filter((id) => Number.isInteger(id) && id > 0)

        for (const candidateBranchId of candidateBranches) {
          if (candidateBranchId === branchId) continue

          try {
            const availability = await catalogApi.getProductAvailability(candidateBranchId, product.id)
            const matchingVariant = availability.find((item) =>
              item.variantId === selected.id &&
              item.isAvailable &&
              item.quantityInStock >= qty
            )

            if (!matchingVariant) continue

            await addItem(product.id, selected.id, candidateBranchId, qty)
            setAdded(true)
            setTimeout(() => setAdded(false), 2500)
            setError('')
            router.replace(`/product?id=${product.id}&variant=${selected.id}&branch=${candidateBranchId}`)
            return
          } catch {
            // Keep trying branch candidates until we find stock.
          }
        }
      }

      setError(translateApiError(
        message || t('Failed to add to cart', '\u0641\u0634\u0644\u062a \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0645\u0646\u062a\u062c \u0625\u0644\u0649 \u0627\u0644\u0633\u0644\u0629'),
        t
      ))
    } finally {
      setAdding(false)
    }
  }

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

  useEffect(() => {
    if (!selected) return

    setQty((currentQty) => {
      if (!inStock) return 1
      return Math.min(Math.max(1, currentQty), maxSelectableQty)
    })
  }, [inStock, maxSelectableQty, selected, selectedVariantId])

  if (loading) return <ProductSkeleton />
  if (!product || !selected) return null

  const name     = locale === 'ar' ? (product.nameAr || product.nameEn) : product.nameEn
  const desc     = locale === 'ar' ? ((product as any).descriptionAr || product.description) : product.description
  const catName  = locale === 'ar' ? ((product as any).categoryNameAr || product.categoryNameEn) : product.categoryNameEn
  const currencyLabel = getCurrencyLabel(locale)
  const selectedVariantLabel = locale === 'ar' ? (selected.nameAr || selected.nameEn) : selected.nameEn
  const shortDesc = desc && desc.length > 180 ? `${desc.slice(0, 180)}...` : desc

  const rawPath  = allImages[activeImg] || selected.imagePath || product.imagePath
  const imgSrc   = (!imgError ? buildStoreImageUrl(rawPath) : null) ?? undefined
  const savings  = selected.hasActiveOffer
    ? Math.max(0, selected.basePrice - selected.currentPrice)
    : 0
  const hasSavings = selected.hasActiveOffer && savings > 0 && (selected.discountPercentage ?? 0) > 0
  const lowStock = inStock && remainingStock <= 5

  const serviceHighlights = [
    {
      label: t('Secure checkout', '\u062f\u0641\u0639 \u0622\u0645\u0646'),
      value: t('Protected order flow', '\u0631\u062d\u0644\u0629 \u0634\u0631\u0627\u0621 \u0645\u0648\u062b\u0648\u0642\u0629'),
    },
    {
      label: t('Fast support', '\u062f\u0639\u0645 \u0633\u0631\u064a\u0639'),
      value: t('Responsive after purchase', '\u0645\u062a\u0627\u0628\u0639\u0629 \u0633\u0631\u064a\u0639\u0629 \u0628\u0639\u062f \u0627\u0644\u0634\u0631\u0627\u0621'),
    },
    {
      label: t('Store quality', '\u062c\u0648\u062f\u0629 \u0645\u062e\u062a\u0627\u0631\u0629'),
      value: t('Curated premium assortment', '\u0645\u0646\u062a\u062c\u0627\u062a \u0645\u062e\u062a\u0627\u0631\u0629 \u0628\u0639\u0646\u0627\u064a\u0629'),
    },
  ]

  const purchaseSignals = [
    {
      label: t('Delivery', 'التوصيل'),
      value: t('Selected cities only', 'في مدن مختارة فقط'),
    },
    {
      label: t('Pickup', 'الاستلام'),
      value: t(`Branch #${branchId}`, `الفرع #${branchId}`),
    },
    {
      label: t('Order status', 'حالة الطلب'),
      value: inStock ? t('Ready to add now', 'جاهز للإضافة الآن') : t('Temporarily unavailable', 'غير متوفر مؤقتًا'),
    },
  ]

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f6f2_0%,#ffffff_42%,#f4ede1_100%)]">

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pb-2 pt-5 md:px-6">
        <nav className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <a href={`/shop${branchId ? `?branch=${branchId}` : ''}`} className="hover:text-slate-700 transition-colors">{t('Shop', '\u0627\u0644\u0645\u062a\u062c\u0631')}</a>
          <span>&rsaquo;</span>
          {catName && (
            <>
              <a href={`/shop?category=${product.categoryId}&branch=${branchId}`}
                className="hover:text-slate-700 transition-colors">{catName}</a>
              <span>&rsaquo;</span>
            </>
          )}
          <span className="text-slate-600 truncate max-w-[200px]">{name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-16">
        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ Left: Image Gallery Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="flex flex-col gap-3 md:sticky md:top-24">

            {/* Main Image Ã¢â‚¬â€ click to zoom, swipe to navigate */}
            <div
              className="relative aspect-square overflow-hidden rounded-[34px] border border-stone-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)] cursor-zoom-in group"
              onClick={() => imgSrc && setZoomed(true)}
              onTouchStart={e => {
                touchStartX.current = e.touches[0].clientX
                touchStartY.current = e.touches[0].clientY
              }}
              onTouchEnd={e => {
                if (touchStartX.current === null || touchStartY.current === null) return
                const dx = e.changedTouches[0].clientX - touchStartX.current
                const dy = e.changedTouches[0].clientY - touchStartY.current
                // Ã™ÂÃ™â€šÃ˜Â· Ã˜Â¥Ã˜Â°Ã˜Â§ Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â±Ã™Æ’Ã˜Â© Ã˜Â£Ã™ÂÃ™â€šÃ™Å Ã˜Â© Ã™Ë†Ã˜Â§Ã˜Â¶Ã˜Â­Ã˜Â© (>40px) Ã™Ë†Ã™â€žÃ™Å Ã˜Â³Ã˜Âª Ã˜Â¹Ã™â€¦Ã™Ë†Ã˜Â¯Ã™Å Ã˜Â© (scroll)
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                  if (dx < 0) {
                    // swipe left Ã¢â€ â€™ next image
                    setActiveImg(i => (i + 1) % allImages.length)
                  } else {
                    // swipe right Ã¢â€ â€™ prev image
                    setActiveImg(i => (i - 1 + allImages.length) % allImages.length)
                  }
                }
                touchStartX.current = null
                touchStartY.current = null
              }}>
              {imgSrc ? (
                <Image
                  src={imgSrc}
                  alt={name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center
                  justify-center gap-3 text-slate-200">
                  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.8}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm font-medium text-slate-300">{t('No image', '\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0648\u0631\u0629')}</p>
                </div>
              )}

              {/* Discount pill */}
              {hasSavings && (
                <div className="absolute start-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-sm font-black text-white shadow-lg pointer-events-none">
                  -{Math.round(selected.discountPercentage ?? 0)}% OFF
                </div>
              )}

              {/* Zoom hint */}
              {imgSrc && (
                <div className="absolute bottom-3 end-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1.5 text-xs font-bold text-white opacity-0 transition-opacity duration-200 pointer-events-none group-hover:opacity-100">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                  {t('Zoom', '\u062a\u0643\u0628\u064a\u0631')}
                </div>
              )}

              {/* Wishlist button Ã¢â‚¬â€ top end corner */}
              <button
                onClick={e => { e.stopPropagation(); handleWishlist() }}
                disabled={wishlistLoading}
                className={`absolute end-3 top-3 flex h-11 w-11 items-center
                  justify-center rounded-2xl transition-all duration-200 shadow-md
                  ${wishlisted
                    ? 'bg-red-500 text-white scale-110'
                    : 'bg-white/90 text-slate-400 hover:text-red-500 hover:bg-white'
                  }`}>
                {wishlistLoading ? (
                  <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'}
                    stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>

              {/* Out of stock overlay */}
              {!inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/58 backdrop-blur-[2px] pointer-events-none">
                  <span className="px-5 py-2 bg-slate-900/80 text-white text-sm
                    font-black rounded-full">
                    {t('Out of stock', '\u0646\u0641\u062f \u0627\u0644\u0645\u062e\u0632\u0648\u0646')}
                  </span>
                </div>
              )}

              {/* Swipe dots Ã¢â‚¬â€ mobile only, shown when multiple images */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2
                  flex gap-1.5 md:hidden pointer-events-none">
                  {allImages.map((_, idx) => (
                    <span key={idx}
                      className={`rounded-full transition-all duration-300
                        ${activeImg === idx
                          ? 'w-4 h-1.5 bg-white'
                          : 'w-1.5 h-1.5 bg-white/50'
                        }`} />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {allImages.map((img, idx) => {
                    const src = buildStoreImageUrl(img)
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImg(idx)}
                      className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border-2 bg-white transition-all
                        ${activeImg === idx
                          ? 'scale-105 border-slate-900 shadow-md'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:border-slate-300'
                        }`}>
                      {src && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt={`${name} ${idx + 1}`}
                          className="w-full h-full object-cover" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {/* SKU */}
            <p className="text-center font-mono text-xs text-slate-400">
              SKU: {selected.sku}
            </p>
          </div>

          {/* Ã¢â€â‚¬Ã¢â€â‚¬ Right: Details Ã¢â€â‚¬Ã¢â€â‚¬ */}
          <div className="flex flex-col gap-5 rounded-[34px] border border-stone-200 bg-white/88 p-5 shadow-[0_16px_44px_rgba(15,23,42,0.05)] backdrop-blur md:p-7">

            <div className="flex flex-wrap items-center gap-2">
              {product.brand && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">
                  {product.brand}
                </span>
              )}
              {catName && (
                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-bold text-slate-500">
                  {catName}
                </span>
              )}
              <span className="rounded-full border border-stone-200 bg-white px-3 py-1 font-mono text-[11px] text-slate-400">
                SKU: {selected.sku}
              </span>
            </div>

            {/* Name */}
            <h1 className="text-2xl font-black leading-[1.18] text-slate-900 md:text-3xl lg:text-4xl lg:leading-[1.12]">
              {name}
            </h1>

            {shortDesc && (
              <p className="max-w-2xl text-sm leading-8 text-slate-600 md:text-[15px]">
                {shortDesc}
              </p>
            )}

            <div className="rounded-[30px] border border-stone-200 bg-[linear-gradient(135deg,#fffefb_0%,#faf7f1_100%)] p-4 shadow-[0_12px_26px_rgba(15,23,42,0.04)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
                      {t('Current price', 'السعر الحالي')}
                    </p>
                    <span className="text-4xl font-black leading-none text-slate-900">
                    {selected.currentPrice.toFixed(2)}
                    <span className="ms-1 text-lg font-bold text-slate-400">
                      {currencyLabel}
                    </span>
                    </span>
                  </div>
                  {hasSavings && (
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-base text-slate-400 line-through">
                        {selected.basePrice.toFixed(2)}
                      </span>
                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-black text-green-700">
                        {formatSavingsLabel(savings, locale)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-[12rem] rounded-[24px] border border-white/80 bg-white/90 px-3.5 py-3 shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{t('Selected option', 'الخيار المحدد')}</p>
                  <p className="mt-1 truncate text-sm font-black text-slate-800">{selectedVariantLabel}</p>
                  <p className={`mt-2 text-xs font-bold ${inStock ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {inStock
                      ? t(`${remainingStock} available to add`, `${remainingStock} متاح للإضافة`)
                      : t('Unavailable right now', 'غير متوفر الآن')}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                {purchaseSignals.map((item) => (
                  <div key={item.label} className="rounded-[20px] border border-stone-200 bg-white/88 px-3.5 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                    <p className="mt-1 text-sm font-bold text-slate-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Offer countdown Ã¢â‚¬â€ live timer */}
            {hasSavings && selected.offerEndsAt && (
              <OfferCountdown endsAt={selected.offerEndsAt} locale={locale} />
            )}

            {/* Stock badge */}
            {inStock && lowStock && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                {t(`Only ${remainingStock} left to add`, `باقي ${remainingStock} فقط للإضافة`)}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[24px] border border-stone-200 bg-[#faf7f1] px-4 py-3">
                <p className="text-[11px] font-bold text-slate-400">{t('Availability', '\u0627\u0644\u062a\u0648\u0641\u0631')}</p>
                <p className={`mt-1 text-sm font-black ${inStock ? 'text-emerald-600' : 'text-red-500'}`}>
                  {inStock ? t('In stock', '\u0645\u062a\u0648\u0641\u0631') : t('Sold out', '\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631')}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {inStock
                    ? t(`${remainingStock} available to add`, `${remainingStock} متاح للإضافة`)
                    : t('No units available right now', 'لا توجد وحدات متاحة حاليًا')}
                </p>
              </div>
              <div className="rounded-[24px] border border-stone-200 bg-[#faf7f1] px-4 py-3">
                <p className="text-[11px] font-bold text-slate-400">{t('Branch', '\u0627\u0644\u0641\u0631\u0639')}</p>
                <p className="mt-1 text-sm font-black text-slate-800">#{branchId}</p>
              </div>
              <div className="rounded-[24px] border border-stone-200 bg-[#faf7f1] px-4 py-3 col-span-2 sm:col-span-1">
                <p className="text-[11px] font-bold text-slate-400">{t('Option', '\u0627\u0644\u062e\u064a\u0627\u0631')}</p>
                <p className="mt-1 text-sm font-black text-slate-800 truncate">
                  {selectedVariantLabel}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {serviceHighlights.map((item) => (
                <div key={item.label} className="rounded-[24px] border border-stone-200 bg-white px-4 py-3.5">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-600">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="h-px w-full bg-slate-200" />

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
                        <span className="text-sm font-black text-slate-800">
                          {attrName}
                        </span>
                        {currentVal && (
                          <span className="text-sm text-slate-500 font-medium bg-slate-100
                            px-2.5 py-0.5 rounded-full">
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
                                    ? 'ring-3 ring-offset-2 ring-slate-800 scale-110 shadow-lg'
                                    : avail
                                      ? 'ring-1 ring-black/15 hover:scale-110 hover:shadow-md hover:ring-slate-400'
                                      : 'ring-1 ring-black/10'
                                  }`}
                                  style={{ backgroundColor: hex }}>
                                  {/* checkmark Ã™â€žÃ™â€žÃ™â€¦Ã˜Â­Ã˜Â¯Ã˜Â¯ */}
                                  {isSel && (() => {
                                    const isDark = isColorDark(hex)
                                    return (
                                      <div className="w-full h-full flex items-center justify-center rounded-full">
                                        <svg className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-900'}`}
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
                                <span className={`text-[10px] font-bold max-w-[48px] text-center leading-tight
                                  ${isSel ? 'text-slate-900' : 'text-slate-500'}`}>
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
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.05]'
                                    : avail
                                      ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-800 hover:bg-slate-50'
                                      : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                  }`}>
                                {!inStk && avail && (
                                  <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-full h-px bg-slate-400 absolute rotate-[-15deg]" />
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
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                                    : avail
                                      ? 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50'
                                      : 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                  }`}>
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
                <p className="text-sm font-black text-slate-700 mb-3">
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
                            ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                            : avail
                              ? 'bg-white text-slate-700 border-slate-200 hover:border-slate-800'
                              : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                          }`}>
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
                <div className="w-full h-px bg-slate-200" />
                <div className="rounded-[28px] border border-stone-200 bg-[#faf7f1] px-5 py-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    {t('Description', '\u0627\u0644\u0648\u0635\u0641')}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{desc}</p>
                </div>
              </>
            )}

            <div className="w-full h-px bg-slate-200" />

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50
                border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                <svg className="w-4 h-4 flex-shrink-0" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Qty + Add to Cart */}
            <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-20 md:static">
              <div className="rounded-[32px] border border-stone-200 bg-white/95 p-2.5 shadow-[0_18px_34px_rgba(15,23,42,0.12)] backdrop-blur md:rounded-[30px] md:border md:bg-[#faf7f1] md:p-4 md:shadow-none">
                <div className="mb-3 flex items-center justify-between rounded-[24px] border border-stone-200 bg-white px-3 py-3 md:mb-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">{t('Selected total', '\u0627\u0644\u0625\u062c\u0645\u0627\u0644\u064a \u0627\u0644\u062d\u0627\u0644\u064a')}</p>
                    <p className="text-base font-black text-slate-900 md:text-lg">
                      {(selected.currentPrice * qty).toFixed(2)} {currencyLabel}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">{selectedVariantLabel}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                      {qty} {t('pcs', '\u0642\u0637\u0639\u0629')}
                    </span>
                    <span className={`text-[11px] font-bold ${inStock ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {inStock ? t('Ready to add', 'جاهز للإضافة') : t('Currently unavailable', 'غير متوفر حاليًا')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
              <div className="flex items-center overflow-hidden rounded-2xl border-2 border-stone-200 bg-white">
                <button type="button" aria-label={t('Decrease quantity', '\u062a\u0642\u0644\u064a\u0644 \u0627\u0644\u0643\u0645\u064a\u0629')} onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="flex h-14 w-12 items-center justify-center text-xl
                    font-bold text-slate-500 transition-colors hover:bg-stone-50
                    hover:text-slate-900">
                  -
                </button>
                <span className="w-10 text-center text-base font-black text-slate-900">
                  {qty}
                </span>
                <button type="button" aria-label={t('Increase quantity', '\u0632\u064a\u0627\u062f\u0629 \u0627\u0644\u0643\u0645\u064a\u0629')} onClick={() => setQty(q => Math.min(
                    maxSelectableQty, q + 1
                  ))}
                  disabled={!inStock || qty >= maxSelectableQty}
                  className="flex h-14 w-12 items-center justify-center text-xl
                    font-bold text-slate-500 transition-colors hover:bg-stone-50
                    hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300">
                  +
                </button>
              </div>

              <button onClick={handleAddToCart}
                disabled={adding || !inStock}
                className={`flex-1 h-14 rounded-2xl font-black text-base
                  transition-all duration-300 flex items-center justify-center gap-3
                  ${added
                    ? 'bg-green-500 text-white'
                    : !inStock
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : adding
                        ? 'bg-slate-300 text-slate-500'
                        : 'bg-slate-900 text-white hover:bg-amber-500 shadow-lg hover:shadow-amber-200 active:scale-[0.98]'
                  }`}>
                {adding ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : added ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('Added!', '\u062a\u0645\u062a \u0627\u0644\u0625\u0636\u0627\u0641\u0629!')}
                  </>
                ) : !inStock ? (
                  t('Out of stock', '\u0646\u0641\u062f \u0627\u0644\u0645\u062e\u0632\u0648\u0646')
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {t('Add to Cart', '\u0623\u0636\u0641 \u0644\u0644\u0633\u0644\u0629')}
                  </>
                )}
              </button>
                </div>

                <div className="mt-3 grid gap-2 md:hidden">
                  <div className="rounded-[22px] border border-stone-200 bg-[#faf7f1] px-3.5 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                      {t('Purchase note', 'ملاحظة الشراء')}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">
                      {t(
                        'Choose your exact option first, then confirm quantity before adding to cart.',
                        'اختر خيارك الدقيق أولًا، ثم أكد الكمية قبل الإضافة إلى السلة.'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Zoom Modal Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {zoomed && imgSrc && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomed(false)}>

          <button
            className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10
              hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10"
            onClick={() => setZoomed(false)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {allImages.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + allImages.length) % allImages.length) }}
                className="absolute start-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                  bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % allImages.length) }}
                className="absolute end-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                  bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative w-full max-w-3xl aspect-square"
            onClick={e => e.stopPropagation()}
            onTouchStart={e => {
              touchStartX.current = e.touches[0].clientX
              touchStartY.current = e.touches[0].clientY
            }}
            onTouchEnd={e => {
              if (touchStartX.current === null) return
              const dx = e.changedTouches[0].clientX - touchStartX.current
              if (Math.abs(dx) > 40) {
                if (dx < 0) setActiveImg(i => (i + 1) % allImages.length)
                else        setActiveImg(i => (i - 1 + allImages.length) % allImages.length)
              }
              touchStartX.current = null
            }}>
            <Image
              src={imgSrc}
              alt={name}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, idx) => (
                <button key={idx}
                  onClick={e => { e.stopPropagation(); setActiveImg(idx) }}
                  className={`w-1.5 h-1.5 rounded-full transition-all
                    ${activeImg === idx ? 'bg-white scale-125' : 'bg-white/40'}`} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ã¢â€â‚¬Ã¢â€â‚¬ Related Products Ã¢â€â‚¬Ã¢â€â‚¬ */}
      {product && (
        <RelatedProducts
          categoryId={product.categoryId}
          branchId={branchId}
          currentProductId={product.id}
          locale={locale}
          t={t}
        />
      )}
    </div>
  )
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Related Products Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

function RelatedProducts({ categoryId, currentProductId, locale, t, branchId }: {
  categoryId: number
  currentProductId: number
  locale: string
  t: (en: string, ar: string) => string
  branchId: number
}) {
  const [items, setItems] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const currencyLabel = getCurrencyLabel(locale)
  const relatedCacheRef = useRef<Map<string, ProductSummary[]>>(new Map())
  const relatedReqIdRef = useRef(0)

  useEffect(() => {
    const cacheKey = `${branchId}:${categoryId}:${currentProductId}`
    const cachedItems = relatedCacheRef.current.get(cacheKey)
    if (cachedItems) {
      setItems(cachedItems)
      setLoading(false)
      return
    }

    const reqId = ++relatedReqIdRef.current
    setLoading(true)
    productApi.list({
      branchId,
      categoryId,
      page: 1,
      limit: 7,
      sort: 'newest',
    })
      .then((data) => {
        if (reqId !== relatedReqIdRef.current) return
        const filtered = (data.items ?? [])
          .filter((item) => item.id !== currentProductId)
          .slice(0, 6)
        relatedCacheRef.current.set(cacheKey, filtered)
        setItems(filtered)
      })
      .catch(() => {})
      .finally(() => {
        if (reqId === relatedReqIdRef.current) setLoading(false)
      })
  }, [categoryId, currentProductId, branchId])

  if (!loading && items.length === 0) return null

  return (
    <div className="mx-auto max-w-7xl border-t border-stone-200 px-4 py-12 md:px-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg md:text-xl font-black text-slate-900">
          {t('You might also like', '\u0642\u062f \u064a\u0639\u062c\u0628\u0643 \u0623\u064a\u0636\u0627\u064b')}
        </h2>
        <Link href={`/shop?category=${categoryId}&branch=${branchId}`}
          className="text-xs font-bold text-amber-600 transition-colors hover:text-amber-700">
          {t('View all', '\u0639\u0631\u0636 \u0627\u0644\u0643\u0644')} &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-100" />
              <div className="p-2.5 space-y-2">
                <div className="h-3 bg-slate-100 rounded" />
                <div className="h-3 w-16 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6">
          {items.map(item => {
            const name   = locale === 'ar' ? (item.nameAr || item.nameEn) : item.nameEn
            const brand  = locale === 'ar' ? (item.brandNameAr || item.brandNameEn || item.brand) : (item.brandNameEn || item.brandNameAr || item.brand)
            const imgSrc = buildStoreImageUrl(item.imagePath)
            const hasOffer = item.hasActiveOffer && item.minCurrentPrice < item.minPrice

            return (
              <Link
                key={item.id}
                href={`/product?id=${item.id}&branch=${branchId}`}
                className="group bg-white rounded-2xl border border-slate-100 overflow-hidden
                  hover:border-slate-200 hover:shadow-md transition-all duration-200">

                {/* Image */}
                <div className="relative aspect-square bg-slate-50 overflow-hidden">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 16vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {hasOffer && (
                    <span className="absolute top-2 start-2 bg-red-600 text-white
                      text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      {t('Offer', 'عرض')}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-2.5">
                  {brand && (
                    <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wider truncate mb-0.5">
                      {brand}
                    </p>
                  )}
                  <p className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug mb-1.5">
                    {name}
                  </p>
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="text-sm font-black text-slate-900">
                      {item.minCurrentPrice.toFixed(2)}
                      <span className="text-[10px] font-normal text-slate-400 ms-0.5">{currencyLabel}</span>
                    </span>
                    {hasOffer && (
                      <span className="text-[10px] line-through text-slate-400">
                        {item.minPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
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
        <div className="aspect-square rounded-3xl bg-slate-200" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-16 h-16 rounded-xl bg-slate-200" />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-5 pt-2">
        <div className="h-3 w-16 bg-slate-200 rounded-full" />
        <div className="h-9 bg-slate-200 rounded-xl" />
        <div className="h-10 w-40 bg-slate-200 rounded-xl" />
        <div className="h-px bg-slate-200" />
        {/* Attribute skeletons */}
        <div className="space-y-5">
          {[1, 2].map(i => (
            <div key={i}>
              <div className="h-4 w-20 bg-slate-200 rounded-full mb-3" />
              <div className="flex gap-2">
                {[1,2,3,4].map(j => (
                  <div key={j} className={i === 1 ? 'w-10 h-10 rounded-full bg-slate-200' : 'w-14 h-10 rounded-xl bg-slate-200'} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="h-14 bg-slate-200 rounded-2xl" />
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

