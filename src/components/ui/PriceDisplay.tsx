'use client'

import { OfferBadge } from './OfferBadge'
import { useLocale } from '@/context/locale'
import { getCurrencyLabel } from '@/lib/store'

interface Props {
  basePrice: number
  currentPrice: number
  hasActiveOffer: boolean
  discountPercentage?: number
  offerEndsAt?: string
  size?: 'sm' | 'md' | 'lg'
  layout?: 'row' | 'col'
}

const SIZE = {
  sm: { current: 'text-base font-bold', base: 'text-sm' },
  md: { current: 'text-xl font-bold', base: 'text-base' },
  lg: { current: 'text-3xl font-bold', base: 'text-lg' },
}

export function PriceDisplay({
  basePrice, currentPrice, hasActiveOffer,
  discountPercentage, offerEndsAt, size = 'md', layout = 'row'
}: Props) {
  const { locale } = useLocale()
  const s = SIZE[size]
  const currencyLabel = getCurrencyLabel(locale)
  return (
    <div className={`flex ${layout === 'col' ? 'flex-col gap-1' : 'items-center gap-2 flex-wrap'}`}>
      <span className={`${s.current} text-slate-900`}>
        {currentPrice.toFixed(2)} {currencyLabel}
      </span>
      {hasActiveOffer && (
        <>
          <span className={`${s.base} text-slate-400 line-through`}>
            {basePrice.toFixed(2)}
          </span>
          {discountPercentage && (
            <OfferBadge
              discount={discountPercentage}
              endsAt={offerEndsAt}
              size={size === 'sm' ? 'sm' : 'md'}
            />
          )}
        </>
      )}
    </div>
  )
}
