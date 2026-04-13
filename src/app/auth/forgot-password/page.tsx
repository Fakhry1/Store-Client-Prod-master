'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { PhoneNumberField } from '@/components/forms/PhoneNumberField'
import { useLocale } from '@/context/locale'
import { translateApiError } from '@/lib/errors'
import { getPhoneValidationMessage } from '@/lib/phone'

function getResetPasswordValidationError(
  newPassword: string,
  confirmPassword: string,
  t: (en: string, ar: string) => string
) {
  const trimmedPassword = newPassword.trim()

  if (!trimmedPassword || !confirmPassword.trim()) {
    return t('Please enter and confirm your new password', 'يرجى إدخال وتأكيد كلمة المرور الجديدة')
  }

  if (trimmedPassword.length < 8) {
    return t(
      'Password must be at least 8 characters long.',
      'كلمة المرور يجب أن تكون 8 أحرف على الأقل.'
    )
  }

  if (trimmedPassword !== confirmPassword.trim()) {
    return t('Passwords do not match', 'كلمتا المرور غير متطابقتين')
  }

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
        setSentMessage(
          t(
            `We sent a password reset link to ${email}`,
            `أرسلنا رابط إعادة التعيين إلى ${email}`
          )
        )
        setSent(true)
      } catch (err: any) {
        setError(translateApiError(err.message || 'Something went wrong', t))
      } finally {
        setLoading(false)
      }
      return
    }

    if (step === 'request') {
      const normalizedPhone = phoneNumber.trim()
      const nextPhoneError = getPhoneValidationMessage(normalizedPhone, t)
      setPhoneError(nextPhoneError)
      if (nextPhoneError) return

      setLoading(true)
      try {
        await authApi.requestPasswordResetOtp(normalizedPhone)
        setStep('verify')
      } catch (err: any) {
        setError(translateApiError(err.message || 'Something went wrong', t))
      } finally {
        setLoading(false)
      }
      return
    }

    if (step === 'verify') {
      if (!otp.trim()) {
        setError(t('OTP code is required', 'رمز التحقق مطلوب'))
        return
      }

      setLoading(true)
      try {
        const result = await authApi.verifyPasswordResetOtp(phoneNumber.trim(), otp.trim())
        setResetToken(result.resetToken)
        setStep('reset')
      } catch (err: any) {
        setError(translateApiError(err.message || 'Invalid OTP code', t))
      } finally {
        setLoading(false)
      }
      return
    }

    const resetPasswordError = getResetPasswordValidationError(newPassword, confirmPassword, t)
    if (resetPasswordError) {
      setError(resetPasswordError)
      return
    }

    setLoading(true)
    try {
      await authApi.resetPasswordWithOtp({
        phoneNumber: phoneNumber.trim(),
        resetToken,
        newPassword,
        confirmPassword,
      })
      setSentMessage(
        t(
          'Your password has been reset successfully. You can now sign in with your new password.',
          'تمت إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.'
        )
      )
      setSent(true)
    } catch (err: any) {
      setError(translateApiError(err.message || 'Something went wrong', t))
    } finally {
      setLoading(false)
    }
  }

  async function handleResendOtp() {
    setError('')
    const nextPhoneError = getPhoneValidationMessage(phoneNumber, t)
    setPhoneError(nextPhoneError)
    if (nextPhoneError) return

    setLoading(true)
    try {
      await authApi.requestPasswordResetOtp(phoneNumber.trim())
    } catch (err: any) {
      setError(translateApiError(err.message || 'Something went wrong', t))
    } finally {
      setLoading(false)
    }
  }

  function switchMode(nextMode: 'phone' | 'email') {
    setMode(nextMode)
    setError('')
    setSent(false)
    setStep('request')
    setOtp('')
    setResetToken('')
    setNewPassword('')
    setConfirmPassword('')
    setSentMessage('')
    setPhoneError('')

    // Keep each flow isolated so backend receives only relevant fields.
    if (nextMode === 'phone') {
      setEmail('')
    } else {
      setPhoneNumber('')
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-7">

          {sent ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center
                justify-center mx-auto mb-5">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">
                {t('Done!', 'تم التنفيذ!')}
              </h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {sentMessage}
              </p>
              <Link href="/auth/login"
                className="block w-full py-3 bg-slate-900 text-white font-bold
                  rounded-xl text-center hover:bg-amber-600 transition-colors text-sm">
                {t('Back to Sign In', 'العودة لتسجيل الدخول')}
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="text-center mb-7">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center
                  justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <h1 className="text-xl font-black text-slate-900 mb-1">
                  {t('Forgot Password?', 'نسيت كلمة المرور؟')}
                </h1>
                <p className="text-sm text-slate-500">
                  {mode === 'phone'
                    ? t(
                        'Reset using your phone number and OTP.',
                        'أعد التعيين باستخدام رقم الهاتف ورمز OTP.'
                      )
                    : t(
                        'Enter your email and we\'ll send you a reset link.',
                        'أدخل بريدك وسنرسل لك رابط الاستعادة.'
                      )}
                </p>
              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1">
                <button
                  type="button"
                  onClick={() => switchMode('phone')}
                  className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                    mode === 'phone'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t('Phone (OTP)', 'الجوال (OTP)')}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('email')}
                  className={`rounded-lg px-3 py-2 text-xs font-black transition ${
                    mode === 'email'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t('Email link', 'رابط البريد')}
                </button>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200
                  text-red-600 text-sm rounded-xl text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'email' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-500
                      uppercase tracking-wider mb-1.5">
                      {t('Email', 'البريد الإلكتروني')}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@email.com"
                      className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-amber-500/30
                        focus:border-amber-400 transition"
                    />
                  </div>
                ) : (
                  <>
                    <PhoneNumberField
                      label={t('Phone Number', 'رقم الهاتف')}
                      value={phoneNumber}
                      onChange={(value) => {
                        setPhoneNumber(value)
                        if (phoneError) setPhoneError('')
                      }}
                      required
                      error={phoneError}
                      showMetaRow={false}
                    />

                    {step === 'verify' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                          {t('OTP Code', 'رمز التحقق OTP')}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          placeholder="123456"
                          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl
                            focus:outline-none focus:ring-2 focus:ring-amber-500/30
                            focus:border-amber-400 transition"
                        />
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="mt-2 text-xs font-bold text-amber-700 hover:text-amber-800"
                        >
                          {t('Resend OTP', 'إعادة إرسال OTP')}
                        </button>
                      </div>
                    )}

                    {step === 'reset' && (
                      <>
                        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                          {t(
                            'Password requirements: at least 8 characters.',
                            'شروط كلمة المرور: 8 أحرف على الأقل.'
                          )}
                        </p>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            {t('New Password', 'كلمة المرور الجديدة')}
                          </label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl
                              focus:outline-none focus:ring-2 focus:ring-amber-500/30
                              focus:border-amber-400 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                            {t('Confirm Password', 'تأكيد كلمة المرور')}
                          </label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl
                              focus:outline-none focus:ring-2 focus:ring-amber-500/30
                              focus:border-amber-400 transition"
                          />
                        </div>
                      </>
                    )}
                  </>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-slate-900 text-white font-black rounded-xl
                    hover:bg-amber-600 transition-colors disabled:opacity-60 text-sm
                    flex items-center justify-center gap-2">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white
                        rounded-full animate-spin" />
                    : mode === 'email'
                      ? t('Send Reset Link', 'إرسال رابط الاستعادة')
                      : step === 'request'
                        ? t('Send OTP', 'إرسال OTP')
                        : step === 'verify'
                          ? t('Verify OTP', 'تحقق من OTP')
                          : t('Reset Password', 'إعادة تعيين كلمة المرور')
                  }
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 mt-5">
                <Link href="/auth/login"
                  className="text-amber-600 font-bold hover:text-amber-700">
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

