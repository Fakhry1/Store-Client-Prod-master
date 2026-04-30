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

function resolveDiscountPercentage(basePrice: number, currentPrice: number, explicitDiscount?: number) {
  if (typeof explicitDiscount === 'number' && explicitDiscount > 0) {
    return Math.round(explicitDiscount)
  }

  if (basePrice > currentPrice && basePrice > 0) {
    return Math.round(((basePrice - currentPrice) / basePrice) * 100)
  }

  return undefined
}

export function PriceDisplay({
  basePrice, currentPrice, hasActiveOffer,
  discountPercentage, offerEndsAt, size = 'md', layout = 'row'
}: Props) {
  const { locale } = useLocale()
  const s = SIZE[size]
  const currencyLabel = getCurrencyLabel(locale)
  const hasOfferPrice = hasActiveOffer && basePrice > currentPrice
  const resolvedDiscount = hasOfferPrice
    ? resolveDiscountPercentage(basePrice, currentPrice, discountPercentage)
    : undefined

  return (
    <div className={`flex ${layout === 'col' || hasOfferPrice ? 'flex-col gap-1' : 'items-center gap-2 flex-wrap'}`}>
      <div className="flex items-center gap-2 flex-wrap">
        <span className={s.current} style={{ color: 'var(--ink)' }}>
          {currentPrice.toFixed(2)} {currencyLabel}
        </span>

        {resolvedDiscount && (
          <OfferBadge
            discount={resolvedDiscount}
            endsAt={offerEndsAt}
            size={size === 'sm' ? 'sm' : 'md'}
          />
        )}
      </div>

      {hasOfferPrice && (
        <span className={`${s.base} line-through`} style={{ color: 'var(--mute)' }}>
          {basePrice.toFixed(2)} {currencyLabel}
        </span>
      )}
    </div>
  )
}
