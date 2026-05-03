'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import { cartApi } from '@/lib/api'
import { useAuth, getGuestSession } from './auth'
import type { Cart } from '@/types'

const CART_SYNC_EVENT = 'store:cart-sync'
const STALE_MS = 30_000

interface CartContextValue {
  cart: Cart | null
  itemCount: number
  isLoading: boolean
  addItem: (productId: number, variantId: number, branchId: number, qty?: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  refreshCart: (force?: boolean) => Promise<Cart | null>
}

type FetchCartOptions = {
  force?: boolean
  background?: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, isLoading: authLoading } = useAuth()
  const [cart, setCart]         = useState<Cart | null>(null)
  const [isLoading, setLoading] = useState(true)
  const lastFetchRef            = useRef<number>(0)
  const cartRef                 = useRef<Cart | null>(null)

  const fetchCart = useCallback(async ({ force = false, background = false }: FetchCartOptions = {}) => {
    if (authLoading) return cartRef.current
    if (!force && Date.now() - lastFetchRef.current < STALE_MS) return cartRef.current

    if (!background) {
      setLoading(true)
    }

    try {
      let data: Cart
      if (token) {
        data = await cartApi.get(token)
      } else {
        const sessionId = getGuestSession()
        data = await cartApi.getGuest(sessionId)
      }
      lastFetchRef.current = Date.now()
      cartRef.current = data
      setCart(data)
      return data
    } catch {
      if (!background) {
        cartRef.current = null
        setCart(null)
      }
      return null
    } finally {
      if (!background) {
        setLoading(false)
      }
    }
  }, [authLoading, token])

  useEffect(() => {
    // Defer initial cart fetch until after first paint to reduce TBT
    const timer = window.setTimeout(() => void fetchCart(), 0)
    return () => window.clearTimeout(timer)
  }, [fetchCart])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleCartSync = () => { void fetchCart({ force: true, background: true }) }

    window.addEventListener(CART_SYNC_EVENT, handleCartSync)
    return () => { window.removeEventListener(CART_SYNC_EVENT, handleCartSync) }
  }, [fetchCart])

  const addItem = useCallback(async (
    productId: number, variantId: number, branchId: number, qty = 1
  ) => {
    const data = { productId, productVariantId: variantId, branchId, quantity: qty }
    if (token) {
      await cartApi.add(token, data)
    } else {
      await cartApi.addGuest(getGuestSession(), data)
    }
    void fetchCart({ force: true, background: true })
  }, [token, fetchCart])

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    if (token) {
      await cartApi.updateItem(token, itemId, quantity)
    } else {
      await cartApi.updateGuestItem(getGuestSession(), itemId, quantity)
    }
    void fetchCart({ force: true, background: true })
  }, [token, fetchCart])

  const removeItem = useCallback(async (itemId: number) => {
    if (token) {
      await cartApi.removeItem(token, itemId)
    } else {
      await cartApi.removeGuestItem(getGuestSession(), itemId)
    }
    void fetchCart({ force: true, background: true })
  }, [token, fetchCart])

  return (
    <CartContext.Provider value={{
      cart,
      itemCount: cart?.totalItems ?? 0,
      isLoading,
      addItem,
      updateItem,
      removeItem,
      refreshCart: (force = false) => fetchCart({ force }),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}