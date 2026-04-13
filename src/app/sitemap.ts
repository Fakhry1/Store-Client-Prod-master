import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/store'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl()
  const now = new Date()

  return ['/', '/shop'].map((path, index) => ({
    url: new URL(path, siteUrl).toString(),
    lastModified: now,
    changeFrequency: index === 0 ? 'daily' : 'hourly',
    priority: index === 0 ? 1 : 0.9,
  }))
}
