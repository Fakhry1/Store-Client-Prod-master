import { useCallback, useEffect, useState } from 'react'
import { promoApi, walletApi } from '@/lib/api'
import type { Cart, CustomerWalletDetails, PromoResult } from '@/types'

type Translator = (en: string, ar: string) => string

type UsePromoWalletParams = {
  token: string | null
  cart: Cart | null
  t: Translator
  onInfo: (message: string) => void
  onRequireLogin: () => void
}

export function usePromoWallet({ token, cart, t, onInfo, onRequireLogin }: UsePromoWalletParams) {
  const [promo, setPromo] = useState('')
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)

  const [walletDetails, setWalletDetails] = useState<CustomerWalletDetails | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [useWalletBalance, setUseWalletBalance] = useState(false)

  const handleApplyPromo = useCallback(async () => {
    if (!promo.trim() || !cart) return
    if (!token) {
      onInfo(t('Login first to apply promo codes', 'سجّل الدخول أولاً لتطبيق أكواد الخصم'))
      onRequireLogin()
      return
    }

    setPromoLoading(true)
    setPromoResult(null)
    try {
      const result = await promoApi.validate(token, promo.trim().toUpperCase(), cart.subtotal)
      setPromoResult(result)
    } catch {
      setPromoResult({ isValid: false, errorMessage: t('Failed to validate', 'فشل التحقق') })
    } finally {
      setPromoLoading(false)
    }
  }, [cart, onInfo, onRequireLogin, promo, t, token])

  const handleRemovePromo = useCallback(() => {
    setPromoResult(null)
    setPromo('')
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadWallet() {
      if (!token) {
        if (!cancelled) {
          setWalletDetails(null)
          setUseWalletBalance(false)
        }
        return
      }

      setWalletLoading(true)
      try {
        const wallet = await walletApi.me(token, 10)
        if (!cancelled) {
          setWalletDetails(wallet)
          if ((wallet?.balance ?? 0) <= 0) {
            setUseWalletBalance(false)
          }
        }
      } catch {
        if (!cancelled) {
          setWalletDetails(null)
          setUseWalletBalance(false)
        }
      } finally {
        if (!cancelled) {
          setWalletLoading(false)
        }
      }
    }

    void loadWallet()

    return () => {
      cancelled = true
    }
  }, [token])

  return {
    promo,
    setPromo,
    promoResult,
    promoLoading,
    handleApplyPromo,
    handleRemovePromo,
    walletDetails,
    walletLoading,
    useWalletBalance,
    setUseWalletBalance,
  }
}
