import { cookies } from 'next/headers'
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME, type Locale } from '@/lib/locale'

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value

  return isLocale(locale) ? locale : DEFAULT_LOCALE
}
