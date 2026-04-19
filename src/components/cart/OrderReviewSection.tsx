'use client'

import { formatInternationalPhoneForDisplay } from '@/lib/phone'
import { getCurrencyLabel } from '@/lib/store'
import { joinUrl } from '@/lib/url'
import type { Cart, CustomerAddress, PromoResult } from '@/types'

function TagIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
    </svg>
  )
}

type OrderReviewSectionProps = {
  cart: Cart | null
  name: string
  phone: string
  payment: number
  addresses: CustomerAddress[]
  selectedAddr: number | null
  promoResult: PromoResult | null
  fulfillment: 'pickup' | 'delivery'
  locale: string
  t: (en: string, ar: string) => string
  apiUrl: string
}

export default function OrderReviewSection({
  cart,
  name,
  phone,
  payment,
  addresses,
  selectedAddr,
  promoResult,
  fulfillment,
  locale,
  t,
  apiUrl,
}: OrderReviewSectionProps) {
  const addr = addresses.find(a => a.id === selectedAddr)
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

      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-black text-slate-900 text-sm mb-3">{t('Products', 'المنتجات')} ({items.length})</h3>
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden relative">
                {item.imagePath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={joinUrl(apiUrl, item.imagePath) ?? ''} alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
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
            {t('Promo applied', 'كود الخصم مُطبَّق')} - {t('Saved', 'وفّرت')} {(promoResult.discountAmount ?? 0).toFixed(2)} {currencyLabel}
          </p>
        </div>
      )}
    </div>
  )
}
