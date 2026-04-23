import { HomeHero } from '@/components/home/HomeHero'
import { Suspense } from 'react'

export default function HomeHeroSliderSection({ branchId, heroProducts }: { branchId: number, heroProducts: any[] }) {
  return (
    <section>
      <Suspense fallback={<div style={{minHeight:560}}>Loading slider...</div>}>
        <HomeHero branchId={branchId} heroProducts={heroProducts} />
      </Suspense>
    </section>
  )
}
