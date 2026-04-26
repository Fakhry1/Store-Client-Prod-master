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
  display: 'optional',
  preload: false,
})

const notoKufi = localFont({
  src: [
    { path: '../../public/fonts/noto-kufi-arabic-main.woff2', weight: '100 900', style: 'normal' },
  ],
  variable: '--font-kufi',
  display: 'swap',
  preload: true,
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
  icons: {
    icon: '/inone-logo.svg',
    shortcut: '/inone-logo.svg',
    apple: '/inone-logo.svg',
  },
  openGraph: {
    title: STORE_NAME,
    description: getStoreDescription('ar'),
    url: siteUrl,
    type: 'website',
    siteName: STORE_NAME,
    locale: 'ar_SA',
    alternateLocale: ['en_US'],
    images: [
      {
        url: '/inone-logo-original.jpg',
        width: 1200,
        height: 630,
        alt: STORE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: STORE_NAME,
    description: getStoreDescription('en'),
    images: ['/inone-logo-original.jpg'],
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

const imageOrigin = process.env.NEXT_PUBLIC_IMAGE_BASE_URL
  ? new URL(process.env.NEXT_PUBLIC_IMAGE_BASE_URL).origin
  : null

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${playfair.variable} ${notoKufi.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-transparent font-kufi antialiased text-slate-900" suppressHydrationWarning>
        {imageOrigin && (
          <>
            <link rel="preconnect" href={imageOrigin} />
            <link rel="dns-prefetch" href={imageOrigin} />
          </>
        )}
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