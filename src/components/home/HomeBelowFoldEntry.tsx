'use client'

import dynamic from 'next/dynamic'
import type { CatalogItem, Category } from '@/types'
import { DeferredRender } from '@/components/home/DeferredRender'

type Props = {
  categories: Category[]
  offers: CatalogItem[]
  newArrivals: CatalogItem[]
  bestSellers: CatalogItem[]
  premiumPicks: CatalogItem[]
  branchId: number
}

const HomeBelowFold = dynamic(
  () => import('@/components/home/HomeBelowFold').then((module) => module.HomeBelowFold),
  {
    ssr: false,
    loading: () => null,
  }
)

export function HomeBelowFoldEntry(props: Props) {
  return (
    <DeferredRender minHeight={900} rootMargin="260px 0px">
      <HomeBelowFold {...props} />
    </DeferredRender>
  )
}