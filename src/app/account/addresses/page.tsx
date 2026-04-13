'use client'

import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth'
import { useLocale } from '@/context/locale'
import { useToast } from '@/components/ui/Toaster'
import { addressApi } from '@/lib/api'
import { translateApiError } from '@/lib/errors'
import type { CustomerAddress } from '@/types'

const EMPTY_FORM = {
  label: '', street: '', district: '', city: '',
  country: 'Sudan', phoneNumber: '', isDefault: false,
}

type FormData = typeof EMPTY_FORM

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
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        dir={dir}
        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl
          bg-stone-50 focus:bg-white
          focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400
          transition-all placeholder:text-slate-400"
      />
    </div>
  )
}

export default function AddressesPage() {
  const router = useRouter()
  const { token, isLoading: authLoading } = useAuth()
  const { t } = useLocale()
  const toast = useToast()

  const [addresses, setAddresses] = useState<CustomerAddress[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const requestIdRef = useRef(0)

  const load = useCallback(async () => {
    if (!token) return
    const reqId = ++requestIdRef.current
    setLoading(true)

    try {
      const res = await addressApi.list(token)
      if (reqId !== requestIdRef.current) return

      startTransition(() => {
        setAddresses(res.addresses ?? [])
      })
    } catch {
      if (reqId === requestIdRef.current) {
        toast.error(t('Failed to load addresses', 'فشل تحميل العناوين'))
      }
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false)
      }
    }
  }, [token, toast, t])

  useEffect(() => {
    if (authLoading) return
    if (!token) {
      router.push('/auth/login')
      return
    }
    void load()
  }, [authLoading, token, router, load])

  function openAdd() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
    setTimeout(() => document.getElementById('addr-label')?.focus(), 50)
  }

  function openEdit(addr: CustomerAddress) {
    setEditId(addr.id)
    setForm({
      label: addr.label,
      street: addr.street,
      district: addr.district ?? '',
      city: addr.city,
      country: addr.country ?? 'Sudan',
      phoneNumber: addr.phoneNumber,
      isDefault: addr.isDefault,
    })
    setShowForm(true)
    setTimeout(() => document.getElementById('addr-label')?.focus(), 50)
  }

  function closeForm() {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
  }

  const set = (field: keyof FormData, value: any) =>
    setForm(f => ({ ...f, [field]: value }))

  async function handleSave() {
    if (!token) return

    if (!form.label.trim()) {
      toast.error(t('Label is required', 'التسمية مطلوبة'))
      return
    }
    if (!form.street.trim()) {
      toast.error(t('Landmark is required', 'المعلم البارز مطلوب'))
      return
    }
    if (!form.city.trim()) {
      toast.error(t('City is required', 'المدينة مطلوبة'))
      return
    }
    if (!form.phoneNumber.trim()) {
      toast.error(t('Phone is required', 'الجوال مطلوب'))
      return
    }

    setSaving(true)

    try {
      const payload = { ...form, country: 'Sudan' }

      if (editId) {
        await addressApi.update(token, editId, payload)
        toast.success(t('Address updated', 'تم تحديث العنوان'))

        startTransition(() => {
          setAddresses((current) =>
            current.map((address) =>
              address.id === editId
                ? {
                    ...address,
                    ...payload,
                    district: form.district || undefined,
                    country: 'Sudan',
                  }
                : form.isDefault
                  ? { ...address, isDefault: false }
                  : address
            )
          )
        })
      } else {
        const created = await addressApi.create(token, payload)
        toast.success(t('Address saved', 'تم حفظ العنوان'))

        const nextAddress = created

        if (nextAddress) {
          startTransition(() => {
            setAddresses((current) => {
              const normalizedCurrent = form.isDefault
                ? current.map((address) => ({ ...address, isDefault: false }))
                : current

              return [nextAddress, ...normalizedCurrent]
            })
          })
        } else {
          await load()
        }
      }

      closeForm()
    } catch (e: any) {
      toast.error(translateApiError(e.message || 'Failed to save', t))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!token) return
    if (!confirm(t('Delete this address?', 'حذف هذا العنوان؟'))) return

    setDeletingId(id)

    try {
      await addressApi.delete(token, id)
      toast.success(t('Address deleted', 'تم حذف العنوان'))

      startTransition(() => {
        setAddresses((current) => current.filter((address) => address.id !== id))
      })
    } catch (e: any) {
      toast.error(translateApiError(e.message || 'Failed to delete', t))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSetDefault(id: number) {
    if (!token) return

    try {
      await addressApi.setDefault(token, id)
      toast.success(t('Default address updated', 'تم تحديث العنوان الافتراضي'))

      startTransition(() => {
        setAddresses((current) =>
          current.map((address) => ({
            ...address,
            isDefault: address.id === id,
          }))
        )
      })
    } catch (e: any) {
      toast.error(translateApiError(e.message || 'Failed', t))
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] py-6 md:py-8">
      <div className="max-w-xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between rounded-[32px] border border-stone-200 bg-white/90 p-4 shadow-[0_16px_34px_rgba(15,23,42,0.04)] backdrop-blur md:p-5">
          <div className="flex items-center gap-3">
            <Link
              href="/account"
              className="rounded-xl border border-stone-200 bg-[#faf7f1] p-2 transition-all hover:bg-stone-100"
            >
              <svg className="w-5 h-5 text-slate-600 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900">{t('My Addresses', 'عناويني')}</h1>
              {addresses.length > 0 && (
                <p className="text-sm text-slate-500">
                  {addresses.length} {t('saved addresses', 'عنوان محفوظ')}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <span className="text-lg leading-none">+</span>
            {t('Add', 'إضافة')}
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm">
                <div className="mb-3 h-5 w-32 rounded bg-stone-200" />
                <div className="mb-2 h-4 w-full rounded bg-stone-100" />
                <div className="h-4 w-2/3 rounded bg-stone-100" />
              </div>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-stone-300 bg-white/80 p-10 text-center shadow-[0_18px_32px_rgba(15,23,42,0.04)]">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-3xl">
              📍
            </div>
            <h2 className="mb-2 text-lg font-black text-slate-900">
              {t('No saved addresses yet', 'لا توجد عناوين محفوظة بعد')}
            </h2>
            <p className="mx-auto mb-6 max-w-sm text-sm leading-6 text-slate-500">
              {t(
                'Save your delivery addresses to speed up checkout and track your orders more easily.',
                'احفظ عناوين التوصيل لتسريع إتمام الطلب ومتابعة طلباتك بسهولة.'
              )}
            </p>
            <button
              onClick={openAdd}
              className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_28px_rgba(245,158,11,0.28)] transition-all hover:-translate-y-0.5 hover:bg-amber-600"
            >
              {t('Add your first address', 'أضف أول عنوان')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="rounded-[30px] border border-stone-200 bg-white p-5 shadow-[0_16px_30px_rgba(15,23,42,0.05)]">
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-slate-900">{addr.label}</h3>
                      {addr.isDefault && (
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                          {t('Default', 'افتراضي')}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {[addr.street, addr.district, addr.city].filter(Boolean).join(', ')}
                    </p>
                    <p className="text-sm text-slate-500">
                      {t('Sudan', 'السودان')}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-slate-700">{addr.phoneNumber}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        {t('Set default', 'تعيين افتراضي')}
                      </button>
                    )}
                    <button
                      onClick={() => openEdit(addr)}
                      className="rounded-xl border border-stone-200 bg-[#faf7f1] px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-stone-100"
                    >
                      {t('Edit', 'تعديل')}
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={deletingId === addr.id}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === addr.id ? t('Deleting...', 'جارٍ الحذف...') : t('Delete', 'حذف')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 md:items-center md:p-4">
            <div className="w-full max-w-xl rounded-t-[32px] border border-stone-200 bg-white p-5 shadow-[0_30px_60px_rgba(15,23,42,0.18)] md:rounded-[32px] md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {editId ? t('Edit Address', 'تعديل العنوان') : t('Add Address', 'إضافة عنوان')}
                  </h2>
                  <p className="text-sm text-slate-500">
                    {t(
                      'Keep your address accurate for smoother delivery.',
                      'احرص على صحة العنوان لتجربة توصيل أسهل.'
                    )}
                  </p>
                </div>
                <button
                  onClick={closeForm}
                  className="rounded-xl border border-stone-200 bg-[#faf7f1] p-2 text-slate-600 transition-colors hover:bg-stone-100"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <InputField
                    label={t('Label', 'التسمية')}
                    value={form.label}
                    onChange={(value) => set('label', value)}
                    placeholder={t('Home, Work...', 'المنزل، العمل...')}
                  />
                </div>

                <div className="md:col-span-2">
                  <InputField
                    label={t('Landmark', 'معلم بارز')}
                    value={form.street}
                    onChange={(value) => set('street', value)}
                    placeholder={t('Nearby landmark', 'وصف المعلم البارز القريب')}
                    dir="auto"
                  />
                </div>

                <InputField
                  label={t('District', 'الحي')}
                  value={form.district}
                  onChange={(value) => set('district', value)}
                  placeholder={t('District', 'الحي')}
                  dir="auto"
                />

                <InputField
                  label={t('City', 'المدينة')}
                  value={form.city}
                  onChange={(value) => set('city', value)}
                  placeholder={t('City', 'المدينة')}
                  dir="auto"
                />

                <div className="md:col-span-2">
                  <InputField
                    label={t('Phone Number', 'رقم الجوال')}
                    value={form.phoneNumber}
                    onChange={(value) => set('phoneNumber', value)}
                    placeholder="0129222222"
                    type="tel"
                    dir="ltr"
                  />
                </div>

                <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-stone-200 bg-[#faf7f1] px-4 py-3 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isDefault}
                    onChange={(e) => set('isDefault', e.target.checked)}
                    className="h-4 w-4 rounded border-stone-300 text-amber-500 focus:ring-amber-400"
                  />
                  {t('Make this my default address', 'اجعل هذا عنواني الافتراضي')}
                </label>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={closeForm}
                  className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-stone-50"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-[0_14px_26px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? t('Saving...', 'جارٍ الحفظ...')
                    : editId
                      ? t('Save changes', 'حفظ التغييرات')
                      : t('Save address', 'حفظ العنوان')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}