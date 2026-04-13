'use client'

import { useState, useEffect } from 'react'

interface Props {
  discount: number
  endsAt?: string
  size?: 'sm' | 'md'
}

export function OfferBadge({ discount, endsAt, size = 'md' }: Props) {
  const isSmall = size === 'sm'
  return (
    <span className={`inline-flex items-center gap-1 bg-red-600 text-white font-bold rounded-full
      ${isSmall ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}>
      -{Math.round(discount)}%
      {endsAt && !isSmall && <LiveOfferTimer endsAt={endsAt} />}
    </span>
  )
}

// ─── Live countdown — يتحدث كل ثانية ─────────────────────────────────────────

export function LiveOfferTimer({ endsAt, className = '' }: { endsAt: string; className?: string }) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(endsAt))

  useEffect(() => {
    const initial = calcTimeLeft(endsAt)
    setTimeLeft(initial)
    // لو العرض انتهى أو بعيد جداً (+48h) لا نشغّل الـ timer
    if (!initial || initial.totalSeconds > 48 * 3600) return

    const id = setInterval(() => {
      const next = calcTimeLeft(endsAt)
      setTimeLeft(next)
      if (!next || next.totalSeconds <= 0) clearInterval(id)
    }, 1000)

    return () => clearInterval(id)
  }, [endsAt])

  if (!timeLeft || timeLeft.totalSeconds <= 0) return null
  if (timeLeft.totalSeconds > 48 * 3600) return null

  const { hours, minutes, seconds, totalSeconds } = timeLeft
  const isUrgent = totalSeconds < 3600 // أقل من ساعة → أحمر نابض

  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs ${className}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className={isUrgent ? 'animate-pulse text-red-200' : 'text-red-200'}>
        {hours > 0
          ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
          : `${pad(minutes)}:${pad(seconds)}`
        }
      </span>
    </span>
  )
}

// ─── Standalone countdown for product page ───────────────────────────────────

export function OfferCountdown({ endsAt, locale }: { endsAt: string; locale: string }) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(endsAt))

  useEffect(() => {
    const initial = calcTimeLeft(endsAt)
    setTimeLeft(initial)
    if (!initial || initial.totalSeconds > 48 * 3600) return
    const id = setInterval(() => {
      const next = calcTimeLeft(endsAt)
      setTimeLeft(next)
      if (!next || next.totalSeconds <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  if (!timeLeft || timeLeft.totalSeconds <= 0) return null

  const { days, hours, minutes, seconds, totalSeconds } = timeLeft
  const isUrgent  = totalSeconds < 3600
  const isToday   = days === 0
  const label     = locale === 'ar' ? 'ينتهي العرض خلال' : 'Offer ends in'

  // عرض بعيد (+48h): نعرض التاريخ فقط
  if (totalSeconds > 48 * 3600) {
    const dateStr = new Date(endsAt).toLocaleDateString(
      locale === 'ar' ? 'ar-SA' : 'en-SA',
      { day: 'numeric', month: 'long' }
    )
    return (
      <div className="flex items-center gap-2 text-xs text-red-500">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {locale === 'ar' ? `ينتهي العرض ${dateStr}` : `Offer ends ${dateStr}`}
      </div>
    )
  }

  // عرض قريب: countdown حي
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold
      ${isUrgent
        ? 'bg-red-50 border border-red-200 text-red-700'
        : 'bg-amber-50 border border-amber-200 text-amber-700'
      }`}>
      <svg className={`w-3.5 h-3.5 flex-shrink-0 ${isUrgent ? 'animate-pulse' : ''}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{label}</span>
      <div className="flex items-center gap-1 font-mono">
        {days > 0 && (
          <>
            <TimeUnit value={days} label={locale === 'ar' ? 'ي' : 'd'} urgent={isUrgent} />
            <span className="text-current/40">:</span>
          </>
        )}
        <TimeUnit value={hours} label={locale === 'ar' ? 'س' : 'h'} urgent={isUrgent} />
        <span className={`${isUrgent ? 'animate-pulse' : ''} text-current/40`}>:</span>
        <TimeUnit value={minutes} label={locale === 'ar' ? 'د' : 'm'} urgent={isUrgent} />
        <span className={`${isUrgent ? 'animate-pulse' : ''} text-current/40`}>:</span>
        <TimeUnit value={seconds} label={locale === 'ar' ? 'ث' : 's'} urgent={isUrgent} />
      </div>
    </div>
  )
}

function TimeUnit({ value, label, urgent }: { value: number; label: string; urgent: boolean }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none
      ${urgent ? 'text-red-700' : 'text-amber-700'}`}>
      <span className="text-sm font-black tabular-nums">{pad(value)}</span>
      <span className="text-[8px] opacity-60 font-normal">{label}</span>
    </span>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function calcTimeLeft(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now())
  if (diff === 0) return null
  const totalSeconds = Math.floor(diff / 1000)
  return {
    totalSeconds,
    days:    Math.floor(totalSeconds / 86400),
    hours:   Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}
