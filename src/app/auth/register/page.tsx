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

function inferRegisterFieldErrors(message: string, t: (en: string, ar: string) => string): FieldErrors {
  const normalized = (message || '').trim().toLowerCase()
  const hasAny = (terms: string[]) => terms.some((term) => normalized.includes(term))

  const duplicateTerms = ['already exists', 'already registered', 'already in use', 'duplicate', 'taken', 'used', 'exists']

  if (hasAny(['phone', 'phonenumber', 'mobile']) && hasAny(duplicateTerms)) {
    return {
      phoneNumber: t(
        'This phone number is already registered. Try signing in instead.',
        'رقم الهاتف هذا مسجل مسبقًا. جرّب تسجيل الدخول بدلًا من إنشاء حساب جديد.'
      ),
    }
  }

  if (normalized.includes('email') && hasAny(duplicateTerms)) {
    return {
      email: t(
        'This email is already registered. Use another email or sign in.',
        'هذا البريد الإلكتروني مسجل مسبقًا. استخدم بريدًا آخر أو سجّل الدخول.'
      ),
    }
  }

  if (normalized.includes('confirm') && normalized.includes('password')) {
    return { confirmPassword: t('Passwords do not match.', 'كلمتا المرور غير متطابقتين.') }
  }

  if (normalized.includes('password') && (normalized.includes('at least') || normalized.includes('minimum'))) {
    return { password: t('Password must be at least 8 characters.', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.') }
  }

  if (normalized.includes('phone') && normalized.includes('invalid')) {
    return { phoneNumber: t('Phone number format is invalid.', 'تنسيق رقم الهاتف غير صحيح.') }
  }

  if (normalized.includes('email') && normalized.includes('invalid')) {
    return { email: t('Email format is invalid.', 'تنسيق البريد الإلكتروني غير صحيح.') }
  }

  return {}
}

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/shop'
  const { register } = useAuth()
  const { t } = useLocale()

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '', password: '', confirmPassword: '' })
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
    setForm((c) => ({ ...c, [field]: value }))
    if (fieldErrors[field as keyof FieldErrors]) setFieldErrors((c) => ({ ...c, [field]: '' }))
  }

  function validate() {
    const nextErrors: FieldErrors = {}
    if (form.firstName.trim().length < 2) nextErrors.firstName = t('Please enter your name', 'يرجى إدخال اسم العميل')
    nextErrors.phoneNumber = validateLocalPhoneInput(phoneMeta.countryIso, phoneMeta.localNumber, t, { exactDigits: 9, disallowLeadingZero: true }) || ''
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = t('Enter a valid email or leave it empty', 'أدخل بريدًا صحيحًا أو اتركه فارغًا')
    if (form.password.length < 8) nextErrors.password = t('Password must be at least 8 characters', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    if (!form.confirmPassword) nextErrors.confirmPassword = t('Please confirm your password', 'يرجى تأكيد كلمة المرور')
    else if (form.confirmPassword !== form.password) nextErrors.confirmPassword = t('Passwords do not match', 'كلمتا المرور غير متطابقتين')
    const clean = Object.fromEntries(Object.entries(nextErrors).filter(([, v]) => Boolean(v))) as FieldErrors
    setFieldErrors(clean)
    return Object.keys(clean).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      await register({ firstName: form.firstName.trim(), lastName: form.lastName.trim() || undefined, email: form.email.trim() || undefined, phoneNumber: form.phoneNumber, password: form.password, confirmPassword: form.confirmPassword })
      router.replace(redirect)
    } catch (err: any) {
      const rawMessage = err?.message || 'Failed to create account'
      const translated = translateApiError(rawMessage, t)
      const inferredFieldErrors = inferRegisterFieldErrors(rawMessage, t)

      if (Object.keys(inferredFieldErrors).length > 0) {
        setFieldErrors((current) => ({ ...current, ...inferredFieldErrors }))
      }

      setError(translated)
    } finally {
      setLoading(false)
    }
  }

  const strengthColor = passwordStrength <= 1 ? '#ef4444' : passwordStrength === 2 ? '#f59e0b' : '#22c55e'
  const strengthLabel = passwordStrength <= 1 ? t('Weak', 'ضعيفة') : passwordStrength === 2 ? t('Fair', 'متوسطة') : passwordStrength === 3 ? t('Good', 'جيدة') : t('Strong', 'قوية')

  return (
    <div className="min-h-screen px-4 py-10 md:py-16" style={{ background: 'var(--paper)' }}>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.96fr_1.04fr]">

        {/* ── Form panel ── */}
        <section className="order-2 rounded-[32px] border bg-white p-5 shadow-card-lg sm:p-7 md:p-8 lg:order-1"
          style={{ borderColor: 'var(--line)' }}>
          <div className="mb-7">
            <span className="inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em]"
              style={{ background: 'rgba(255,107,44,0.10)', color: 'var(--orange)' }}>
              {t('Create Customer Account', 'إنشاء حساب عميل')}
            </span>
            <h1 className="mt-4 text-2xl font-black md:text-3xl" style={{ color: 'var(--ink)' }}>
              {t('Phone number first', 'رقم الهاتف أولًا')}
            </h1>
            <p className="mt-2 text-sm leading-7" style={{ color: 'var(--mute)' }}>
              {t('Your name, phone number, and password are required. You can complete the rest later.', 'الاسم ورقم الهاتف وكلمة المرور مطلوبة. يمكنك إكمال بقية الملف الشخصي لاحقًا.')}
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
              <FormField label={t('Customer Name', 'اسم العميل')} value={form.firstName} onChange={(v) => setField('firstName', v)} placeholder={t('How should we address you?', 'كيف تريد أن نخاطبك؟')} error={fieldErrors.firstName} />
              <FormField label={t('Last Name (optional)', 'الاسم الأخير (اختياري)')} value={form.lastName} onChange={(v) => setField('lastName', v)} placeholder={t('Family name', 'اسم العائلة')} />
            </div>

            <FormField label={t('Email (optional)', 'البريد الإلكتروني (اختياري)')} type="email" value={form.email} onChange={(v) => setField('email', v)} placeholder={t('For receipts and recovery', 'للفواتير واستعادة الحساب')} error={fieldErrors.email} />

            <div className="grid gap-4 sm:grid-cols-2">
              <PwField label={t('Password', 'كلمة المرور')} value={form.password} onChange={(v) => setField('password', v)} showPassword={showPassword} onToggle={() => setShowPassword((v) => !v)} placeholder={t('At least 8 characters', '8 أحرف على الأقل')} error={fieldErrors.password} />
              <PwField label={t('Confirm Password', 'تأكيد كلمة المرور')} value={form.confirmPassword} onChange={(v) => setField('confirmPassword', v)} showPassword={showPassword} onToggle={() => setShowPassword((v) => !v)} placeholder={t('Repeat your password', 'أعد كتابة كلمة المرور')} error={fieldErrors.confirmPassword} />
            </div>

            {/* Password strength */}
            {form.password && (
              <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black" style={{ color: 'var(--ink)' }}>{t('Password strength', 'قوة كلمة المرور')}</p>
                  <span className="text-xs font-bold" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
                <div className="mt-3 grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((level) => (
                    <span key={level} className="h-1.5 rounded-full transition-all"
                      style={{ background: level <= passwordStrength ? strengthColor : 'var(--paper-2)' }} />
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--orange)' }}
            >
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {loading ? t('Creating account...', 'جارٍ إنشاء الحساب...') : t('Create Account', 'إنشاء الحساب')}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--line)', background: 'var(--paper)', color: 'var(--mute)' }}>
            {t('Already have an account?', 'لديك حساب بالفعل؟')}{' '}
            <Link href={`/auth/login${redirect !== '/shop' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="font-black transition-colors hover:opacity-75" style={{ color: 'var(--ink)' }}>
              {t('Sign in', 'تسجيل الدخول')}
            </Link>
          </div>
        </section>

        {/* ── Trust panel ── */}
        <section className="order-1 overflow-hidden rounded-[36px] text-white shadow-card-lg lg:order-2"
          style={{ background: 'var(--ink)' }}>
          <div className="p-7 sm:p-8">
            <span className="inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.24em]"
              style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.15)' }}>
              {t('Fast Onboarding', 'بدء سريع')}
            </span>
            <h2 className="mt-5 text-3xl font-black leading-tight">
              {t('A simpler registration flow built for mobile.', 'تسجيل أبسط مصمم للموبايل.')}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7" style={{ color: 'rgba(255,255,255,0.70)' }}>
              {t('Start with the essentials now, then add more profile details whenever you want.', 'ابدأ بالبيانات الأساسية الآن، ثم أضف بقية تفاصيل الملف الشخصي لاحقًا متى شئت.')}
            </p>
          </div>
          <div className="grid gap-3 border-t p-7 sm:p-8" style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.05)' }}>
            {[
              { en: 'Default country: Sudan', ar: 'الدولة الافتراضية: السودان', subEn: 'You can switch to any supported country code.', subAr: 'يمكنك تغيير مفتاح الدولة لأي خيار مدعوم.' },
              { en: 'Required customer name', ar: 'اسم العميل مطلوب', subEn: 'Orders and profile updates will use the same name.', subAr: 'سيتم استخدام الاسم نفسه في الطلبات والملف الشخصي.' },
              { en: 'Consistent checkout', ar: 'رحلة شراء متسقة', subEn: 'Your phone number is the main contact across your account.', subAr: 'رقم الهاتف يصبح وسيلة التواصل الأساسية في حسابك.' },
            ].map((item) => (
              <div key={item.en} className="rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-black">{t(item.en, item.ar)}</p>
                <p className="mt-1 text-xs leading-6" style={{ color: 'rgba(255,255,255,0.65)' }}>{t(item.subEn, item.subAr)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text', placeholder, error }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; error?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mute)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none transition-all placeholder:text-[var(--mute)]"
        style={{ borderColor: error ? '#fca5a5' : 'var(--line)', color: 'var(--ink)', ...(error ? { boxShadow: '0 0 0 2px rgba(239,68,68,0.12)' } : {}) }}
        onFocus={(e) => { if (!error) { e.target.style.borderColor = 'var(--orange)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.12)' } }}
        onBlur={(e) => { if (!error) { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' } }}
      />
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  )
}

function PwField({ label, value, onChange, showPassword, onToggle, placeholder, error }: { label: string; value: string; onChange: (v: string) => void; showPassword: boolean; onToggle: () => void; placeholder: string; error?: string }) {
  const { t } = useLocale()
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mute)' }}>{label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border bg-white px-4 py-3 pe-14 text-sm outline-none transition-all placeholder:text-[var(--mute)]"
          style={{ borderColor: error ? '#fca5a5' : 'var(--line)', color: 'var(--ink)' }}
          onFocus={(e) => { if (!error) { e.target.style.borderColor = 'var(--orange)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.12)' } }}
          onBlur={(e) => { if (!error) { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' } }}
        />
        <button type="button" onClick={onToggle} className="absolute inset-y-0 end-3 my-auto h-9 rounded-xl px-2 text-xs font-black transition-colors hover:opacity-70" style={{ color: 'var(--mute)' }}>
          {showPassword ? t('Hide', 'إخفاء') : t('Show', 'إظهار')}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-500">{error}</p>}
    </div>
  )
}
