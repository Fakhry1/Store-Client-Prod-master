'use client'

import { useState } from 'react'
import type { CatalogItem } from '@/types'
import { FeaturedCard } from '@/components/home/HomeCards'
import { SectionHeader } from '@/components/home/HomeStatic'
import { useLocale } from '@/context/locale'

type TabId = 'new' | 'best' | 'premium'

interface Tab {
  id: TabId
  labelEn: string
  labelAr: string
  eyebrowEn: string
  eyebrowAr: string
  items: CatalogItem[]
}

interface Props {
  newArrivals: CatalogItem[]
  bestSellers: CatalogItem[]
  premiumPicks: CatalogItem[]
  branchId: number
}

export function ProductTabsSection({ newArrivals, bestSellers, premiumPicks, branchId }: Props) {
  const { t } = useLocale()

  const allTabs: Tab[] = [
    {
      id: 'new',
      labelEn: 'New In',
      labelAr: 'وصل حديثًا',
      eyebrowEn: 'Latest Drop',
      eyebrowAr: 'وصل حديثًا',
      items: newArrivals,
    },
    {
      id: 'premium',
      labelEn: 'Luxury',
      labelAr: 'فاخر',
      eyebrowEn: 'Premium Edit',
      eyebrowAr: 'اختيارات فاخرة',
      items: premiumPicks,
    },
    {
      id: 'best',
      labelEn: 'Deals',
      labelAr: 'صفقات',
      eyebrowEn: 'Best Deals',
      eyebrowAr: 'أفضل الصفقات',
      items: bestSellers,
    },
  ]
  const tabs = allTabs.filter((tab) => tab.items.length > 0)

  const [activeId, setActiveId] = useState<TabId>(tabs[0]?.id ?? 'new')

  if (tabs.length === 0) return null

  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0]

  return (
    <section
      id="collections"
      className="py-16 md:py-20"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '920px' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow={t(active.eyebrowEn, active.eyebrowAr)}
            title={t(active.labelEn, active.labelAr)}
            link={{ href: '/shop', label: t('View all', 'عرض الكل') }}
          />
          {tabs.length > 1 && (
            <div
              className="flex items-center gap-1 self-start rounded-[18px] border p-1.5 sm:self-auto"
              style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveId(tab.id)}
                  className="rounded-[12px] px-4 py-2 text-xs font-black transition-all duration-200"
                  style={{
                    background: activeId === tab.id ? 'var(--ink)' : 'transparent',
                    color: activeId === tab.id ? '#fff' : 'var(--mute)',
                  }}
                >
                  {t(tab.labelEn, tab.labelAr)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {active.items.map((item) => (
            <FeaturedCard
              key={`${item.productId}-${item.variantId}-${active.id}`}
              item={item}
              branchId={branchId}
              priority={false}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
