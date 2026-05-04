import { useMemo, useState } from 'react'

export type CheckoutStep = 'cart' | 'checkout' | 'review'

export function useCheckoutStep(initialStep: CheckoutStep = 'cart') {
  const [step, setStep] = useState<CheckoutStep>(initialStep)

  const canGoBack = step !== 'cart'

  const back = () => {
    setStep((current) => (current === 'review' ? 'checkout' : 'cart'))
  }

  const next = () => {
    setStep((current) => (current === 'cart' ? 'checkout' : current === 'checkout' ? 'review' : 'review'))
  }

  const phase = useMemo(() => {
    if (step === 'cart') return 0
    if (step === 'checkout') return 1
    return 2
  }, [step])

  return {
    step,
    setStep,
    canGoBack,
    back,
    next,
    phase,
  }
}
