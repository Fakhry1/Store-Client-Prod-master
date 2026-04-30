'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { PhoneNumberField } from '@/components/forms/PhoneNumberField'
import { useAuth } from '@/context/auth'
import { useLocale } from '@/context/locale'
import { translateApiError } from '@/lib/errors'
import { getPhoneValidationMessage } from '@/lib/phone'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/shop'
  const { login } = useAuth()
  const { t } = useLocale()

  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const nextPhoneError = getPhoneValidationMessage(phoneNumber, t)
    setPhoneError(nextPhoneError)
    if (nextPhoneError) return

    if (!password) {
      setError(t('Password is required', 'كلمة المرور مطلوبة'))
      return
    }

    setLoading(true)
    try {
      await login(phoneNumber, password)
      router.replace(redirect)
    } catch (err: any) {
      setError(translateApiError(err.message || 'Invalid phone number or password', t))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen px-4 py-10 md:py-16" style={{ background: 'var(--paper)' }}>
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">

        {/* ── Left panel – trust signals ── */}
        <section
          className="hidden overflow-hidden rounded-[36px] text-white shadow-card-lg lg:flex lg:flex-col lg:justify-between"
          style={{ background: 'var(--ink)' }}
        >
          <div className="p-8">
            <span
              className="inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.25em]"
              style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {t('Customer Access', 'دخول العملاء')}
            </span>
            <h1 className="mt-5 max-w-md text-4xl font-black leading-tight">
              {t('Your account starts with your phone number.', 'حسابك يبدأ من رقم هاتفك.')}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-7" style={{ color: 'rgba(255,255,255,0.70)' }}>
              {t(
                'Use your phone number to sign in, follow your orders, and continue checkout from any device.',
                'استخدم رقم الهاتف لتسجيل الدخول ومتابعة الطلبات وإكمال الشراء من أي جهاز.'
              )}
            </p>
          </div>

          <div
            className="grid gap-3 border-t p-8"
            style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.05)' }}
          >
            {[
              { en: 'Phone-first access', ar: 'دخول برقم الهاتف', subEn: 'No email is required to sign in.', subAr: 'لا تحتاج بريدًا إلكترونيًا لتسجيل الدخول.' },
              { en: 'Secure session', ar: 'جلسة آمنة', subEn: 'Your account stays synced with your cart and wishlist.', subAr: 'حسابك يبقى متزامنًا مع السلة والمفضلة.' },
              { en: 'Mobile ready', ar: 'مصمم للموبايل', subEn: 'Fast and comfortable on smaller screens.', subAr: 'سريع ومريح على الشاشات الصغيرة.' },
            ].map((item) => (
              <div key={item.en} className="rounded-2xl border p-4" style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.05)' }}>
                <p className="text-sm font-black">{t(item.en, item.ar)}</p>
                <p className="mt-1 text-xs leading-6" style={{ color: 'rgba(255,255,255,0.65)' }}>{t(item.subEn, item.subAr)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Right panel – form ── */}
        <section
          className="rounded-[32px] border bg-white p-5 shadow-card-lg sm:p-7 md:p-8"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="mb-7">
            <span
              className="inline-flex rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em]"
              style={{ background: 'rgba(255,107,44,0.10)', color: 'var(--orange)' }}
            >
              {t('Welcome Back', 'أهلًا بعودتك')}
            </span>
            <h2 className="mt-4 text-2xl font-black md:text-3xl" style={{ color: 'var(--ink)' }}>
              {t('Sign in with your phone', 'سجّل الدخول برقم هاتفك')}
            </h2>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <PhoneNumberField
              label={t('Phone Number', 'رقم الهاتف')}
              value={phoneNumber}
              onChange={(value) => { setPhoneNumber(value); if (phoneError) setPhoneError('') }}
              required
              error={phoneError}
              showMetaRow={false}
            />

            <div>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mute)' }}>
                  {t('Password', 'كلمة المرور')}
                </label>
                <Link href="/auth/forgot-password" className="text-xs font-bold transition-colors hover:opacity-75"
                  style={{ color: 'var(--orange)' }}>
                  {t('Forgot password?', 'نسيت كلمة المرور؟')}
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder={t('Enter your password', 'أدخل كلمة المرور')}
                  className="w-full rounded-2xl border bg-white px-4 py-3 pe-12 text-sm outline-none transition-all placeholder:text-[var(--mute)]"
                  style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--orange)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.12)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 end-3 my-auto h-9 rounded-xl px-2 text-xs font-black transition-colors hover:opacity-70"
                  style={{ color: 'var(--mute)' }}
                >
                  {showPassword ? t('Hide', 'إخفاء') : t('Show', 'إظهار')}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: loading ? 'var(--ink)' : 'var(--orange)' }}
            >
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {loading ? t('Signing in...', 'جارٍ تسجيل الدخول...') : t('Sign In', 'تسجيل الدخول')}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: 'var(--line)', background: 'var(--paper)', color: 'var(--mute)' }}>
            {t("Don't have an account yet?", 'ليس لديك حساب بعد؟')}{' '}
            <Link
              href={`/auth/register${redirect !== '/shop' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
              className="font-black transition-colors hover:opacity-75"
              style={{ color: 'var(--ink)' }}
            >
              {t('Create one now', 'أنشئ حسابًا الآن')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
