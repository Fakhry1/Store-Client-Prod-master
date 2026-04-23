export type Locale = 'en' | 'ar'

export const LOCALE_COOKIE_NAME = 'locale'
export const DEFAULT_LOCALE: Locale = 'ar'

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'ar' || value === 'en'
}

export function isRTL(locale: Locale): boolean {
  return locale === 'ar'
}

export function t(locale: Locale, en: string, ar: string): string {
  return locale === 'ar' ? ar : en
}
