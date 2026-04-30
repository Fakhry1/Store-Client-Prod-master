'use client'
import { memo, useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCart } from '@/context/cart'
import { useLocale } from '@/context/locale'
import { catalogApi } from '@/lib/api'
import { translateApiError } from '@/lib/errors'
import { getCurrencyLabel } from '@/lib/store'
import type { Product, ProductVariant } from '@/types'

type AttrKey = { id: number; nameEn: string; nameAr: string }

type Props = {
  selected: ProductVariant
  product: Product
  branchId: number
  inStock: boolean
  remainingStock: number
  maxSelectableQty: number
  hasAttrs: boolean
  attrKeys: AttrKey[]
  sel: Record<number, string>
}

export const AddToCartPanel = memo(function AddToCartPanel({
  selected,
  product,
  branchId,
  inStock,
  remainingStock,
  maxSelectableQty,
  hasAttrs,
  attrKeys,
  sel,
}: Props) {
  const router = useRouter()
  const sp = useSearchParams()
  const { addItem } = useCart()
  const { locale, t } = useLocale()
  const currencyLabel = getCurrencyLabel(locale)
  const selectedVariantLabel = locale === 'ar' ? (selected.nameAr || selected.nameEn) : selected.nameEn

  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setQty(q => {
      if (!inStock) return 1
      return Math.min(Math.max(1, q), maxSelectableQty)
    })
  }, [inStock, maxSelectableQty, selected.id])

  const handleAddToCart = useCallback(async () => {
    if (!selected || !product) return
    if (hasAttrs && attrKeys.length !== Object.keys(sel).length) {
      setError(t('Please select all options', 'يرجى تحديد جميع الخيارات'))
      return
    }
    if (!selected.isActive || remainingStock <= 0) {
      setError(t('This option is out of stock', 'هذا الخيار غير متوفر'))
      return
    }
    if (qty > remainingStock) {
      setError(t(`Only ${remainingStock} item(s) can be added for this option`, `يمكن إضافة ${remainingStock} قطعة فقط من هذا الخيار`))
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
      const shouldTryFallback =
        !requestedBranch &&
        (message.includes('Product variant not available in this branch') || message.includes('items available'))

      if (shouldTryFallback) {
        const candidates = Array.from(
          new Set([branchId, Number(process.env.NEXT_PUBLIC_DEFAULT_BRANCH_ID ?? '1'), 1, 2, 3, 4, 5])
        ).filter(id => Number.isInteger(id) && id > 0)

        for (const candidateId of candidates) {
          if (candidateId === branchId) continue
          try {
            const availability = await catalogApi.getProductAvailability(candidateId, product.id)
            const match = availability.find(item =>
              item.variantId === selected.id && item.isAvailable && item.quantityInStock >= qty
            )
            if (!match) continue
            await addItem(product.id, selected.id, candidateId, qty)
            setAdded(true)
            setTimeout(() => setAdded(false), 2500)
            setError('')
            router.replace(`/product?id=${product.id}&variant=${selected.id}&branch=${candidateId}`)
            return
          } catch {
            // try next candidate
          }
        }
      }

      setError(translateApiError(message || t('Failed to add to cart', 'فشلت إضافة المنتج إلى السلة'), t))
    } finally {
      setAdding(false)
    }
  }, [selected, product, branchId, qty, hasAttrs, attrKeys, sel, remainingStock, addItem, router, sp, t])

  return (
    <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-20 md:static">
      <div
        className="rounded-[32px] border bg-white/95 p-2.5 backdrop-blur md:rounded-[30px] md:border md:p-4"
        style={{ borderColor: 'var(--line)', boxShadow: '0 18px 34px rgba(10,31,68,0.12)' }}
      >
        <div
          className="mb-3 flex items-center justify-between rounded-[24px] border bg-white px-3 py-3 md:mb-4"
          style={{ borderColor: 'var(--line)' }}
        >
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em]" style={{ color: 'var(--mute)' }}>
              {t('Selected total', 'الإجمالي الحالي')}
            </p>
            <p className="text-base font-black md:text-lg" style={{ color: 'var(--ink)' }}>
              {(selected.currentPrice * qty).toFixed(2)} {currencyLabel}
            </p>
            <p className="mt-0.5 text-[11px]" style={{ color: 'var(--mute)' }}>{selectedVariantLabel}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full px-3 py-1 text-xs font-bold shadow-sm" style={{ background: 'var(--paper-2)', color: 'var(--mute)' }}>
              {qty} {t('pcs', 'قطعة')}
            </span>
            <span className={`text-[11px] font-bold ${inStock ? 'text-emerald-600' : 'text-rose-500'}`}>
              {inStock ? t('Ready to add', 'جاهز للإضافة') : t('Currently unavailable', 'غير متوفر حاليًا')}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex items-center overflow-hidden rounded-2xl border-2 bg-white" style={{ borderColor: 'var(--line)' }}>
            <button
              type="button"
              aria-label={t('Decrease quantity', 'تقليل الكمية')}
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="flex h-14 w-12 items-center justify-center text-xl font-bold transition-colors"
              style={{ color: 'var(--mute)' }}
            >-</button>
            <span className="w-10 text-center text-base font-black" style={{ color: 'var(--ink)' }}>{qty}</span>
            <button
              type="button"
              aria-label={t('Increase quantity', 'زيادة الكمية')}
              onClick={() => setQty(q => Math.min(maxSelectableQty, q + 1))}
              disabled={!inStock || qty >= maxSelectableQty}
              className="flex h-14 w-12 items-center justify-center text-xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: 'var(--mute)' }}
            >+</button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || !inStock}
            className={`flex-1 h-14 rounded-2xl font-black text-base transition-all duration-300 flex items-center justify-center gap-3
              ${added ? 'bg-green-500 text-white' : !inStock ? 'cursor-not-allowed' : ''}`}
            style={added
              ? undefined
              : !inStock
                ? { background: 'var(--paper-2)', color: 'var(--mute)' }
                : adding
                  ? { background: 'var(--paper-2)', color: 'var(--mute)' }
                  : { background: 'var(--ink)', color: '#fff', boxShadow: '0 8px 24px rgba(10,31,68,0.20)' }
            }
          >
            {adding ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : added ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {t('Added!', 'تمت الإضافة!')}
              </>
            ) : !inStock ? (
              t('Out of stock', 'نفد المخزون')
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {t('Add to Cart', 'أضف للسلة')}
              </>
            )}
          </button>
        </div>

        <div className="mt-3 grid gap-2 md:hidden">
          <div className="rounded-[22px] border px-3.5 py-3" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
            <p className="text-[10px] font-black uppercase tracking-[0.16em]" style={{ color: 'var(--mute)' }}>
              {t('Purchase note', 'ملاحظة الشراء')}
            </p>
            <p className="mt-1 text-sm font-semibold leading-6" style={{ color: 'var(--mute)' }}>
              {t(
                'Choose your exact option first, then confirm quantity before adding to cart.',
                'اختر خيارك الدقيق أولًا، ثم أكد الكمية قبل الإضافة إلى السلة.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})
