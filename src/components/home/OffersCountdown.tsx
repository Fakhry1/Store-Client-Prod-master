'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/context/locale'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function OffersCountdown() {
  const { t } = useLocale()
  const [timeLeft, setTimeLeft] = useState<{ h: number; m: number; s: number } | null>(null)

  useEffect(() => {
    const target = new Date()
    target.setHours(23, 59, 59, 0)
    if (target.getTime() <= Date.now()) target.setDate(target.getDate() + 1)

    function tick() {
      const diff = Math.max(0, target.getTime() - Date.now())
      setTimeLeft({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      })
    }

    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [])

  if (!timeLeft) return null

  const units = [
    { v: timeLeft.h, label: t('h', 'س') },
    { v: timeLeft.m, label: t('m', 'د') },
    { v: timeLeft.s, label: t('s', 'ث') },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.50)' }}>
        {t('Ends in', 'تنتهي خلال')}
      </span>
      {units.map(({ v, label }, i) => (
        <span key={i} className="flex items-center gap-1">
          <span
            className="min-w-[2.2rem] rounded-xl px-2 py-1 text-center text-sm font-black tabular-nums text-white"
            style={{ background: 'rgba(255,255,255,0.10)' }}
          >
            {pad(v)}
          </span>
          <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.38)' }}>
            {label}
          </span>
          {i < 2 && (
            <span className="ms-0.5 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>:</span>
          )}
        </span>
      ))}
    </div>
  )
}
