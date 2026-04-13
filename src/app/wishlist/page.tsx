'use client'

import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/context/auth'
import { useLocale } from '@/context/locale'
import { useCart } from '@/context/cart'
import { useToast } from '@/components/ui/Toaster'
import { wishlistApi } from '@/lib/api'
import { PriceDisplay } from '@/components/ui/PriceDisplay'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'
import type { WishlistItem } from '@/types'

const API_BASE_URL = getPublicApiBaseUrl()

export default function WishlistPage() {
  const router        = useRouter()
  const { token, isLoading: authLoading } = useAuth()
  const { t, locale } = useLocale()
  const { addItem, refreshCart } = useCart()
  const toast         = useToast()

  const [items,    setItems]    = useState<WishlistItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [removing, setRemoving] = useState<number | null>(null)
  const [adding,   setAdding]   = useState<number | null>(null)
  // Track which items were just removed (for exit animation)
  const [exiting,  setExiting]  = useState<Set<number>>(new Set())
  const requestIdRef = useRef(0)
  const [bulkAdding, setBulkAdding] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    const reqId = ++requestIdRef.current
    setLoading(true)
    try {
      const data = await wishlistApi.list(token)
      if (reqId !== requestIdRef.current) return
      startTransition(() => {
        setItems(data.items ?? [])
      })
    } catch {
      if (reqId === requestIdRef.current) {
        toast.error(t('Failed to load wishlist', 'فشل تحميل المفضلة'))
      }
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [token, toast, t])

  useEffect(() => {
    if (authLoading) return
    if (!token) { router.push('/auth/login?redirect=/wishlist'); return }
    void load()
  }, [authLoading, token, router, load])

  async function handleRemove(variantId: number) {
    if (!token) return
    setRemoving(variantId)
    // Start exit animation
    setExiting(prev => new Set(prev).add(variantId))
    try {
      await wishlistApi.remove(token, variantId)
      // Remove after animation
      setTimeout(() => {
        startTransition(() => {
          setItems(prev => prev.filter(i => i.productVariantId !== variantId))
          setExiting(prev => { const s = new Set(prev); s.delete(variantId); return s })
        })
      }, 300)
      toast.success(t('Removed from wishlist', 'تم الحذف من المفضلة'))
    } catch {
      setExiting(prev => { const s = new Set(prev); s.delete(variantId); return s })
      toast.error(t('Failed to remove', 'فشل الحذف'))
    } finally {
      setRemoving(null)
    }
  }

  async function handleAddToCart(item: WishlistItem) {
    const branchId = Number(process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID ?? '1')
    setAdding(item.productVariantId)
    try {
      await addItem(item.productId, item.productVariantId, branchId)
      toast.success(t('Added to cart!', 'أُضيف للسلة!'))
    } catch {
      toast.error(t('Failed to add to cart', 'فشل الإضافة للسلة'))
    } finally {
      setAdding(null)
    }
  }

  async function handleMoveToCart(item: WishlistItem) {
    if (!token) return
    const branchId = Number(process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID ?? '1')
    setAdding(item.productVariantId)
    try {
      await wishlistApi.moveToCart(token, item.productVariantId, branchId)
      await refreshCart()
      startTransition(() => {
        setItems(prev => prev.filter(i => i.productVariantId !== item.productVariantId))
      })
      toast.success(t('Moved to cart!', 'تم نقله للسلة!'))
    } catch {
      toast.error(t('Failed', 'فشلت العملية'))
    } finally {
      setAdding(null)
    }
  }

  const availableCount = items.filter(i => i.isAvailableInAnyBranch).length

  return (
    <div className="min-h-screen bg-[#f8f6f2] py-6 md:py-8">
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between rounded-[32px] border border-stone-200 bg-white/90 p-4 shadow-[0_16px_34px_rgba(15,23,42,0.04)] backdrop-blur md:p-5">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="rounded-xl border border-stone-200 bg-[#faf7f1] p-2 transition-colors hover:bg-stone-100">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900">
                {t('Wishlist', 'المفضلة')}
              </h1>
              {!loading && items.length > 0 && (
                <p className="mt-0.5 text-xs text-slate-400">
                  {items.length} {t('items', 'منتج')}
                  {availableCount < items.length && (
                    <span className="text-amber-500 ms-2">
                      · {items.length - availableCount} {t('out of stock', 'نفد مخزونه')}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Add all available to cart */}
          {!loading && availableCount > 0 && (
            <button
              onClick={async () => {
                const availableItems = items.filter(i => i.isAvailableInAnyBranch)
                if (availableItems.length === 0) return
                setBulkAdding(true)
                try {
                  let addedCount = 0
                  for (const item of availableItems) {
                    try {
                      await addItem(item.productId, item.productVariantId, Number(process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID ?? '1'))
                      addedCount += 1
                    } catch {
                      // Continue adding remaining available items.
                    }
                  }

                  if (addedCount > 0) {
                    toast.success(
                      addedCount === availableItems.length
                        ? t('All available items were added to cart', 'تمت إضافة كل العناصر المتاحة إلى السلة')
                        : t('Some items were added to cart', 'تمت إضافة بعض العناصر إلى السلة')
                    )
                  } else {
                    toast.error(t('Failed to add available items', 'فشلت إضافة العناصر المتاحة'))
                  }
                } finally {
                  setBulkAdding(false)
                }
              }}
              disabled={bulkAdding}
              className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-black text-white transition-colors hover:bg-amber-600 disabled:opacity-60">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {bulkAdding ? t('Adding...', 'جارٍ الإضافة...') : t('Add all', 'إضافة الكل')}
            </button>
          )}
        </div>

        {/* Loading */}
        {loading || authLoading ? (
          <div className="grid sm:grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-36 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>

        /* Empty */
        ) : items.length === 0 ? (
          <div className="rounded-[32px] border border-stone-200 bg-white py-24 text-center shadow-[0_16px_34px_rgba(15,23,42,0.04)]">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center
              justify-center rounded-[26px] bg-[#faf7f1]">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-black text-slate-700 mb-2 text-lg">
              {t('Wishlist is empty', 'المفضلة فارغة')}
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              {t('Save products you love to buy them later', 'احفظ المنتجات التي أعجبتك لتشتريها لاحقاً')}
            </p>
            <Link href="/shop"
              className="inline-block rounded-xl bg-slate-900 px-8 py-3 text-sm font-black text-white transition-colors hover:bg-amber-600">
              {t('Browse Collection', 'تصفح المتجر')}
            </Link>
          </div>

        /* Items Grid */
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {items.map(item => {
              const name    = locale === 'ar'
                ? (item.productNameAr || item.productNameEn)
                : (item.productNameEn || item.productNameAr)
              const variantName = locale === 'ar'
                ? (item.variantNameAr || item.variantNameEn)
                : (item.variantNameEn || item.variantNameAr)
              const imgSrc  = joinUrl(API_BASE_URL, item.imagePath)
              const isExiting = exiting.has(item.productVariantId)

              return (
                <div key={item.id}
                  className={`overflow-hidden rounded-[30px] border border-stone-200 bg-white
                    shadow-[0_16px_34px_rgba(15,23,42,0.04)] transition-all duration-300
                    ${isExiting ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>

                  <div className="flex gap-3 p-3.5">
                    {/* Image — links to product */}
                    <Link
                      href={`/product?id=${item.productId}&variant=${item.productVariantId}`}
                      className="group relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-[#f7f4ee]">
                      {imgSrc ? (
                        <Image src={imgSrc} alt={name} fill className="object-cover
                          group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-7 h-7 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {/* Out of stock badge on image */}
                      {!item.isAvailableInAnyBranch && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="text-[10px] font-black text-slate-500 bg-white
                            px-2 py-0.5 rounded-full border border-slate-200">
                            {t('Out of stock', 'نفد')}
                          </span>
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        {item.brand && (
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-0.5">
                            {item.brand}
                          </p>
                        )}
                        <Link href={`/product?id=${item.productId}&variant=${item.productVariantId}`}>
                          <h3 className="text-sm font-bold text-slate-900 line-clamp-2
                            hover:text-amber-600 transition-colors leading-snug">
                            {name}
                          </h3>
                        </Link>
                        {variantName && (
                          <p className="text-[11px] text-slate-400 mt-0.5">{variantName}</p>
                        )}
                        <div className="mt-1.5">
                          <PriceDisplay
                            basePrice={item.basePrice}
                            currentPrice={item.currentPrice}
                            hasActiveOffer={item.hasActiveOffer}
                            discountPercentage={item.discountPercentage}
                            size="sm"
                          />
                        </div>
                      </div>

                      {/* Actions row */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {/* Add to cart */}
                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={adding === item.productVariantId || !item.isAvailableInAnyBranch}
                          className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all
                            flex items-center justify-center gap-1
                            ${!item.isAvailableInAnyBranch
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : adding === item.productVariantId
                                ? 'bg-slate-200 text-slate-500'
                                : 'bg-slate-900 text-white hover:bg-amber-600'
                            }`}>
                          {adding === item.productVariantId ? (
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            t('Add to Cart', 'أضف للسلة')
                          )}
                        </button>

                        {/* Move to cart (remove from wishlist + add) */}
                        {item.isAvailableInAnyBranch && (
                          <button
                            onClick={() => handleMoveToCart(item)}
                            disabled={adding === item.productVariantId}
                            title={t('Move to cart', 'انقل للسلة')}
                            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        )}

                        {/* Remove */}
                        <button
                          onClick={() => handleRemove(item.productVariantId)}
                          disabled={removing === item.productVariantId}
                          title={t('Remove', 'حذف')}
                          className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500">
                          {removing === item.productVariantId ? (
                            <span className="w-4 h-4 border-2 border-slate-200 border-t-red-400
                              rounded-full animate-spin block" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
