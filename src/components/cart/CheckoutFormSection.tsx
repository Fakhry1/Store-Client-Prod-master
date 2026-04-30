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
  const baseCls = 'w-full px-4 py-3 text-sm border rounded-xl focus:outline-none transition-all bg-white'
  const baseStyle = { borderColor: 'var(--line)', color: 'var(--ink)' }
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--orange)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = 'var(--line)'
  }
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-wider mb-1.5" style={{ color: 'var(--mute)' }}>{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
            placeholder={placeholder} className={`${baseCls} resize-none`} style={baseStyle}
            onFocus={onFocus as any} onBlur={onBlur as any} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)}
            required={required} placeholder={placeholder} className={baseCls} style={baseStyle}
            onFocus={onFocus} onBlur={onBlur} />
      }
    </div>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-black flex-shrink-0"
      style={{ background: 'var(--ink)' }}>{n}</span>
  )
}

export default function CheckoutFormSection({
  t, name, setName, phone, setPhone,
  notes, setNotes, payment, setPayment,
  fulfillment, addresses, selectedAddr, setSelectedAddr,
  onAddAddress, locale, deliveryFee,
}: CheckoutFormSectionProps) {
  const isDelivery = fulfillment === 'delivery'

  return (
    <div className="space-y-3">
      {/* Contact Info */}
      <div className="bg-white rounded-2xl border p-4 md:p-5" style={{ borderColor: 'var(--line)' }}>
        <h3 className="font-black mb-4 text-sm flex items-center gap-2" style={{ color: 'var(--ink)' }}>
          <StepBadge n={1} />
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
      <div className="bg-white rounded-2xl border p-4 md:p-5" style={{ borderColor: 'var(--line)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-sm flex items-center gap-2" style={{ color: 'var(--ink)' }}>
            <StepBadge n={2} />
            {isDelivery ? t('Delivery Address', 'عنوان التوصيل') : t('Pickup Address', 'عنوان الاستلام')}
          </h3>
          <button onClick={onAddAddress}
            className="text-xs font-bold flex items-center gap-1 transition-colors"
            style={{ color: 'var(--orange)' }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            {t('Add new', 'إضافة جديد')}
          </button>
        </div>

        {addresses.length === 0 ? (
          <button onClick={onAddAddress}
            className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed transition-all group"
            style={{ borderColor: 'var(--line)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
              style={{ background: 'var(--paper)' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--mute)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-start">
              <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{t('Add an address', 'أضف عنواناً')}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--mute)' }}>{t('Tap here', 'اضغط هنا')}</p>
            </div>
          </button>
        ) : (
          <div className="space-y-2">
            {addresses.map(addr => (
              <label key={addr.id}
                className="flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
                style={selectedAddr === addr.id
                  ? { borderColor: 'var(--ink)', background: 'var(--paper)' }
                  : { borderColor: 'var(--line)' }}>
                <input type="radio" checked={selectedAddr === addr.id}
                  onChange={() => setSelectedAddr(addr.id)} className="mt-0.5" style={{ accentColor: 'var(--ink)' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold" style={{ color: 'var(--ink)' }}>{addr.label}</p>
                    {addr.isDefault && (
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,107,44,0.12)', color: 'var(--orange)' }}>
                        {t('Default', 'افتراضي')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--mute)' }}>{addr.street}, {addr.city}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        {isDelivery && (
          <div className="mt-3 p-3 rounded-xl flex items-center justify-between text-xs"
            style={{ background: 'rgba(255,107,44,0.08)', border: '1px solid rgba(255,107,44,0.2)' }}>
            <span className="font-bold" style={{ color: 'var(--orange)' }}>{t('Delivery fee', 'رسوم التوصيل')}</span>
            <span className="font-black" style={{ color: 'var(--ink)' }}>{deliveryFee.toFixed(2)} {getCurrencyLabel(locale)}</span>
          </div>
        )}
      </div>

      {/* Payment */}
      <div className="bg-white rounded-2xl border p-4 md:p-5" style={{ borderColor: 'var(--line)' }}>
        <h3 className="font-black mb-4 text-sm flex items-center gap-2" style={{ color: 'var(--ink)' }}>
          <StepBadge n={3} />
          {t('Payment Method', 'طريقة الدفع')}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 1, icon: '💵', label: t('Cash', 'كاش'), sub: t('On pickup', 'عند الاستلام') },
            { id: 2, icon: '💳', label: t('Bankak', 'بنكك'), sub: t('Bank App', 'تطبيق بنكي') },
          ].map(p => (
            <label key={p.id}
              className="flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all"
              style={payment === p.id
                ? { borderColor: 'var(--ink)', background: 'var(--paper)' }
                : { borderColor: 'var(--line)' }}>
              <input type="radio" checked={payment === p.id} onChange={() => setPayment(p.id)}
                style={{ accentColor: 'var(--ink)' }} />
              <div>
                <p className="text-lg leading-none">{p.icon}</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--ink)' }}>{p.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--mute)' }}>{p.sub}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border p-4 md:p-5" style={{ borderColor: 'var(--line)' }}>
        <Field label={t('Notes (optional)', 'ملاحظات (اختياري)')} value={notes} onChange={setNotes}
          textarea placeholder={t('Any special requests...', 'أي طلبات خاصة...')} />
      </div>
    </div>
  )
}
