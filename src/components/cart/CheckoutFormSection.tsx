'use client'

import { PhoneNumberField } from '@/components/forms/PhoneNumberField'
import { getCurrencyLabel } from '@/lib/store'
import type { CustomerAddress } from '@/types'

type CheckoutFormSectionProps = {
  t: (en: string, ar: string) => string
  name: string
  setName: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  notes: string
  setNotes: (v: string) => void
  payment: number
  setPayment: (v: number) => void
  fulfillment: 'pickup' | 'delivery'
  addresses: CustomerAddress[]
  selectedAddr: number | null
  setSelectedAddr: (v: number) => void
  onAddAddress: () => void
  locale: string
  deliveryFee: number
}

function Field({ label, value, onChange, type = 'text', required, placeholder, textarea }: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  textarea?: boolean
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

export default function CheckoutFormSection({
  t,
  name,
  setName,
  phone,
  setPhone,
  notes,
  setNotes,
  payment,
  setPayment,
  fulfillment,
  addresses,
  selectedAddr,
  setSelectedAddr,
  onAddAddress,
  locale,
  deliveryFee,
}: CheckoutFormSectionProps) {
  const isDelivery = fulfillment === 'delivery'

  return (
    <div className="space-y-3">
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
            <span className="font-black text-amber-900">{deliveryFee.toFixed(2)} {getCurrencyLabel(locale)}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
        <h3 className="font-black text-slate-900 mb-4 text-sm flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-black flex-shrink-0">3</span>
          {t('Payment Method', 'طريقة الدفع')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 1, icon: '💵', label: t('Cash', 'كاش'), sub: t('On pickup', 'عند الاستلام') },
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

      <div className="bg-white rounded-2xl border border-slate-100 p-4 md:p-5">
        <Field label={t('Notes (optional)', 'ملاحظات (اختياري)')} value={notes} onChange={setNotes}
          textarea placeholder={t('Any special requests...', 'أي طلبات خاصة...')} />
      </div>
    </div>
  )
}
