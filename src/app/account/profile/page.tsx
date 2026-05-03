'use client'

import { startTransition, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PhoneNumberField } from '@/components/forms/PhoneNumberField'
import { useAuth } from '@/context/auth'
import { useLocale } from '@/context/locale'
import { useToast } from '@/components/ui/Toaster'
import { authApi, orderApi } from '@/lib/api'
import { translateApiError } from '@/lib/errors'
import { getPhoneValidationMessage } from '@/lib/phone'
import { getCurrencyLabel } from '@/lib/store'
import type { Order } from '@/types'

type TabKey = 'profile' | 'security'

const ORDER_STATUS_LABEL: Record<number, { en: string; ar: string; color: string }> = {
  0: { en: 'Pending Review', ar: 'قيد المراجعة', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  1: { en: 'Confirmed', ar: 'تم التأكيد', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  2: { en: 'Preparing', ar: 'قيد التجهيز', color: 'text-violet-700 bg-violet-50 border-violet-200' },
  3: { en: 'Ready / In Delivery', ar: 'جاهز / قيد التوصيل', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  4: { en: 'Completed', ar: 'مكتمل', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  5: { en: 'Cancelled', ar: 'ملغي', color: 'text-rose-700 bg-rose-50 border-rose-200' },
}

export default function ProfilePage() {
  const router = useRouter()
  const toast = useToast()
  const { user, token, logout, updateUser, isLoading } = useAuth()
  const { t, locale } = useLocale()

  const [activeTab, setActiveTab] = useState<TabKey>('profile')
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [phoneError, setPhoneError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const ordersReqIdRef = useRef(0)
  const ordersLoadedRef = useRef(false)

  useEffect(() => {
    ordersLoadedRef.current = false
    setOrders([])
    setOrdersLoading(Boolean(token))
  }, [token])

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.push('/auth/login')
      return
    }

    setFirstName(user.firstName ?? '')
    setLastName(user.lastName ?? '')
    setPhoneNumber(user.phoneNumber ?? '')
  }, [isLoading, router, user])

  useEffect(() => {
    if (!token) return
    if (ordersLoadedRef.current) return

    const reqId = ++ordersReqIdRef.current
    setOrdersLoading(true)
    orderApi.myOrders(token)
      .then((res: any) => {
        if (reqId !== ordersReqIdRef.current) return
        const items = Array.isArray(res) ? res : (res?.orders ?? [])
        ordersLoadedRef.current = true
        startTransition(() => {
          setOrders(items.slice(0, 4))
        })
      })
      .catch(() => {
        if (reqId === ordersReqIdRef.current) {
          ordersLoadedRef.current = true
          setOrders([])
        }
      })
      .finally(() => {
        if (reqId === ordersReqIdRef.current) {
          setOrdersLoading(false)
        }
      })
  }, [token])

  const summary = useMemo(() => {
    const total = orders.length
    const active = orders.filter((order) => order.status < 4 && order.status !== 5).length
    const completed = orders.filter((order) => order.status === 4).length
    return { total, active, completed }
  }, [orders])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--paper)' }}>
        <span className="h-8 w-8 animate-spin rounded-full border-2" style={{ borderColor: 'var(--line)', borderTopColor: 'var(--ink)' }} />
      </div>
    )
  }

  if (!user) return null

  const currentUser = user

  async function handleSaveProfile() {
    if (!token) return

    const nextPhoneError = getPhoneValidationMessage(phoneNumber, t)
    setPhoneError(nextPhoneError)
    if (nextPhoneError) return

    setSavingProfile(true)
    try {
      await authApi.updateProfile(token, {
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        phoneNumber,
      })

      const optimisticUser = {
        ...currentUser,
        firstName: firstName.trim() || currentUser.firstName,
        lastName: lastName.trim() || currentUser.lastName,
        phoneNumber,
      }

      updateUser(optimisticUser)
      toast.success(t('Profile updated successfully', 'تم تحديث الملف الشخصي بنجاح'))

      void authApi.me(token)
        .then((freshUser) => {
          updateUser(freshUser)
        })
        .catch(() => {})
    } catch (err: any) {
      toast.error(translateApiError(err.message || 'Failed to update profile', t))
    } finally {
      setSavingProfile(false)
    }
  }

  async function handleChangePassword() {
    if (!token) return

    if (!currentPassword) {
      toast.error(t('Enter your current password', 'أدخل كلمة المرور الحالية'))
      return
    }
    if (newPassword.length < 8) {
      toast.error(t('New password must be at least 8 characters', 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'))
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('Passwords do not match', 'كلمتا المرور غير متطابقتين'))
      return
    }

    setSavingPassword(true)
    try {
      await authApi.changePassword(token, {
        currentPassword,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast.success(t('Password changed successfully', 'تم تغيير كلمة المرور بنجاح'))
    } catch (err: any) {
      toast.error(translateApiError(err.message || 'Failed to change password', t))
    } finally {
      setSavingPassword(false)
    }
  }

  const displayName = `${firstName || user.firstName || ''} ${lastName || user.lastName || ''}`.trim() || t('Customer Account', 'حساب العميل')
  const initials = `${(firstName || user.firstName || 'C').charAt(0)}${(lastName || user.lastName || 'A').charAt(0)}`.toUpperCase()
  const currencyLabel = getCurrencyLabel(locale)

  return (
    <div className="min-h-screen py-6 md:py-10" style={{ background: 'var(--paper)' }}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-5">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors" style={{ borderColor: 'var(--line)', color: 'var(--mute)' }}
          >
            {t('Back to account', 'العودة إلى الحساب')}
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="overflow-hidden rounded-[34px] border bg-white shadow-[0_20px_50px_rgba(15,23,42,0.07)]" style={{ borderColor: 'var(--line)' }}>
            <div className="px-6 pb-8 pt-7 text-white" style={{ background: 'linear-gradient(135deg, var(--ink), var(--black))' }}>
              <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-white/70">
                {t('My Profile', 'ملفي الشخصي')}
              </div>
              <div className="mt-5 flex items-start gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/12 text-2xl font-black text-white ring-1 ring-white/15">
                  {initials}
                </div>
                <div className="min-w-0 pt-3">
                  <h1 className="truncate text-2xl font-black" style={{ color: '#fff' }}>{displayName}</h1>
                  <p className="mt-1 text-sm text-white/70" dir="ltr">
                    {phoneNumber || user.phoneNumber}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-b px-5 py-5" style={{ borderColor: 'var(--line)' }}>
              {[
                { label: t('Orders', 'الطلبات'), value: summary.total },
                { label: t('Active', 'النشطة'), value: summary.active },
                { label: t('Completed', 'المكتملة'), value: summary.completed },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border p-3 text-center" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
                  <p className="text-xl font-black" style={{ color: 'var(--ink)' }}>{item.value}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--mute)' }}>{item.label}</p>
                </div>
              ))}
            </div>

            <div className="px-5 py-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-sm font-black" style={{ color: 'var(--ink)' }}>{t('Recent orders', 'الطلبات الأخيرة')}</h2>
                <Link href="/orders" className="text-xs font-black" style={{ color: 'var(--orange)' }}>
                  {t('Open all', 'عرض الكل')}
                </Link>
              </div>

              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-16 animate-pulse rounded-2xl" style={{ background: 'var(--paper-2)' }} />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed px-4 py-8 text-center" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--mute)' }}>{t('No orders yet', 'لا توجد طلبات بعد')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const status = ORDER_STATUS_LABEL[order.status] ?? ORDER_STATUS_LABEL[0]
                    const walletApplied = order.walletAmountApplied ?? 0
                    const amountDue = order.amountDue ?? order.total
                    return (
                      <Link
                        key={order.id}
                        href="/orders"
                        className="flex items-center justify-between gap-3 rounded-2xl border bg-white px-4 py-3 transition-colors" style={{ borderColor: 'var(--line)' }}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black" style={{ color: 'var(--ink)' }}>
                            {t('Order', 'طلب')} #{order.orderNumber || order.id}
                          </p>
                          <p className="mt-1 text-xs" style={{ color: 'var(--mute)' }}>
                            {amountDue?.toFixed(2)} {currencyLabel}
                          </p>
                          {walletApplied > 0 && (
                            <p className="mt-1 text-[11px] text-emerald-600">
                              {t('Wallet used', 'تم استخدام المحفظة')} {walletApplied.toFixed(2)} {currencyLabel}
                            </p>
                          )}
                        </div>
                        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.color}`}>
                          {locale === 'ar' ? status.ar : status.en}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {([
                ['profile', t('Profile details', 'بيانات الملف الشخصي')],
                ['security', t('Security', 'الأمان')],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`rounded-full px-4 py-2 text-sm font-black transition-all ${
                    activeTab === key ? 'text-white' : 'border bg-white'
                  }`}
                  style={activeTab === key
                    ? { background: 'var(--ink)' }
                    : { borderColor: 'var(--line)', color: 'var(--mute)' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'profile' ? (
              <div className="rounded-[34px] border bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.07)] sm:p-6" style={{ borderColor: 'var(--line)' }}>
                <div className="mb-6">
                  <h2 className="text-xl font-black" style={{ color: 'var(--ink)' }}>{t('Contact and display details', 'بيانات التواصل والظهور')}</h2>
                  <p className="mt-2 text-sm leading-7" style={{ color: 'var(--mute)' }}>
                    {t(
                      'Your phone number is the required login identifier. Name and email remain optional profile details.',
                      'رقم الهاتف هو وسيلة الدخول الأساسية. الاسم والبريد يظلان بيانات ملف شخصي اختيارية.'
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label={t('First Name (optional)', 'الاسم الأول (اختياري)')}
                      value={firstName}
                      onChange={setFirstName}
                      placeholder={t('How should we address you?', 'كيف نادعوك؟')}
                    />
                    <Field
                      label={t('Last Name (optional)', 'الاسم الأخير (اختياري)')}
                      value={lastName}
                      onChange={setLastName}
                      placeholder={t('Family name', 'اسم العائلة')}
                    />
                  </div>

                  <PhoneNumberField
                    label={t('Phone Number', 'رقم الهاتف')}
                    value={phoneNumber}
                    onChange={(value) => {
                      setPhoneNumber(value)
                      if (phoneError) setPhoneError('')
                    }}
                    required
                    error={phoneError}
                  />

                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black text-white transition-colors disabled:opacity-60" style={{ background: 'var(--ink)' }}
                  >
                    {savingProfile ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
                    {savingProfile ? t('Saving...', 'جارٍ الحفظ...') : t('Save profile', 'حفظ الملف الشخصي')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-[34px] border bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.07)] sm:p-6" style={{ borderColor: 'var(--line)' }}>
                <div className="mb-6">
                  <h2 className="text-xl font-black" style={{ color: 'var(--ink)' }}>{t('Password and session', 'كلمة المرور والجلسة')}</h2>
                  <p className="mt-2 text-sm leading-7" style={{ color: 'var(--mute)' }}>
                    {t(
                      'Update your password here. Use a strong password since your phone number is now the main sign-in identifier.',
                      'حدّث كلمة المرور من هنا. استخدم كلمة مرور قوية لأن رقم الهاتف أصبح وسيلة الدخول الأساسية.'
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  <PasswordField
                    label={t('Current Password', 'كلمة المرور الحالية')}
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    showPasswords={showPasswords}
                    onToggle={() => setShowPasswords((value) => !value)}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <PasswordField
                      label={t('New Password', 'كلمة المرور الجديدة')}
                      value={newPassword}
                      onChange={setNewPassword}
                      showPasswords={showPasswords}
                      onToggle={() => setShowPasswords((value) => !value)}
                    />
                    <PasswordField
                      label={t('Confirm New Password', 'تأكيد كلمة المرور الجديدة')}
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      showPasswords={showPasswords}
                      onToggle={() => setShowPasswords((value) => !value)}
                    />
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={savingPassword}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black text-white transition-colors disabled:opacity-60" style={{ background: 'var(--ink)' }}
                  >
                    {savingPassword ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
                    {savingPassword ? t('Updating password...', 'جارٍ تحديث كلمة المرور...') : t('Change password', 'تغيير كلمة المرور')}
                  </button>

                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm font-black text-rose-700">{t('Need to sign out?', 'تريد تسجيل الخروج؟')}</p>
                    <p className="mt-1 text-xs leading-6 text-rose-600">
                      {t(
                        'You can safely sign out from here after updating your profile or password.',
                        'يمكنك تسجيل الخروج بأمان من هنا بعد تحديث الملف الشخصي أو كلمة المرور.'
                      )}
                    </p>
                    <button
                      onClick={async () => {
                        await logout()
                        router.push('/shop')
                      }}
                      className="mt-3 w-full rounded-2xl border border-rose-300 bg-white px-4 py-3 text-sm font-black text-rose-600 transition-colors hover:bg-rose-100"
                    >
                      {t('Sign Out', 'تسجيل الخروج')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mute)' }}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-[var(--mute)]" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
      />
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  showPasswords,
  onToggle,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  showPasswords: boolean
  onToggle: () => void
}) {
  const { t } = useLocale()

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mute)' }}>{label}</label>
      <div className="relative">
        <input
          type={showPasswords ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border bg-white px-4 py-3 pe-14 text-sm outline-none transition-all placeholder:text-[var(--mute)]" style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 end-3 my-auto h-9 rounded-xl px-2 text-xs font-black transition-colors" style={{ color: 'var(--mute)' }}
        >
          {showPasswords ? t('Hide', 'إخفاء') : t('Show', 'إظهار')}
        </button>
      </div>
    </div>
  )
}






