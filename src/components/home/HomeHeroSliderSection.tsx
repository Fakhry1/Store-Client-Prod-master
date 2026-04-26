import { HomeHero } from '@/components/home/HomeHero'
import { Suspense } from 'react'

export default function HomeHeroSliderSection({ branchId, heroProducts }: { branchId: number, heroProducts: any[] }) {
  return (
    <section>
      <Suspense fallback={
        <div
          className="relative overflow-hidden border-b border-stone-200 bg-[linear-gradient(180deg,#fffdf9_0%,#f7f9fc_100%)]"
          style={{ minHeight: 520 }}
          aria-hidden="true"
        />
      }>
        <HomeHero branchId={branchId} heroProducts={heroProducts} />
      </Suspense>
    </section>
  )
}
