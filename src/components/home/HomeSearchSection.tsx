'use client'

import Link from 'next/link'
import { useLocale } from '@/context/locale'
import { SearchBar } from '@/components/ui/SearchBar'

export function HomeSearchSection() {
  const { t } = useLocale()

  const quickLinks = [
    { href: '/shop?sort=newest',    labelEn: 'New In',   labelAr: 'وصل حديثًا' },
    { href: '/shop?sort=price_desc', labelEn: 'Luxury',   labelAr: 'فاخر' },
    { href: '/shop?sort=price_asc',  labelEn: 'Deals',    labelAr: 'صفقات' },
  ]

  return (
    <section
      className="border-y py-14 md:py-18"
      style={{
        background: 'var(--paper)',
        borderColor: 'var(--line)',
        contentVisibility: 'auto',
        containIntrinsicSize: '320px',
      }}
    >
      <div className="mx-auto max-w-2xl px-6">
        {/* Heading */}
        <div className="mb-7 text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--orange)' }}>
            {t('Search', 'البحث')}
          </p>
          <h2 className="font-display text-2xl font-black leading-[1.2] md:text-[1.85rem]" style={{ color: 'var(--ink)' }}>
            {t("Find what you're looking for", 'ابحث عن ما تريد')}
          </h2>
        </div>

        {/* Search bar */}
        <SearchBar placeholder={t('Search products...', 'ابحث عن منتجات...')} />

        {/* Quick-browse pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-bold" style={{ color: 'var(--mute)' }}>
            {t('Quick:', 'سريع:')}
          </span>
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border px-4 py-1.5 text-xs font-black transition-colors hover:border-orange-400 hover:text-orange-600"
              style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
            >
              {t(link.labelEn, link.labelAr)}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
