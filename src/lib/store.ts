import { normalizeBaseUrl } from './url'

export const STORE_NAME =
  process.env.NEXT_PUBLIC_STORE_NAME?.trim() || 'inOne Store'

export const STORE_CURRENCY = {
  code: 'SDG',
  en: 'SDG',
  ar: 'ج.س',
} as const

export const STORE_KEYWORDS = [
  'متجر إلكتروني',
  'تسوق أونلاين',
  'عروض',
  'inOne Store',
  'online store',
  'shopping',
  'offers',
]

export function getCurrencyLabel(locale?: string): string {
  return locale === 'ar' ? STORE_CURRENCY.ar : STORE_CURRENCY.en
}

export function formatSavingsLabel(amount: number, locale?: string): string {
  const value = amount.toFixed(0)
  return locale === 'ar'
    ? `وفّر ${value} ${STORE_CURRENCY.ar}`
    : `Save ${value} ${STORE_CURRENCY.code}`
}

export function getStoreDescription(locale: string = 'ar'): string {
  return locale === 'ar'
    ? 'تسوّق أفضل المنتجات مع تجربة سريعة ومتوافقة مع الجوال واستلام أو توصيل موثوق.'
    : 'Shop curated products with a fast mobile-first experience and reliable pickup or delivery.'
}

export function getSiteUrl(): string {
  const fallback =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://example.com'

  return normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL ?? fallback) || fallback
}
