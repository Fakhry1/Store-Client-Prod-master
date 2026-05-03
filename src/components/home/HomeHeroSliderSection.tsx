import { HomeHero } from '@/components/home/HomeHero'

export default function HomeHeroSliderSection({ branchId, heroProducts }: { branchId: number, heroProducts: any[] }) {
  return (
    <section>
      <HomeHero branchId={branchId} heroProducts={heroProducts} />
    </section>
  )
}
