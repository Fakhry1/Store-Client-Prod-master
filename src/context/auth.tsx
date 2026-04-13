'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authApi, cartApi } from '@/lib/api'
import { COOKIE_AUTH_SESSION } from '@/lib/api/client'
import type { CustomerUser } from '@/types'

interface AuthContextValue {
  user: CustomerUser | null
  token: string | null
  isLoading: boolean
  login: (phoneNumber: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: CustomerUser) => void
  register: (data: {
    firstName: string
    lastName?: string
    email?: string
    password: string
    confirmPassword: string
    phoneNumber: string
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SESSION_KEY = 'store_guest_session'
const AUTH_HINT_COOKIE = 'store_auth_hint'
const CART_SYNC_EVENT = 'store:cart-sync'

function setAuthHint(enabled: boolean) {
  if (typeof document === 'undefined') return
  const secure =
    process.env.NODE_ENV === 'production' ||
    (typeof window !== 'undefined' && window.location.protocol === 'https:')
      ? '; Secure'
      : ''

  if (enabled) {
    document.cookie = `${AUTH_HINT_COOKIE}=1; path=/; SameSite=Lax; max-age=2592000${secure}`
    return
  }

  document.cookie = `${AUTH_HINT_COOKIE}=; path=/; SameSite=Lax; max-age=0${secure}`
}

function hasAuthHint(): boolean {
  if (typeof document === 'undefined') return false
  return document.cookie.split(';').some((cookie) => cookie.trim().startsWith(`${AUTH_HINT_COOKIE}=`))
}

function notifyCartSync() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(CART_SYNC_EVENT))
}

function normalizeSessionToken(token?: string | null): string {
  const trimmed = token?.trim()
  return trimmed || COOKIE_AUTH_SESSION
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const persistSession = useCallback((nextUser: CustomerUser, nextToken: string = COOKIE_AUTH_SESSION) => {
    setUser(nextUser)
    setToken(normalizeSessionToken(nextToken))
    setAuthHint(true)
  }, [])

  const clearSession = useCallback(() => {
    setUser(null)
    setToken(null)
    setAuthHint(false)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrapAuth() {
      if (!hasAuthHint()) {
        if (!cancelled) {
          clearSession()
          setIsLoading(false)
        }
        return
      }

      try {
        const currentUser = await authApi.me()
        if (!cancelled) {
          persistSession(currentUser, COOKIE_AUTH_SESSION)
        }
      } catch {
        if (!cancelled) {
          clearSession()
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    bootstrapAuth()

    return () => {
      cancelled = true
    }
  }, [clearSession, persistSession])

  const updateUser = useCallback((nextUser: CustomerUser) => {
    persistSession(nextUser, token ?? COOKIE_AUTH_SESSION)
  }, [persistSession, token])

  const mergeGuestCart = useCallback(async (authToken?: string) => {
    if (typeof window === 'undefined') return

    const sessionId = localStorage.getItem(SESSION_KEY)
    if (!sessionId) return

    try {
      await cartApi.mergeGuest(authToken ?? COOKIE_AUTH_SESSION, sessionId)
      localStorage.removeItem(SESSION_KEY)
      notifyCartSync()
    } catch {
      // Guest cart may be empty or already expired.
    }
  }, [])

  const login = useCallback(async (phoneNumber: string, password: string) => {
    const res = await authApi.login(phoneNumber, password)
    const customerData = res.customer ?? res.user
    const fallbackToken = normalizeSessionToken(res.accessToken)

    if (!customerData) {
      clearSession()
      throw new Error('Unable to start your session. Please try again.')
    }

    let activeToken = fallbackToken
    persistSession(customerData, activeToken)

    try {
      const currentUser = await authApi.me()
      activeToken = COOKIE_AUTH_SESSION
      persistSession(currentUser, activeToken)
    } catch {
      if (fallbackToken !== COOKIE_AUTH_SESSION) {
        try {
          const currentUser = await authApi.me(fallbackToken)
          persistSession(currentUser, fallbackToken)
        } catch {
          // Keep the in-memory fallback token for the active tab only.
        }
      }
    }

    await mergeGuestCart(activeToken)
  }, [clearSession, mergeGuestCart, persistSession])

  const register = useCallback(async (data: Parameters<typeof authApi.register>[0]) => {
    const res = await authApi.register(data)
    const customerData = res.customer ?? res.user
    const fallbackToken = normalizeSessionToken(res.accessToken)

    if (!customerData) {
      clearSession()
      throw new Error('Unable to start your session. Please try again.')
    }

    let activeToken = fallbackToken
    persistSession(customerData, activeToken)

    try {
      const currentUser = await authApi.me()
      activeToken = COOKIE_AUTH_SESSION
      persistSession(currentUser, activeToken)
    } catch {
      if (fallbackToken !== COOKIE_AUTH_SESSION) {
        try {
          const currentUser = await authApi.me(fallbackToken)
          persistSession(currentUser, fallbackToken)
        } catch {
          // Best-effort refresh only. Keep the login/register payload in memory.
        }
      }
    }

    await mergeGuestCart(activeToken)
  }, [clearSession, mergeGuestCart, persistSession])

  const logout = useCallback(async () => {
    try {
      await authApi.logout(token ?? COOKIE_AUTH_SESSION)
    } catch {
      // Best effort. Client state should still be cleared.
    } finally {
      clearSession()
    }
  }, [clearSession, token])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function getGuestSession(): string {
  if (typeof window === 'undefined') return ''

  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }

  return id
}
