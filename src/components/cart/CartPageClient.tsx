'use client'

import { startTransition, useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/cart'
import { useAuth } from '@/context/auth'
import { useLocale } from '@/context/locale'
import { PhoneNumberField } from '@/components/forms/PhoneNumberField'
import { promoApi, orderApi, addressApi, walletApi } from '@/lib/api'
import type { PromoResult, CustomerAddress, CartItem, Cart, CustomerWalletDetails } from '@/types'
import { formatInternationalPhoneForDisplay } from '@/lib/phone'
import { getCurrencyLabel } from '@/lib/store'
import { getPublicApiBaseUrl, joinUrl } from '@/lib/url'

const AddressModal = dynamic(() => import('@/components/AddressModal'), {
  loading: () => null,
})

const API_URL = getPublicApiBaseUrl()
const DELIVERY_FEE = 20

type CartStep = 'cart' | 'checkout' | 'review'

type CartPageClientProps = {
  initialStep?: CartStep
}

const TERMS_ROUTE = '/terms'

// â”€â”€â”€ Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TrashIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function ChevronRight({ className = 'w-4 h-4', flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg className={`${className} ${flip ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function CheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function TagIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
    </svg>
  )
}

// â”€â”€â”€ Toast â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Toast({ open, message, tone = 'error', onClose }: {
  open: boolean; message: string; tone?: 'error' | 'success' | 'info'; onClose: () => void
}) {
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(onClose, 3500)
    return () => window.clearTimeout(id)
  }, [open, onClose])

  if (!open) return null

  const bg = tone === 'success' ? 'bg-emerald-600' : tone === 'info' ? 'bg-slate-900' : 'bg-red-600'

  return (
    <div className="fixed inset-x-0 bottom-20 md:bottom-6 z-50 px-4 pointer-events-none">
      <div className={`mx-auto max-w-sm ${bg} text-white rounded-2xl shadow-2xl pointer-events-auto`}>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="text-base font-black">{tone === 'success' ? '✓' : tone === 'info' ? 'ℹ' : '!'}</span>
          <p className="text-sm font-bold flex-1 leading-snug">{message}</p>
          <button onClick={onClose} className="text-white/70 hover:text-white font-black text-lg leading-none">×</button>
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Bottom Sheet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function BottomSheet({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white pt-3 pb-2 px-4">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto" />
        </div>
        <div className="px-4 pb-8">{children}</div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Step Indicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StepIndicator({ step, t }: {
  step: 'cart' | 'checkout' | 'review'
  t: (en: string, ar: string) => string
}) {
  const steps = [
    { key: 'cart',     label: t('Cart', 'السلة'),      icon: '🛒' },
    { key: 'checkout', label: t('Details', 'البيانات'), icon: '📋' },
    { key: 'review',   label: t('Review', 'المراجعة'),  icon: '👀' },
  ] as const
  const currentIdx = steps.findIndex(s => s.key === step)

  return (
    <div className="flex items-center justify-center mb-6">
      {steps.map((s, i) => {
        const done   = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300
                ${done   ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                  : active ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/25'
                  : 'bg-slate-100 text-slate-400'}`}>
                {done ? '✓' : s.icon}
              </div>
              <span className={`text-[10px] font-black tracking-wide hidden sm:block
                ${active ? 'text-slate-900' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className={`w-12 md:w-20 h-0.5 mx-1 transition-all duration-500
                ${i < currentIdx ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// â”€â”€â”€ Promo Code Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PromoSection({ promo, setPromo, promoResult, promoLoading, onApply, onRemove, t, locale }: {
  promo: string
  setPromo: (v: string) => void
  promoResult: PromoResult | null
  promoLoading: boolean
  onApply: () => void
  onRemove: () => void
  t: (en: string, ar: string) => string
  locale: string
}) {
  const [expanded, setExpanded] = useState(!!promoResult?.isValid)

  const applied = promoResult?.isValid === true
  const failed  = promoResult && !promoResult.isValid
  const currencyLabel = getCurrencyLabel(locale)

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300
      ${applied ? 'border-emerald-200' : 'border-dashed border-slate-200'}`}>

      {/* âœ… FIX: Ø§Ø³ØªØ¨Ø¯Ù„ <button> Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠ Ø¨Ù€ <div> Ù„ØªØ¬Ù†Ø¨ button Ø¯Ø§Ø®Ù„ button */}
      <div
        onClick={() => !applied && setExpanded(e => !e)}
        role={!applied ? 'button' : undefined}
        tabIndex={!applied ? 0 : undefined}
        onKeyDown={!applied ? (e) => e.key === 'Enter' && setExpanded(v => !v) : undefined}
        className={`w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-start
          ${applied ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50 cursor-pointer'}`}
      >
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
          ${applied ? 'bg-emerald-100' : 'bg-slate-100'}`}>
          <TagIcon className={`w-4 h-4 ${applied ? 'text-emerald-600' : 'text-slate-500'}`} />
        </div>

        <div className="flex-1 min-w-0">
          {applied ? (
            <>
              <p className="text-sm font-black text-emerald-700">{t('Promo Applied', 'تم تطبيق الكود')} 🎉</p>
              <p className="text-xs text-emerald-600 font-bold truncate">
                {t('You saved', 'وفّرت')} {(promoResult!.discountAmount ?? 0).toFixed(2)} {currencyLabel}
              </p>
            </>
          ) : (
            <p className="text-sm font-bold text-slate-700">{t('Have a promo code?', 'لديك كود خصم؟')}</p>
          )}
        </div>

        {/* âœ… FIX: Ø²Ø± Ø§Ù„Ø¥Ø²Ø§Ù„Ø© Ø§Ù„Ø¢Ù† Ø¯Ø§Ø®Ù„ div ÙˆÙ„ÙŠØ³ Ø¯Ø§Ø®Ù„ button */}
        {applied ? (
          <button
            onClick={e => { e.stopPropagation(); onRemove() }}
            className="flex-shrink-0 text-xs font-black text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
          >
            {t('Remove', 'حذف')}
          </button>
        ) : (
          <div className={`w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}>
            <svg className="w-2.5 h-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Input area */}
      {!applied && expanded && (
        <div className="bg-white px-4 pb-4 pt-3 border-t border-slate-100">
          <div className="flex gap-2">
            <div className={`flex-1 flex items-center gap-2 rounded-xl border-2 px-3 transition-all min-w-0
              ${failed ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 focus-within:border-slate-900 focus-within:bg-white'}`}>
              <span className="text-base flex-shrink-0">🏷️</span>
              <input
                value={promo}
                onChange={e => setPromo(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && onApply()}
                placeholder={t('ENTER CODE', 'أدخل الكود')}
                className="flex-1 py-3 text-sm font-black outline-none bg-transparent tracking-widest w-full placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-300"
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
              />
              {promo && (
                <button onClick={() => setPromo('')} className="text-slate-300 hover:text-slate-500 transition-colors flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={onApply}
              disabled={promoLoading || !promo.trim()}
              className="flex-shrink-0 px-4 py-3 bg-slate-900 text-white text-sm font-black rounded-xl hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.97] flex items-center gap-1.5 whitespace-nowrap"
            >
              {promoLoading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : t('Apply', 'تطبيق')
              }
            </button>
          </div>

          {failed && (
            <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-100">
              <span className="flex-shrink-0">✕</span>
              <span>{promoResult!.errorMessage || t('Invalid promo code', 'كود الخصم غير صالح')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function TermsConsentCard({
  agreed,
  onToggle,
  t,
}: {
  agreed: boolean
  onToggle: (nextValue: boolean) => void
  t: (en: string, ar: string) => string
}) {
  return (
    <div className="rounded-[28px] border border-stone-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)] md:p-5">
      <div className="flex items-start gap-3">
        <label className="mt-0.5 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => onToggle(event.target.checked)}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-slate-900 focus:ring-amber-400"
          />
          <div className="space-y-1.5">
            <p className="text-sm font-black text-slate-900">
              {t('I agree to the Terms & Conditions', 'أوافق على الشروط والأحكام')}
            </p>
            <p className="text-xs leading-6 text-slate-500">
              {t(
                'This includes order eligibility, cancellation, replacement, return, wallet, delivery, and promo usage policies.',
                'يشمل ذلك سياسات الطلبات والإلغاء والاستبدال والاسترجاع والمحفظة والتوصيل واستخدام العروض.'
              )}
            </p>
            <Link
              href={TERMS_ROUTE}
              className="inline-flex items-center gap-1 text-xs font-black text-amber-700 transition-colors hover:text-amber-600"
            >
              {t('Read full Terms & Conditions', 'قراءة الشروط والأحكام كاملة')}
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </label>
      </div>
    </div>
  )
}

// â”€â”€â”€ Order Summary Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function OrderSummaryCard({
  cart, subtotal, discount, vat, deliveryFee, finalTotal,
  step, promo, setPromo, promoResult, promoLoading, onApplyPromo, onRemovePromo,
  onProceed, placing, hasOut, name, phone, selectedAddr,
  walletBalance, walletLoading, useWalletBalance, onToggleWallet, walletApplied, amountDue,
  agreedToTerms, t, locale, isRTL, orderError
}: {
  cart: Cart | null; subtotal: number; discount: number; vat: number
  deliveryFee: number; finalTotal: number; step: 'cart' | 'checkout' | 'review'
  promo: string; setPromo: (v: string) => void; promoResult: PromoResult | null
  promoLoading: boolean; onApplyPromo: () => void; onRemovePromo: () => void
  onProceed: () => void; placing: boolean; hasOut: boolean
  name: string; phone: string; selectedAddr: number | null
  walletBalance: number; walletLoading: boolean; useWalletBalance: boolean
  onToggleWallet: (nextValue: boolean) => void; walletApplied: number; amountDue: number
  agreedToTerms: boolean
  t: (en: string, ar: string) => string; locale: string; isRTL: boolean; orderError: string
}) {
  const canProceed = step === 'cart'
    ? !hasOut && !!cart && cart.items.length > 0
    : step === 'checkout'
    ? !!name && !!phone && !!selectedAddr
    : !!cart && cart.items.length > 0
  const currencyLabel = getCurrencyLabel(locale)

  return (
    <div className="overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_18px_38px_rgba(15,23,42,0.06)]">
      <div className="border-b border-stone-200 bg-[#faf7f1] px-5 pb-4 pt-5">
        <h3 className="font-black text-slate-900 text-base">{t('Order Summary', 'ملخص الطلب')}</h3>
      </div>

      <div className="space-y-4 px-5 py-4">
        {/* Mini items */}
        {cart && cart.items.length > 0 && (
          <div className="space-y-2.5">
            {cart.items.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex-shrink-0 overflow-hidden relative border border-slate-100">
                  {item.imagePath ? (
                    <Image src={joinUrl(API_URL, item.imagePath) || '/placeholder.jpg'}
                      alt="" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 truncate">
                    {locale === 'ar' ? item.productNameAr || item.productNameEn : item.productNameEn}
                  </p>
                  <p className="text-[10px] text-slate-400">×{item.quantity}</p>
                </div>
                <span className="text-xs font-black text-slate-800 flex-shrink-0">
                  {item.itemTotal.toFixed(2)}
                </span>
              </div>
            ))}
            {cart.items.length > 3 && (
              <p className="text-[11px] text-slate-400 text-center font-medium">
                +{cart.items.length - 3} {t('more', 'منتجات أخرى')}
              </p>
            )}
          </div>
        )}

        {/* Promo â€” cart step only */}
        {step === 'cart' && (
          <PromoSection
            promo={promo} setPromo={setPromo}
            promoResult={promoResult} promoLoading={promoLoading}
            onApply={onApplyPromo} onRemove={onRemovePromo} t={t} locale={locale}
          />
        )}

        {/* Totals */}
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">{t('Subtotal', 'المجموع الفرعي')}</span>
            <span className="font-semibold text-slate-800">{subtotal.toFixed(2)} {currencyLabel}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between font-black text-emerald-600">
              <span className="flex items-center gap-1">
                <TagIcon className="w-3.5 h-3.5" />
                {t('Discount', 'الخصم')}
              </span>
              <span>−{discount.toFixed(2)} {currencyLabel}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">{t('VAT 15%', 'ضريبة 15%')}</span>
            <span className="font-semibold text-slate-800">{vat.toFixed(2)} {currencyLabel}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">{t('Delivery', 'توصيل')}</span>
              <span className="font-semibold text-slate-800">{deliveryFee.toFixed(2)} {currencyLabel}</span>
            </div>
          )}
          {(walletBalance > 0 || walletLoading) && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-emerald-700">{t('Wallet balance', 'رصيد المحفظة')}</p>
                  <p className="mt-1 text-sm font-bold text-emerald-900">
                    {walletLoading ? t('Loading...', 'جارٍ التحميل...') : `${walletBalance.toFixed(2)} ${currencyLabel}`}
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-emerald-600"
                    checked={useWalletBalance}
                    disabled={walletLoading || walletBalance <= 0}
                    onChange={e => onToggleWallet(e.target.checked)}
                  />
                  <span>{t('Use wallet', 'استخدام المحفظة')}</span>
                </label>
              </div>

              {useWalletBalance && walletApplied > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-emerald-100 pt-3 text-xs">
                  <div className="flex justify-between font-bold text-emerald-700">
                    <span>{t('Applied from wallet', 'المستخدم من المحفظة')}</span>
                    <span>−{walletApplied.toFixed(2)} {currencyLabel}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>{t('Remaining due', 'المتبقي للدفع')}</span>
                    <span className="font-black text-slate-900">{amountDue.toFixed(2)} {currencyLabel}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Total */}
        <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <span className="font-black text-slate-900">{t('Total', 'الإجمالي')}</span>
          <div className="text-end">
            <span className="text-2xl font-black text-slate-900">{amountDue.toFixed(2)}</span>
            <span className="text-sm text-slate-400 ms-1">{currencyLabel}</span>
            {useWalletBalance && walletApplied > 0 && (
              <p className="mt-1 text-[11px] font-bold text-slate-400">
                {t('Gross total', 'الإجمالي قبل المحفظة')}: {finalTotal.toFixed(2)} {currencyLabel}
              </p>
            )}
          </div>
        </div>

        {step === 'review' && !agreedToTerms && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3">
            <p className="text-xs font-black text-amber-900">
              {t('Accept the terms before confirming the order.', 'وافق على الشروط قبل تأكيد الطلب.')}
            </p>
          </div>
        )}

        {orderError && (
          <div className="px-3 py-2.5 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-bold">
            {orderError}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onProceed}
          disabled={!canProceed || placing}
          className={`w-full rounded-2xl py-4 text-sm font-black transition-all duration-300
            flex items-center justify-center gap-2 active:scale-[0.98]
            ${step === 'review'
              ? 'bg-amber-500 hover:bg-amber-400 text-white shadow-lg shadow-amber-500/30'
              : 'bg-slate-900 hover:bg-amber-500 text-white shadow-lg shadow-slate-900/20'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {placing ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('Placing order...', 'جاري التأكيد...')}
            </>
          ) : step === 'cart' ? (
            <>{t('Proceed to Checkout', 'متابعة الدفع')}<ChevronRight className="w-4 h-4" flip={isRTL} /></>
          ) : step === 'checkout' ? (
            <>{t('Review Order', 'مراجعة الطلب')}<ChevronRight className="w-4 h-4" flip={isRTL} /></>
          ) : (
            <><CheckIcon className="w-4 h-4" />{t('Confirm Order', 'تأكيد الطلب')}</>
          )}
        </button>

        <p className="text-[10px] text-slate-400 text-center">
          🔒 {t('Secure & encrypted checkout', 'دفع آمن ومشفر')}
        </p>
      </div>
    </div>
  )
}

// â”€â”€â”€ Cart Item Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CartItemRow({ item, onUpdate, onRemove, locale, t }: {
  item: CartItem; onUpdate: (qty: number) => Promise<void>; onRemove: () => Promise<void>
  locale: string; t: (en: string, ar: string) => string
}) {
  const [removing,   setRemoving]   = useState(false)
  const [imgError,   setImgError]   = useState(false)
  const [sheetOpen,  setSheetOpen]  = useState(false)
  const [busyQty,    setBusyQty]    = useState(false)

  const imgSrc      = !imgError && item.imagePath ? joinUrl(API_URL, item.imagePath) : null
  const productName = locale === 'ar' ? item.productNameAr || item.productNameEn : item.productNameEn
  const variantName = locale === 'ar' ? item.variantNameAr || item.variantNameEn : item.variantNameEn
  const isOut       = !item.isAvailable || item.stockQuantity < item.quantity

  async function handleRemove() {
    if (removing) return
    setRemoving(true)
    try { await onRemove() } finally { setRemoving(false) }
  }

  async function safeUpdate(qty: number) {
    if (busyQty) return
    setBusyQty(true)
    try { await onUpdate(qty) } finally { setBusyQty(false) }
  }

  return (
    <>
      <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300
        ${removing ? 'opacity-30 scale-[0.97] pointer-events-none' : ''}
        ${isOut ? 'border-red-200' : 'border-slate-100'}`}>

        {isOut && (
          <div className="px-3 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2">
            <span className="text-red-500 text-xs flex-shrink-0">⚠</span>
            <p className="text-xs font-black text-red-700">
              {t('Out of stock or exceeds quantity', 'غير متوفر أو تتجاوز الكمية المتاحة')}
            </p>
          </div>
        )}

        <div className="p-3 flex gap-3">
          {/* Image */}
          <div className="relative w-[68px] h-[68px] flex-shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
            {imgSrc ? (
              <Image src={imgSrc} alt={productName ?? ''} fill sizes="68px"
                className="object-cover" onError={() => setImgError(true)} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1">
              <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 flex-1">{productName}</h4>
              <button
                onClick={() => setSheetOpen(true)}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                aria-label={t('Remove', 'حذف')}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>

            {variantName && (
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{variantName}</p>
            )}

            <div className="flex items-center justify-between mt-2">
              {/* Price */}
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-sm font-black text-slate-900 truncate">
                  {item.itemTotal.toFixed(2)}
                  <span className="text-[11px] font-normal text-slate-400 ms-0.5">{getCurrencyLabel(locale)}</span>
                </span>
                {item.hasActiveOffer && (
                  <span className="text-[11px] text-slate-400 line-through hidden xs:inline">
                    {(item.basePrice * item.quantity).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Qty Stepper */}
              <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex-shrink-0">
                <button
                  onClick={() => item.quantity > 1 ? safeUpdate(item.quantity - 1) : undefined}
                  disabled={item.quantity <= 1 || busyQty}
                  className="w-9 h-9 flex items-center justify-center text-base font-black text-slate-500 active:bg-slate-200 transition-colors disabled:opacity-30"
                >−</button>
                <span className="w-8 text-center text-sm font-black text-slate-900 border-x border-slate-200">
                  {busyQty
                    ? <span className="inline-block w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                    : item.quantity}
                </span>
                <button
                  onClick={() => safeUpdate(Math.min(item.stockQuantity, 10, item.quantity + 1))}
                  disabled={item.quantity >= Math.min(item.stockQuantity, 10) || busyQty}
                  className="w-9 h-9 flex items-center justify-center text-base font-black text-slate-500 active:bg-slate-200 transition-colors disabled:opacity-30"
                >+</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
        <div className="text-center pt-2 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <TrashIcon className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-base font-black text-slate-900 mb-1">{t('Remove item?', 'حذف المنتج؟')}</h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            <span className="font-bold text-slate-700">{productName}</span>
            <br />{t('will be removed from your cart.', 'سيتم حذفه من سلتك.')}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setSheetOpen(false)}
              className="py-3.5 bg-slate-100 text-slate-700 font-black rounded-2xl active:scale-[0.98]">
              {t('Cancel', 'إلغاء')}
            </button>
            <button onClick={() => { handleRemove(); setSheetOpen(false) }}
              className="py-3.5 bg-red-600 text-white font-black rounded-2xl active:scale-[0.98] shadow-lg shadow-red-500/30">
              {t('Remove', 'حذف')}
            </button>
          </div>
        </div>
      </BottomSheet>
    </>
  )
}

// â”€â”€â”€ Checkout Form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CheckoutForm({ t, name, setName, phone, setPhone, notes, setNotes, payment, setPayment,
  fulfillment, addresses, selectedAddr, setSelectedAddr, onMount, onAddAddress }: {
  t: (en: string, ar: string) => string
  name: string; setName: (v: string) => void; phone: string; setPhone: (v: string) => void
  notes: string; setNotes: (v: string) => void; payment: number; setPayment: (v: number) => void
  fulfillment: 'pickup' | 'delivery'; addresses: CustomerAddress[]
  selectedAddr: number | null; setSelectedAddr: (v: number) => void
  onMount: (force?: boolean) => Promise<void>; onAddAddress: () => void
}) {
  useEffect(() => { void onMount() }, [onMount])
  const isDelivery = fulfillment === 'delivery'

  return (
    <div className="space-y-3">
      {/* Contact */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
        <h3 className="font-black text-slate-900 mb-4 text-sm flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-black flex-shrink-0">1</span>
          {t('Contact Info', 'بيانات التواصل')}
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label={t('Full Name', 'الاسم الكامل')} value={name} onChange={setName}
            required placeholder={t('Your name', 'اسمك')} />
          <PhoneNumberField
            label={t('Phone', 'الجوال')}
            value={phone}
            onChange={setPhone}
            required
            hint={t('Country code and local number are saved together', 'يتم حفظ مفتاح الدولة والرقم معًا')}
          />
        </div>
      </div>

      {/* Address */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-black flex-shrink-0">2</span>
            {isDelivery ? t('Delivery Address', 'عنوان التوصيل') : t('Pickup Address', 'عنوان الاستلام')}
          </h3>
          <button onClick={onAddAddress}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {t('Add new', 'إضافة جديد')}
          </button>
        </div>

        {addresses.length === 0 ? (
          <button onClick={onAddAddress}
            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-amber-100 flex items-center justify-center flex-shrink-0 transition-colors">
              <svg className="w-5 h-5 text-slate-400 group-hover:text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-start">
              <p className="text-sm font-bold text-slate-700">{t('Add an address', 'أضف عنواناً')}</p>
              <p className="text-xs text-slate-400 mt-0.5">{t('Tap here', 'اضغط هنا')}</p>
            </div>
          </button>
        ) : (
          <div className="space-y-2">
            {addresses.map(addr => (
              <label key={addr.id}
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all
                  ${selectedAddr === addr.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" checked={selectedAddr === addr.id}
                  onChange={() => setSelectedAddr(addr.id)} className="mt-0.5 accent-slate-900" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-800">{addr.label}</p>
                    {addr.isDefault && (
                      <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                        {t('Default', 'افتراضي')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">{addr.street}, {addr.city}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {isDelivery && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
            <span className="font-bold text-amber-800">{t('Delivery fee', 'رسوم التوصيل')}</span>
            <span className="font-black text-amber-900">{DELIVERY_FEE.toFixed(2)} {getCurrencyLabel('ar')}</span>
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
        <h3 className="font-black text-slate-900 mb-4 text-sm flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-black flex-shrink-0">3</span>
          {t('Payment Method', 'طريقة الدفع')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 1, icon: '💵', label: t('Cash', 'كاش'),   sub: t('On pickup', 'عند الاستلام') },
            { id: 2, icon: '💳', label: t('Bankak', 'بنكك'), sub: t('Bank App', 'تطبيق بنكي') },
          ].map(p => (
            <label key={p.id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all
                ${payment === p.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <input type="radio" checked={payment === p.id} onChange={() => setPayment(p.id)} className="accent-slate-900" />
              <div>
                <p className="text-lg leading-none">{p.icon}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{p.label}</p>
                <p className="text-[10px] text-slate-400">{p.sub}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
        <Field label={t('Notes (optional)', 'ملاحظات (اختياري)')} value={notes} onChange={setNotes}
          textarea placeholder={t('Any special requests...', 'أي طلبات خاصة...')} />
      </div>
    </div>
  )
}

// â”€â”€â”€ Order Review â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function OrderReview({ cart, name, phone, payment, addresses, selectedAddr, promoResult,
  fulfillment, locale, t }: {
  cart: Cart | null; name: string; phone: string; payment: number
  addresses: CustomerAddress[]; selectedAddr: number | null
  promoResult: PromoResult | null; fulfillment: 'pickup' | 'delivery'
  locale: string; t: (en: string, ar: string) => string
}) {
  const addr      = addresses.find(a => a.id === selectedAddr)
  const isDelivery = fulfillment === 'delivery'
  const items = cart?.items ?? []

  const displayPhone = formatInternationalPhoneForDisplay(phone)
  const currencyLabel = getCurrencyLabel(locale)
  return (
    <div className="space-y-3">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
        <span className="text-2xl">👀</span>
        <div>
          <p className="font-black text-amber-900 text-sm">{t('Review before confirming', 'راجع طلبك قبل التأكيد')}</p>
          <p className="text-xs text-amber-700 mt-0.5">{t('Last chance to make changes', 'آخر فرصة للتعديل')}</p>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-black text-slate-900 text-sm mb-3">{t('Products', 'المنتجات')} ({items.length})</h3>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden relative">
                {item.imagePath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={joinUrl(API_URL, item.imagePath) ?? ''} alt=""
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {locale === 'ar' ? item.productNameAr || item.productNameEn : item.productNameEn}
                </p>
                <p className="text-[11px] text-slate-400">
                  {locale === 'ar' ? item.variantNameAr || item.variantNameEn : item.variantNameEn}
                  {' · '}{t('Qty', 'الكمية')}: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-black text-slate-900 flex-shrink-0">{item.itemTotal.toFixed(2)}</span>
            </div>
          ))}
          {items.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm font-bold text-slate-500">
              {t('Cart items are still loading. Please wait a moment.', 'عناصر السلة ما زالت قيد التحميل. انتظر لحظة من فضلك.')}
            </div>
          )}
        </div>
      </div>

      {/* Fulfillment + Address */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-black text-slate-900 text-sm mb-3">
          {isDelivery ? t('Delivery Details', 'تفاصيل التوصيل') : t('Pickup Details', 'تفاصيل الاستلام')}
        </h3>
        <div className="flex items-center gap-2 text-sm font-bold mb-3 p-3 bg-slate-50 rounded-xl">
          <span>{isDelivery ? '🚚' : '🏪'}</span>
          <span className="text-slate-800">{isDelivery ? t('Delivery', 'توصيل') : t('Pickup', 'استلام')}</span>
        </div>
        {addr && (
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 mb-0.5">{t('Address', 'العنوان')}</p>
            <p className="text-sm font-bold text-slate-800">{addr.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{addr.street}, {addr.city}</p>
          </div>
        )}
      </div>

      {/* Contact + Payment */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-black text-slate-900 text-sm mb-3">{t('Contact & Payment', 'التواصل والدفع')}</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: t('Name', 'الاسم'), value: name },
            { label: t('Phone', 'الجوال'), value: displayPhone },
            { label: t('Payment', 'الدفع'), value: payment === 1 ? `💵 ${t('Cash', 'كاش')}` : `💳 ${t('Bankak', 'بنكك')}` },
          ].map(row => (
            <div key={row.label} className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[11px] text-slate-400 mb-0.5">{row.label}</p>
              <p className="text-sm font-bold text-slate-800 truncate">{row.value}</p>
            </div>
          ))}
        </div>
      </div>

      {promoResult?.isValid && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-bold text-emerald-700">
            {t('Promo applied', 'كود الخصم مُطبَّق')} — {t('Saved', 'وفّرت')} {(promoResult.discountAmount ?? 0).toFixed(2)} {currencyLabel}
          </p>
        </div>
      )}
    </div>
  )
}

// â”€â”€â”€ Field â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Field({ label, value, onChange, type = 'text', required, placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; required?: boolean; placeholder?: string; textarea?: boolean
}) {
  const cls = 'w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all bg-white placeholder:text-slate-300'
  return (
    <div>
      <label className="block text-xs font-black text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
            placeholder={placeholder} className={`${cls} resize-none`} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)}
            required={required} placeholder={placeholder} className={cls} />
      }
    </div>
  )
}

// â”€â”€â”€ Main Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function CartPageClient({ initialStep = 'cart' }: CartPageClientProps) {
  const router = useRouter()
  const { cart, updateItem, removeItem, isLoading, refreshCart } = useCart()
  const { token, user }  = useAuth()
  const { t, locale }    = useLocale()
  const isRTL = (locale as string) === 'ar'

  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup')
  const [promo, setPromo]             = useState('')
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)

  const [toastOpen, setToastOpen]   = useState(false)
  const [toastMsg, setToastMsg]     = useState('')
  const [toastTone, setToastTone]   = useState<'error' | 'success' | 'info'>('error')

  const [step, setStep] = useState<CartStep>(initialStep)
  const [placing, setPlacing]       = useState(false)
  const [orderError, setOrderError] = useState('')

  const [name, setName]     = useState(user ? `${user.firstName} ${user.lastName}` : '')
  const [phone, setPhone]   = useState(user?.phoneNumber ?? '')
  const [notes, setNotes]   = useState('')
  const [payment, setPayment] = useState(1)
  const [walletDetails, setWalletDetails] = useState<CustomerWalletDetails | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [useWalletBalance, setUseWalletBalance] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [addresses, setAddresses]       = useState<CustomerAddress[]>([])
  const [selectedAddr, setSelectedAddr] = useState<number | null>(null)
  const [addrLoaded, setAddrLoaded]     = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const addrLoadedRef = useRef(false)
  const walletReqIdRef = useRef(0)

  const hasOut = !!cart?.items?.some(i => !i.isAvailable || i.stockQuantity < i.quantity)

  useEffect(() => {
    addrLoadedRef.current = false
    setAddrLoaded(false)
    setAddresses([])
    setSelectedAddr(null)
  }, [token])

  const loadAddresses = useCallback(async (force = false) => {
    if (!token || (addrLoadedRef.current && !force)) return
    try {
      const res  = await addressApi.list(token)
      const list = (res as any)?.addresses ?? []
      const def = list.find((a: any) => a.isDefault) ?? list[0]
      startTransition(() => {
        setAddresses(list)
        setSelectedAddr((prev) => {
          if (prev && list.some((addr: CustomerAddress) => addr.id === prev)) {
            return prev
          }
          return def ? def.id : null
        })
      })
      addrLoadedRef.current = true
      setAddrLoaded(true)
    } catch {}
  }, [token])

  useEffect(() => {
    if (step === 'checkout' && token) {
      loadAddresses()
      if (user) {
        if (!name)  setName(`${user.firstName} ${user.lastName}`)
        if (!phone) setPhone(user.phoneNumber ?? '')
      }
    }
  }, [step, token, loadAddresses, user, name, phone])

  useEffect(() => {
    const reqId = ++walletReqIdRef.current

    async function loadWallet() {
      if (!token) {
        if (reqId === walletReqIdRef.current) {
          setWalletDetails(null)
          setUseWalletBalance(false)
        }
        return
      }

      setWalletLoading(true)
      try {
        const res = await walletApi.me(token, 10)
        if (reqId === walletReqIdRef.current) {
          startTransition(() => {
            setWalletDetails(res)
            if ((res?.balance ?? 0) <= 0) setUseWalletBalance(false)
          })
        }
      } catch {
        if (reqId === walletReqIdRef.current) {
          setWalletDetails(null)
          setUseWalletBalance(false)
        }
      } finally {
        if (reqId === walletReqIdRef.current) setWalletLoading(false)
      }
    }

    void loadWallet()
  }, [token])

  function showToast(msg: string, tone: 'error' | 'success' | 'info' = 'error') {
    setToastMsg(msg); setToastTone(tone); setToastOpen(true)
  }

  async function handleApplyPromo() {
    if (!promo.trim() || !cart) return
    if (!token) {
      showToast(t('Login first to apply promo codes', 'سجّل الدخول أولاً لتطبيق أكواد الخصم'), 'info')
      router.push('/auth/login?redirect=' + encodeURIComponent('/cart?step=checkout'))
      return
    }
    setPromoLoading(true); setPromoResult(null)
    try {
      const res = await promoApi.validate(token, promo.trim().toUpperCase(), cart.subtotal)
      setPromoResult(res)
      if ((res as any)?.isValid) showToast(t('Promo applied!', 'تم تطبيق الكود! 🎉'), 'success')
    } catch {
      setPromoResult({ isValid: false, errorMessage: t('Failed to validate', 'فشل التحقق') })
    } finally { setPromoLoading(false) }
  }

  function handleRemovePromo() { setPromoResult(null); setPromo('') }

  async function handlePlaceOrder() {
    if (!token) { router.push('/auth/login?redirect=/cart'); return }
    if (!cart) return
    if (!name || !phone) {
      setStep('checkout')
      showToast(t('Please complete your contact information first', 'يرجى إكمال بيانات التواصل أولاً'), 'info')
      return
    }
    if (!selectedAddr) {
      setStep('checkout')
      showToast(
        fulfillment === 'delivery'
          ? t('Please select a delivery address first', 'يرجى اختيار عنوان التوصيل أولاً')
          : t('Please select a pickup address first', 'يرجى اختيار عنوان الاستلام أولاً'),
        'info'
      )
      return
    }
    if (hasOut) { showToast(t('Fix unavailable items first', 'عدّل العناصر غير المتوفرة أولاً'), 'error'); return }
    if (!agreedToTerms) {
      showToast(t('Please accept the Terms & Conditions first', 'يرجى الموافقة على الشروط والأحكام أولاً'), 'info')
      return
    }

    const isDelivery = fulfillment === 'delivery'
    setPlacing(true); setOrderError('')
    try {
      const order = await orderApi.create(token, {
        branchId: cart.items[0]?.branchId ?? 1,
        pickupAddressId: selectedAddr,
        customerName: name, customerPhone: phone,
        paymentMethod: payment,
        customerNotes: notes || undefined,
        promoCode: promoResult?.isValid ? promo.trim().toUpperCase() : undefined,
        useWalletBalance,
        fulfillmentType: isDelivery ? 'delivery' : 'pickup',
        deliveryFee: isDelivery ? DELIVERY_FEE : 0,
        deliveryAddressId: isDelivery ? selectedAddr : undefined,
      } as any)

      // Refresh cart and pass remaining count to orders page when only part of cart was ordered.
      const refreshedCart = await refreshCart(true)
      const remainingItems = refreshedCart?.totalItems ?? 0

      router.push(`/orders?id=${order.id}&new=1${remainingItems > 0 ? `&remaining=${remainingItems}` : ''}`)
    } catch (e: any) {
      const msg = e?.message || t('Failed to place order', 'فشل إنشاء الطلب')
      setOrderError(msg); showToast(msg, 'error')
    } finally { setPlacing(false) }
  }

  function handleProceed() {
    if (step === 'cart') {
      if (hasOut) { showToast(t('Fix unavailable items first', 'عدّل العناصر غير المتوفرة أولاً'), 'error'); return }
      if (!token) { router.push('/auth/login?redirect=' + encodeURIComponent('/cart?step=checkout')); return }
      setStep('checkout'); loadAddresses()
    } else if (step === 'checkout') {
      if (!name || !phone || !selectedAddr) return
      setStep('review')
    } else {
      handlePlaceOrder()
    }
  }

  const discount    = promoResult?.isValid ? (promoResult.discountAmount ?? 0) : 0
  const subtotal    = cart?.subtotal ?? 0
  const deliveryFee = fulfillment === 'delivery' ? DELIVERY_FEE : 0
  const vat         = (subtotal - discount) * 0.15
  const finalTotal  = (subtotal - discount) * 1.15 + deliveryFee
  const walletBalance = walletDetails?.balance ?? 0
  const walletApplied = useWalletBalance ? Math.min(walletBalance, finalTotal) : 0
  const amountDue = Math.max(0, finalTotal - walletApplied)
  const canAdvanceFromCheckout = Boolean(name && phone && selectedAddr)
  const mobileCtaDisabled =
    placing ||
    !cart ||
    (step === 'checkout' && !canAdvanceFromCheckout)
  const mobileCtaLabel =
    step === 'cart'
      ? t('Continue', 'متابعة')
      : step === 'checkout'
        ? t('Review Order', 'مراجعة الطلب')
        : t('Place Order', 'تأكيد الطلب')

  // â”€â”€ Empty state â”€â”€
  if (!isLoading && (!cart || cart.items.length === 0)) {
    return (
      <div className="min-h-[80vh] bg-[#f8f6f2] px-6 text-center">
        <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-[32px] border border-stone-200 bg-white shadow-[0_18px_38px_rgba(15,23,42,0.05)]">
          <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{t('Your cart is empty', 'سلتك فارغة')}</h2>
        <p className="mb-8 max-w-xs text-sm leading-7 text-slate-500">
          {t("Haven't added anything yet", 'لم تضف أي منتجات بعد')}
        </p>
        <Link href="/shop"
          className="rounded-2xl bg-slate-900 px-8 py-4 font-black text-white shadow-lg shadow-slate-900/20 transition-colors hover:bg-amber-500">
          {t('Start Shopping', 'تسوق الآن')}
        </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] pb-28 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-5 md:px-6 md:py-10">

        {/* Header */}
        <div className="mb-5 flex items-center justify-between rounded-[32px] border border-stone-200 bg-white/88 p-4 shadow-[0_16px_34px_rgba(15,23,42,0.04)] backdrop-blur md:p-5">
          <div>
            <h1 className="text-xl md:text-3xl font-black text-slate-900">
              {step === 'cart' ? t('Shopping Cart', 'سلة التسوق')
                : step === 'checkout' ? t('Checkout', 'إتمام الطلب')
                : t('Review Order', 'مراجعة الطلب')}
            </h1>
            {step === 'cart' && cart && (
              <p className="mt-0.5 text-sm text-slate-400">{cart.items.length} {t('items', 'منتج')}</p>
            )}
          </div>

          {step !== 'cart' && (
            <button onClick={() => setStep(step === 'review' ? 'checkout' : 'cart')}
              className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-[#faf7f1] px-3 py-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-900">
              <svg className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              {t('Back', 'رجوع')}
            </button>
          )}
        </div>

        <StepIndicator step={step} t={t} />

        {step === 'cart' && hasOut && (
          <div className="mb-4 flex items-start gap-3 rounded-[28px] border border-red-200 bg-red-50 p-4">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 font-black text-sm">!</div>
            <div>
              <p className="font-black text-red-800 text-sm">{t('Fix items before checkout', 'عدّل السلة قبل المتابعة')}</p>
              <p className="text-xs text-red-600 mt-0.5">{t('Some items unavailable or exceed stock.', 'بعض العناصر غير متوفرة أو تتجاوز المخزون.')}</p>
            </div>
          </div>
        )}

        {/* Layout */}
        <div className="flex flex-col items-start gap-5 lg:grid lg:grid-cols-5">

          {/* Left */}
          <div className="w-full lg:col-span-3 space-y-3">
            {step === 'cart' ? (
              <>
                {/* Fulfillment */}
                <div className="rounded-[30px] border border-stone-200 bg-white p-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
                  <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-400">
                    {t('Fulfillment', 'طريقة الاستلام')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'pickup'   as const, icon: '🏪', label: t('Pickup', 'استلام'),   sub: t('Pay on pickup', 'الدفع عند الاستلام') },
                      { id: 'delivery' as const, icon: '🚚', label: t('Delivery', 'توصيل'), sub: `${DELIVERY_FEE} ${getCurrencyLabel(locale as string)} ${t('flat', 'ثابت')}` },
                    ].map(opt => (
                      <label key={opt.id}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all
                          ${fulfillment === opt.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input type="radio" checked={fulfillment === opt.id}
                          onChange={() => setFulfillment(opt.id)} className="accent-slate-900" />
                        <div>
                          <p className="text-lg leading-none">{opt.icon}</p>
                          <p className="text-sm font-black text-slate-800">{opt.label}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{opt.sub}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Items */}
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-slate-100" />
                    ))
                  : (cart?.items ?? []).map(item => (
                      <CartItemRow
                        key={item.id} item={item}
                        locale={locale as string}
                        t={t as (en: string, ar: string) => string}
                        onRemove={async () => {
                          await removeItem(item.id)
                          showToast(t('Removed from cart', 'تم الحذف من السلة'), 'success')
                        }}
                        onUpdate={async qty => {
                          try { await updateItem(item.id, qty) }
                          catch (e: any) { showToast(e?.message || t('Failed', 'فشل'), 'error'); throw e }
                        }}
                      />
                    ))
                }
              </>
            ) : step === 'checkout' ? (
              <CheckoutForm
                t={t} name={name} setName={setName} phone={phone} setPhone={setPhone}
                notes={notes} setNotes={setNotes} payment={payment} setPayment={setPayment}
                fulfillment={fulfillment} addresses={addresses} selectedAddr={selectedAddr}
                setSelectedAddr={setSelectedAddr} onMount={loadAddresses}
                onAddAddress={() => setShowAddressModal(true)}
              />
            ) : (
              <OrderReview
                cart={cart} name={name} phone={phone} payment={payment}
                addresses={addresses} selectedAddr={selectedAddr} promoResult={promoResult}
                fulfillment={fulfillment} locale={locale as string} t={t}
              />
            )}

            {step === 'review' && (
              <TermsConsentCard agreed={agreedToTerms} onToggle={setAgreedToTerms} t={t} />
            )}
          </div>

          {/* Right: Summary */}
          <div className="w-full lg:col-span-2 lg:sticky lg:top-24">
            <OrderSummaryCard
              cart={cart} subtotal={subtotal} discount={discount} vat={vat}
              deliveryFee={deliveryFee} finalTotal={finalTotal} step={step}
              promo={promo} setPromo={setPromo} promoResult={promoResult}
              promoLoading={promoLoading} onApplyPromo={handleApplyPromo}
              onRemovePromo={handleRemovePromo} onProceed={handleProceed}
              placing={placing} hasOut={hasOut} name={name} phone={phone}
              walletBalance={walletBalance} walletLoading={walletLoading}
              useWalletBalance={useWalletBalance} onToggleWallet={setUseWalletBalance}
              walletApplied={walletApplied} amountDue={amountDue}
              agreedToTerms={agreedToTerms}
              selectedAddr={selectedAddr} t={t} locale={locale as string}
              isRTL={isRTL} orderError={orderError}
            />
          </div>
        </div>
      </div>

        {showAddressModal && token && (
          <AddressModal token={token} onClose={() => setShowAddressModal(false)}
          onSaved={() => { addrLoadedRef.current = false; setAddrLoaded(false); void loadAddresses(true) }} />
        )}

      {cart && cart.items.length > 0 && (
        <div className="lg:hidden fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+3.75rem)] z-40 px-4">
          <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white/95 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.16)] backdrop-blur">
            {step === 'review' && !agreedToTerms && (
              <p className="mb-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-black text-amber-900">
                {t('Accept the Terms & Conditions to enable order confirmation.', 'وافق على الشروط والأحكام لتفعيل تأكيد الطلب.')}
              </p>
            )}
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-400">
                  {step === 'cart'
                    ? t('Cart total', 'إجمالي السلة')
                    : step === 'checkout'
                      ? t('Ready to review', 'جاهز للمراجعة')
                      : t('Final total', 'الإجمالي النهائي')}
                </p>
                <p className="truncate text-sm font-black text-slate-900">
                  {amountDue.toFixed(2)} {getCurrencyLabel(locale as string)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleProceed}
                disabled={mobileCtaDisabled}
                className={`min-w-[148px] rounded-2xl px-4 py-3 text-sm font-black transition-all ${
                  mobileCtaDisabled
                    ? 'bg-slate-200 text-slate-400'
                    : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 active:scale-[0.98]'
                }`}
              >
                {placing ? t('Processing...', 'جارٍ التنفيذ...') : mobileCtaLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast open={toastOpen} message={toastMsg} tone={toastTone} onClose={() => setToastOpen(false)} />
    </div>
  )
}
