'use client'

import { useState } from 'react'
import { addressApi } from '@/lib/api'
import { useLocale } from '@/context/locale'
import { useToast } from '@/components/ui/Toaster'
import { translateApiError } from '@/lib/errors'

// ── Types ─────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  label: '', street: '', district: '', city: '',
  country: 'SA', postalCode: '', phoneNumber: '', isDefault: false,
}
type FormData = typeof EMPTY_FORM

interface AddressModalProps {
  token: string
  onClose: () => void
  onSaved: () => void // يُعيد تحميل العناوين بعد الحفظ
}

// ── InputField ────────────────────────────────────────────────────────────────

function InputField({ label, value, onChange, placeholder, type = 'text', dir }: {
  label: string; value: string
  onChange: (v: string) => void
  placeholder?: string; type?: string; dir?: string
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} type={type} dir={dir}
        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl
          bg-stone-50 focus:bg-white focus:outline-none
          focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400
          transition-all placeholder:text-slate-400" />
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function AddressModal({ token, onClose, onSaved }: AddressModalProps) {
  const { t }  = useLocale()
  const toast  = useToast()
  const [form,   setForm]   = useState<FormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const set = (field: keyof FormData, value: any) =>
    setForm(f => ({ ...f, [field]: value }))

  async function handleSave() {
    if (!form.label.trim())       { toast.error(t('Label is required',  'التسمية مطلوبة'));  return }
    if (!form.street.trim())      { toast.error(t('Street is required', 'الشارع مطلوب'));    return }
    if (!form.city.trim())        { toast.error(t('City is required',   'المدينة مطلوبة')); return }
    if (!form.phoneNumber.trim()) { toast.error(t('Phone is required',  'الجوال مطلوب'));    return }

    setSaving(true)
    try {
      await addressApi.create(token, { ...form, country: form.country || 'SA' })
      toast.success(t('Address saved', 'تم حفظ العنوان'))
      onSaved()   // يُعيد تحميل العناوين ويختار الجديد تلقائياً
      onClose()
    } catch (e: any) {
      toast.error(translateApiError(e.message || 'Failed to save', t))
    } finally {
      setSaving(false)
    }
  }

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4
        bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>

      {/* Panel */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl
        border border-slate-100 overflow-hidden
        animate-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4
          border-b border-slate-100">
          <h3 className="font-black text-slate-900 text-base">
            {t('New Address', 'عنوان جديد')}
          </h3>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500
              hover:bg-slate-200 transition-colors flex items-center justify-center
              text-sm font-bold">
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500
                uppercase tracking-wider mb-1.5">
                {t('Label *', 'التسمية *')}
              </label>
              <input
                autoFocus
                value={form.label}
                onChange={e => set('label', e.target.value)}
                placeholder={t('Home, Work...', 'المنزل، العمل...')}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200
                  rounded-xl bg-stone-50 focus:bg-white focus:outline-none
                  focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400
                  transition-all placeholder:text-slate-400" />
            </div>
            <InputField
              label={t('Phone *', 'الجوال *')}
              value={form.phoneNumber}
              onChange={v => set('phoneNumber', v)}
              placeholder="+966 5X XXX XXXX"
              type="tel" dir="ltr" />
          </div>

          <InputField
            label={t('Street *', 'الشارع *')}
            value={form.street}
            onChange={v => set('street', v)}
            placeholder={t('Street name and number', 'اسم الشارع ورقمه')} />

          <div className="grid grid-cols-2 gap-3">
            <InputField
              label={t('District', 'الحي')}
              value={form.district}
              onChange={v => set('district', v)}
              placeholder={t('Neighbourhood', 'اسم الحي')} />
            <InputField
              label={t('City *', 'المدينة *')}
              value={form.city}
              onChange={v => set('city', v)}
              placeholder={t('Riyadh, Jeddah...', 'الرياض، جدة...')} />
          </div>

          <InputField
            label={t('Postal Code', 'الرمز البريدي')}
            value={form.postalCode}
            onChange={v => set('postalCode', v)}
            placeholder="12345" dir="ltr" />

          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input type="checkbox" checked={form.isDefault}
              onChange={e => set('isDefault', e.target.checked)}
              className="w-4 h-4 rounded accent-amber-600" />
            <span className="text-sm font-semibold text-slate-700">
              {t('Set as default address', 'تعيين كعنوان افتراضي')}
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-2">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 bg-slate-900 text-white font-black rounded-2xl
              hover:bg-amber-600 transition-colors text-sm disabled:opacity-60
              flex items-center justify-center gap-2">
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            }
            {t('Save Address', 'حفظ العنوان')}
          </button>
          <button onClick={onClose}
            className="px-5 py-3 border border-slate-200 text-slate-600 font-bold
              rounded-2xl hover:bg-slate-50 transition-colors text-sm">
            {t('Cancel', 'إلغاء')}
          </button>
        </div>
      </div>
    </div>
  )
}

