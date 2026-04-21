'use client'

import dynamic from 'next/dynamic'
import type { HomeHeroSlide } from '@/components/home/PremiumHeroSlider'
import { HomeHeroPreview } from '@/components/home/HomeHeroPreview'

export function HomeHeroClient({ slides }: { slides: HomeHeroSlide[] }) {
  const PremiumHeroSlider = dynamic(
    () => import('@/components/home/PremiumHeroSlider').then((module) => module.PremiumHeroSlider),
    {
      ssr: false,
      loading: () => <HomeHeroPreview slide={slides[0]} />,
    }
  )

  return (
    <PremiumHeroSlider slides={slides} />
  )
}