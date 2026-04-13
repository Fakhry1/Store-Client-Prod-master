'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Locale = 'en' | 'ar'

interface LocaleContextValue {
  locale: Locale
  isRTL: boolean
  toggle: () => void
  t: (en: string, ar: string) => string
  tField: (obj: { nameEn?: string; nameAr?: string } | null | undefined) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('ar')

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null
    if (saved === 'en' || saved === 'ar') setLocale(saved)
  }, [])

  useEffect(() => {
    document.documentElement.dir  = locale === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = locale
    localStorage.setItem('locale', locale)
  }, [locale])

  const toggle = () => setLocale(l => l === 'en' ? 'ar' : 'en')

  const t = (en: string, ar: string) => locale === 'ar' ? ar : en

  const tField = (obj: { nameEn?: string; nameAr?: string } | null | undefined) => {
    if (!obj) return ''
    return locale === 'ar' ? (obj.nameAr || obj.nameEn || '') : (obj.nameEn || obj.nameAr || '')
  }

  return (
    <LocaleContext.Provider value={{ locale, isRTL: locale === 'ar', toggle, t, tField }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be inside LocaleProvider')
  return ctx
}
