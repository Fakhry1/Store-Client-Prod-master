import type { Metadata } from 'next'
import { productApi } from '@/lib/api'

// Product page is client-side — metadata is set at layout level
// using the product id from search params is not directly supported here,
// so we provide a sensible default for the product route.
export const metadata: Metadata = {
  title: 'تفاصيل المنتج — LUXE Store',
  description: 'اطلع على تفاصيل المنتج، اختر المقاس واللون، وأضفه إلى سلتك',
  openGraph: {
    type: 'website',
    siteName: 'LUXE Store',
  },
}

import type { ReactNode } from 'react'
export default function ProductLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
