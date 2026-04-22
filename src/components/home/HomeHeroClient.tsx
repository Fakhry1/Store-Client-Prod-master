import { PremiumHeroSlider } from '@/components/home/PremiumHeroSlider'
import type { HomeHeroSlide } from '@/components/home/PremiumHeroSlider'

export function HomeHeroClient({ slides }: { slides: HomeHeroSlide[] }) {
  return <PremiumHeroSlider slides={slides} />
}