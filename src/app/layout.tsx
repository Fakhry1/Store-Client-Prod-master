import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { AuthProvider } from '@/context/auth'
import { CartProvider } from '@/context/cart'
import { LocaleProvider } from '@/context/locale'
import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'
import { ToastProvider } from '@/components/ui/Toaster'
import { getSiteUrl, getStoreDescription, STORE_KEYWORDS, STORE_NAME } from '@/lib/store'
import type { ReactNode } from 'react'

const playfair = localFont({
  src: [
    { path: '../../public/fonts/playfair-latin.woff2', weight: '400 900', style: 'normal' },
    { path: '../../public/fonts/playfair-latin-ext.woff2', weight: '400 900', style: 'normal' },
  ],
  variable: '--font-playfair',
  display: 'swap',
  preload: false,
})

const notoKufi = localFont({
  src: [
    { path: '../../public/fonts/noto-kufi-arabic-main.woff2', weight: '100 900', style: 'normal' },
  ],
  variable: '--font-kufi',
  display: 'swap',
  preload: false,
})

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: STORE_NAME,
  title: {
    default: STORE_NAME,
    template: `%s | ${STORE_NAME}`,
  },
  description: getStoreDescription('ar'),
  keywords: STORE_KEYWORDS,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: STORE_NAME,
    description: getStoreDescription('ar'),
    url: siteUrl,
    type: 'website',
    siteName: STORE_NAME,
    locale: 'ar_SA',
    alternateLocale: ['en_US'],
  },
  twitter: {
    card: 'summary_large_image',
    title: STORE_NAME,
    description: getStoreDescription('en'),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f8f6f2',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${playfair.variable} ${notoKufi.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased font-kufi bg-stone-50" suppressHydrationWarning>
        <LocaleProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <Navbar />
                <main className="pb-20 md:pb-0">{children}</main>
                <BottomNav />
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}