'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { useLocale } from '@/context/locale'
import { translateApiError } from '@/lib/errors'

export default function ForgotPasswordPage() {
  const { t } = useLocale()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (err: any) {
      setError(translateApiError(err.message || 'Something went wrong', t))
    } finally {
      setLoading(false)
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
                {t('Email sent!', 'تم الإرسال!')}
              </h2>
              <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                {t(
                  `We sent a password reset link to ${email}`,
                  `أرسلنا رابط إعادة التعيين إلى ${email}`
                )}
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
                  {t(
                    'Enter your email and we\'ll send you a reset link',
                    'أدخل بريدك وسنرسل لك رابط الاستعادة'
                  )}
                </p>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200
                  text-red-600 text-sm rounded-xl text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500
                    uppercase tracking-wider mb-1.5">
                    {t('Email', 'البريد الإلكتروني')}
                  </label>
                  <input type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    required placeholder="you@email.com"
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-amber-500/30
                      focus:border-amber-400 transition" />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-slate-900 text-white font-black rounded-xl
                    hover:bg-amber-600 transition-colors disabled:opacity-60 text-sm
                    flex items-center justify-center gap-2">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white
                        rounded-full animate-spin" />
                    : t('Send Reset Link', 'إرسال رابط الاستعادة')
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

