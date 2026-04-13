import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/store'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/auth', '/account', '/cart', '/orders', '/wishlist'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
