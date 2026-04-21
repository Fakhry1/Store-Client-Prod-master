import { HomeBelowFold } from '@/components/home/HomeBelowFold'
import type { CatalogItem, Category } from '@/types'

type Props = {
  categories: Category[]
  offers: CatalogItem[]
  newArrivals: CatalogItem[]
  bestSellers: CatalogItem[]
  premiumPicks: CatalogItem[]
  branchId: number
}

export function HomeBelowFoldEntry(props: Props) {
  return (
    <div
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '900px',
      }}
    >
      <HomeBelowFold {...props} />
    </div>
  )
}