'use client'

import { useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PhoneNumberField } from '@/components/forms/PhoneNumberField'
import { useAuth } from '@/context/auth'
import { useLocale } from '@/context/locale'
import { translateApiError } from '@/lib/errors'
import { validateLocalPhoneInput } from '@/lib/phone'

type FieldErrors = Partial<Record<'firstName' | 'phoneNumber' | 'password' | 'confirmPassword' | 'email', string>>

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/shop'
  const { register } = useAuth()
  const { t } = useLocale()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [phoneMeta, setPhoneMeta] = useState({ countryIso: 'SD', localNumber: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const passwordStrength = useMemo(() => {
    if (!form.password) return 0
    let score = form.password.length >= 8 ? 1 : 0
    if (/[A-Z]/.test(form.password)) score += 1
    if (/\d/.test(form.password)) score += 1
    if (/[^A-Za-z0-9]/.test(form.password)) score += 1
    return Math.min(score, 4)
  }, [form.password])

  function setField<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [field]: value }))
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  function validate() {
    const nextErrors: FieldErrors = {}

    if (form.firstName.trim().length < 2) {
      nextErrors.firstName = t('Please enter your name', 'يرجى إدخال اسم العميل')
    }

    nextErrors.phoneNumber =
      validateLocalPhoneInput(phoneMeta.countryIso, phoneMeta.localNumber, t, {
        exactDigits: 9,
        disallowLeadingZero: true,
      }) || ''

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = t('Enter a valid email or leave it empty', 'أدخل بريدًا صحيحًا أو اتركه فارغًا')
    }

    if (form.password.length < 8) {
      nextErrors.password = t('Password must be at least 8 characters', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword = t('Please confirm your password', 'يرجى تأكيد كلمة المرور')
    } else if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = t('Passwords do not match', 'كلمتا المرور غير متطابقتين')
    }

    const cleanedErrors = Object.fromEntries(
      Object.entries(nextErrors).filter(([, value]) => Boolean(value))
    ) as FieldErrors

    setFieldErrors(cleanedErrors)
    return Object.keys(cleanedErrors).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!validate()) return

    setLoading(true)
    try {
      await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim() || undefined,
        email: form.email.trim() || undefined,
        phoneNumber: form.phoneNumber,
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      router.replace(redirect)
    } catch (err: any) {
      setError(translateApiError(err.message || 'Failed to create account', t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f8f2e8_45%,#ffffff_100%)] px-4 py-10 md:py-16">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <section className="order-2 rounded-[32px] border border-stone-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-7 md:p-8 lg:order-1">
          <div className="mb-7">
            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-emerald-700">
              {t('Create Customer Account', 'إنشاء حساب عميل')}
            </span>
            <h1 className="mt-4 text-2xl font-black text-slate-900 md:text-3xl">
              {t('Phone number first', 'رقم الهاتف أولًا')}
            </h1>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              {t(
                'Your name, phone number, and password are required. You can complete the rest of your profile later.',
                'الاسم ورقم الهاتف وكلمة المرور مطلوبة. يمكنك إكمال بقية الملف الشخصي لاحقًا.'
              )}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <PhoneNumberField
              label={t('Phone Number', 'رقم الهاتف')}
              value={form.phoneNumber}
              onChange={(value) => setField('phoneNumber', value)}
              onMetaChange={setPhoneMeta}
              required
              error={fieldErrors.phoneNumber}
              hint={t('Enter 9 digits without starting with 0', 'أدخل 9 خانات بدون أن يبدأ الرقم بـ 0')}
              inputMaxLength={9}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label={t('Customer Name', 'اسم العميل')}
                value={form.firstName}
                onChange={(value) => setField('firstName', value)}
                placeholder={t('How should we address you?', 'كيف تريد أن نخاطبك؟')}
                error={fieldErrors.firstName}
              />
              <Field
                label={t('Last Name (optional)', 'الاسم الأخير (اختياري)')}
                value={form.lastName}
                onChange={(value) => setField('lastName', value)}
                placeholder={t('Family name', 'اسم العائلة')}
              />
            </div>

            <Field
              label={t('Email (optional)', 'البريد الإلكتروني (اختياري)')}
              type="email"
              value={form.email}
              onChange={(value) => setField('email', value)}
              placeholder={t('For receipts and recovery', 'للفواتير واستعادة الحساب')}
              error={fieldErrors.email}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordField
                label={t('Password', 'كلمة المرور')}
                value={form.password}
                onChange={(value) => setField('password', value)}
                showPassword={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                placeholder={t('At least 8 characters', '8 أحرف على الأقل')}
                error={fieldErrors.password}
              />
              <PasswordField
                label={t('Confirm Password', 'تأكيد كلمة المرور')}
                value={form.confirmPassword}
                onChange={(value) => setField('confirmPassword', value)}
                showPassword={showPassword}
                onToggle={() => setShowPassword((value) => !value)}
                placeholder={t('Repeat your password', 'أعد كتابة كلمة المرور')}
                error={fieldErrors.confirmPassword}
              />
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black text-slate-800">{t('Password strength', 'قوة كلمة المرور')}</p>
                <span className="text-xs font-bold text-slate-400">
                  {passwordStrength <= 1
                    ? t('Weak', 'ضعيفة')
                    : passwordStrength === 2
                      ? t('Fair', 'متوسطة')
                      : passwordStrength === 3
                        ? t('Good', 'جيدة')
                        : t('Strong', 'قوية')}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {[1, 2, 3, 4].map((level) => (
                  <span
                    key={level}
                    className={`h-2 rounded-full ${
                      level <= passwordStrength
                        ? passwordStrength <= 1
                          ? 'bg-rose-400'
                          : passwordStrength === 2
                            ? 'bg-amber-400'
                            : 'bg-emerald-500'
                        : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-black text-white transition-all hover:bg-amber-600 disabled:opacity-60"
            >
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
              {loading ? t('Creating account...', 'جارٍ إنشاء الحساب...') : t('Create Account', 'إنشاء الحساب')}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-500">
            {t('Already have an account?', 'لديك حساب بالفعل؟')}{' '}
            <Link
              href={`/auth/login${redirect !== '/shop' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="font-black text-amber-700 hover:text-amber-800"
            >
              {t('Sign in', 'تسجيل الدخول')}
            </Link>
          </div>
        </section>

        <section className="order-1 overflow-hidden rounded-[36px] border border-stone-200 bg-slate-900 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] lg:order-2">
          <div className="p-7 sm:p-8">
            <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-white/70">
              {t('Fast Onboarding', 'بدء سريع')}
            </div>
            <h2 className="mt-5 text-3xl font-black leading-tight">
              {t('A simpler registration flow built for mobile.', 'تسجيل أبسط مصمم للموبايل.')}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/70">
              {t(
                'Start with the essentials now, then add more profile details whenever you want.',
                'ابدأ بالبيانات الأساسية الآن، ثم أضف بقية تفاصيل الملف الشخصي لاحقًا متى شئت.'
              )}
            </p>
          </div>

          <div className="grid gap-3 border-t border-white/10 bg-white/5 p-7 sm:p-8">
            {[
              {
                en: 'Default country: Sudan',
                ar: 'الدولة الافتراضية: السودان',
                subEn: 'You can switch to any supported country code before submitting.',
                subAr: 'يمكنك تغيير مفتاح الدولة لأي خيار مدعوم قبل الإرسال.',
              },
              {
                en: 'Required customer name',
                ar: 'اسم العميل مطلوب',
                subEn: 'Orders and profile updates will use the same name from the start.',
                subAr: 'سيتم استخدام الاسم نفسه في الطلبات والملف الشخصي من البداية.',
              },
              {
                en: 'Consistent checkout',
                ar: 'رحلة شراء متسقة',
                subEn: 'Your phone number becomes the main contact across your account and orders.',
                subAr: 'رقم الهاتف يصبح وسيلة التواصل الأساسية في الحساب والطلبات.',
              },
            ].map((item) => (
              <div key={item.en} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-black">{t(item.en, item.ar)}</p>
                <p className="mt-1 text-xs leading-6 text-white/65">{t(item.subEn, item.subAr)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  error?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
          error
            ? 'border-rose-300 ring-2 ring-rose-100'
            : 'border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
        }`}
      />
      {error ? <p className="mt-1.5 text-xs text-rose-500">{error}</p> : null}
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  showPassword,
  onToggle,
  placeholder,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  showPassword: boolean
  onToggle: () => void
  placeholder: string
  error?: string
}) {
  const { t } = useLocale()

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-2xl border bg-white px-4 py-3 pe-14 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 ${
            error
              ? 'border-rose-300 ring-2 ring-rose-100'
              : 'border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 end-3 my-auto h-9 rounded-xl px-2 text-xs font-black text-slate-400 transition-colors hover:text-slate-700"
        >
          {showPassword ? t('Hide', 'إخفاء') : t('Show', 'إظهار')}
        </button>
      </div>
      {error ? <p className="mt-1.5 text-xs text-rose-500">{error}</p> : null}
    </div>
  )
}

