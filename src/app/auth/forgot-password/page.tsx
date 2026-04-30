'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { PhoneNumberField } from '@/components/forms/PhoneNumberField'
import { useLocale } from '@/context/locale'
import { translateApiError } from '@/lib/errors'
import { getPhoneValidationMessage } from '@/lib/phone'

function getResetPasswordValidationError(newPassword: string, confirmPassword: string, t: (en: string, ar: string) => string) {
  const trimmed = newPassword.trim()
  if (!trimmed || !confirmPassword.trim()) return t('Please enter and confirm your new password', 'يرجى إدخال وتأكيد كلمة المرور الجديدة')
  if (trimmed.length < 8) return t('Password must be at least 8 characters long.', 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.')
  if (trimmed !== confirmPassword.trim()) return t('Passwords do not match', 'كلمتا المرور غير متطابقتين')
  return ''
}

export default function ForgotPasswordPage() {
  const { t } = useLocale()
  const [mode, setMode] = useState<'phone' | 'email'>('phone')
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request')

  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [sentMessage, setSentMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (mode === 'email') {
      setLoading(true)
      try {
        await authApi.forgotPassword(email)
        setSentMessage(t(`We sent a password reset link to ${email}`, `أرسلنا رابط إعادة التعيين إلى ${email}`))
        setSent(true)
      } catch (err: any) {
        setError(translateApiError(err.message || 'Something went wrong', t))
      } finally { setLoading(false) }
      return
    }

    if (step === 'request') {
      const nextPhoneError = getPhoneValidationMessage(phoneNumber.trim(), t)
      setPhoneError(nextPhoneError)
      if (nextPhoneError) return
      setLoading(true)
      try {
        await authApi.requestPasswordResetOtp(phoneNumber.trim())
        setStep('verify')
      } catch (err: any) {
        setError(translateApiError(err.message || 'Something went wrong', t))
      } finally { setLoading(false) }
      return
    }

    if (step === 'verify') {
      if (!otp.trim()) { setError(t('OTP code is required', 'رمز التحقق مطلوب')); return }
      setLoading(true)
      try {
        const result = await authApi.verifyPasswordResetOtp(phoneNumber.trim(), otp.trim())
        setResetToken(result.resetToken)
        setStep('reset')
      } catch (err: any) {
        setError(translateApiError(err.message || 'Invalid OTP code', t))
      } finally { setLoading(false) }
      return
    }

    const resetError = getResetPasswordValidationError(newPassword, confirmPassword, t)
    if (resetError) { setError(resetError); return }
    setLoading(true)
    try {
      await authApi.resetPasswordWithOtp({ phoneNumber: phoneNumber.trim(), resetToken, newPassword, confirmPassword })
      setSentMessage(t('Your password has been reset successfully. You can now sign in with your new password.', 'تمت إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'))
      setSent(true)
    } catch (err: any) {
      setError(translateApiError(err.message || 'Something went wrong', t))
    } finally { setLoading(false) }
  }

  async function handleResendOtp() {
    setError('')
    const nextPhoneError = getPhoneValidationMessage(phoneNumber, t)
    setPhoneError(nextPhoneError)
    if (nextPhoneError) return
    setLoading(true)
    try { await authApi.requestPasswordResetOtp(phoneNumber.trim()) }
    catch (err: any) { setError(translateApiError(err.message || 'Something went wrong', t)) }
    finally { setLoading(false) }
  }

  function switchMode(nextMode: 'phone' | 'email') {
    setMode(nextMode); setError(''); setSent(false); setStep('request')
    setOtp(''); setResetToken(''); setNewPassword(''); setConfirmPassword('')
    setSentMessage(''); setPhoneError('')
    if (nextMode === 'phone') setEmail(''); else setPhoneNumber('')
  }

  const ctaLabel = mode === 'email'
    ? t('Send Reset Link', 'إرسال رابط الاستعادة')
    : step === 'request' ? t('Send OTP', 'إرسال OTP')
    : step === 'verify' ? t('Verify OTP', 'تحقق من OTP')
    : t('Reset Password', 'إعادة تعيين كلمة المرور')

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16" style={{ background: 'var(--paper)' }}>
      <div className="w-full max-w-sm">
        <div className="rounded-3xl border bg-white p-7 shadow-card-lg" style={{ borderColor: 'var(--line)' }}>

          {sent ? (
            /* ── Success ── */
            <div className="py-4 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: 'rgba(34,197,94,0.12)' }}>
                <svg className="h-8 w-8" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-black" style={{ color: 'var(--ink)' }}>
                {t('Done!', 'تم التنفيذ!')}
              </h2>
              <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--mute)' }}>{sentMessage}</p>
              <Link
                href="/auth/login"
                className="block w-full rounded-xl py-3 text-center text-sm font-black text-white transition-colors hover:opacity-90"
                style={{ background: 'var(--ink)' }}
              >
                {t('Back to Sign In', 'العودة لتسجيل الدخول')}
              </Link>
            </div>
          ) : (
            /* ── Form ── */
            <>
              <div className="mb-7 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: 'rgba(255,107,44,0.10)' }}>
                  <svg className="h-6 w-6" fill="none" stroke="var(--orange)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="mb-1 text-xl font-black" style={{ color: 'var(--ink)' }}>
                  {t('Forgot Password?', 'نسيت كلمة المرور؟')}
                </h1>
                <p className="text-sm" style={{ color: 'var(--mute)' }}>
                  {mode === 'phone'
                    ? t('Reset using your phone number and OTP.', 'أعد التعيين باستخدام رقم الهاتف ورمز OTP.')
                    : t("Enter your email and we'll send you a reset link.", 'أدخل بريدك وسنرسل لك رابط الاستعادة.')}
                </p>
              </div>

              {/* Mode tabs */}
              <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl p-1" style={{ background: 'var(--paper-2)' }}>
                {(['phone', 'email'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => switchMode(m)}
                    className="rounded-lg px-3 py-2 text-xs font-black transition-all"
                    style={mode === m
                      ? { background: '#fff', color: 'var(--ink)', boxShadow: '0 1px 4px rgba(10,31,68,0.10)' }
                      : { color: 'var(--mute)' }}
                  >
                    {m === 'phone' ? t('Phone (OTP)', 'الجوال (OTP)') : t('Email link', 'رابط البريد')}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'email' ? (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mute)' }}>
                      {t('Email', 'البريد الإلكتروني')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@email.com"
                      className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all"
                      style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                      onFocus={(e) => { e.target.style.borderColor = 'var(--orange)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.12)' }}
                      onBlur={(e) => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
                    />
                  </div>
                ) : (
                  <>
                    {step === 'request' && (
                      <PhoneNumberField
                        label={t('Phone Number', 'رقم الهاتف')}
                        value={phoneNumber}
                        onChange={(value) => { setPhoneNumber(value); if (phoneError) setPhoneError('') }}
                        required
                        error={phoneError}
                        showMetaRow={false}
                      />
                    )}

                    {step === 'verify' && (
                      <div>
                        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mute)' }}>
                          {t('OTP Code', 'رمز التحقق OTP')}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          placeholder="123456"
                          className="w-full rounded-xl border bg-white px-4 py-3 text-center text-lg font-black tracking-[0.3em] outline-none transition-all"
                          style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                          onFocus={(e) => { e.target.style.borderColor = 'var(--orange)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.12)' }}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
                        />
                        <button type="button" onClick={handleResendOtp} className="mt-2 text-xs font-bold transition-colors hover:opacity-70" style={{ color: 'var(--orange)' }}>
                          {t('Resend OTP', 'إعادة إرسال OTP')}
                        </button>
                      </div>
                    )}

                    {step === 'reset' && (
                      <>
                        <p className="rounded-xl border px-3 py-2 text-xs" style={{ borderColor: 'rgba(255,107,44,0.20)', background: 'rgba(255,107,44,0.06)', color: 'var(--ink)' }}>
                          {t('Password requirements: at least 8 characters.', 'شروط كلمة المرور: 8 أحرف على الأقل.')}
                        </p>
                        {[
                          { label: t('New Password', 'كلمة المرور الجديدة'), value: newPassword, set: setNewPassword },
                          { label: t('Confirm Password', 'تأكيد كلمة المرور'), value: confirmPassword, set: setConfirmPassword },
                        ].map(({ label, value, set }) => (
                          <div key={label}>
                            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mute)' }}>{label}</label>
                            <input
                              type="password"
                              value={value}
                              onChange={(e) => set(e.target.value)}
                              required
                              autoComplete="new-password"
                              className="w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all"
                              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
                              onFocus={(e) => { e.target.style.borderColor = 'var(--orange)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,44,0.12)' }}
                              onBlur={(e) => { e.target.style.borderColor = 'var(--line)'; e.target.style.boxShadow = 'none' }}
                            />
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-black text-white transition-colors disabled:opacity-60"
                  style={{ background: 'var(--orange)' }}
                >
                  {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                  {loading ? t('Please wait...', 'يرجى الانتظار...') : ctaLabel}
                </button>
              </form>

              <p className="mt-5 text-center text-sm" style={{ color: 'var(--mute)' }}>
                <Link href="/auth/login" className="font-bold transition-colors hover:opacity-75" style={{ color: 'var(--orange)' }}>
                  ← {t('Back to Sign In', 'العودة لتسجيل الدخول')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
