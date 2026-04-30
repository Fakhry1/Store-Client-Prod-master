'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
  leaving?: boolean
}

interface ToastContextValue {
  success: (msg: string) => void
  error:   (msg: string) => void
  info:    (msg: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
let counter = 0

// ToastProvider wraps the app — must be an ancestor of any component using useToast
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((message: string, type: ToastType) => {
    const id = ++counter
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts(t => t.map(x => x.id === id ? { ...x, leaving: true } : x))
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 220)
    }, 3200)
  }, [])

  const ICONS: Record<ToastType, string> = {
    success: '✓',
    error:   '✕',
    info:    'ℹ',
  }
  const ICON_STYLE: Record<ToastType, React.CSSProperties> = {
    success: { background: '#22c55e' },
    error:   { background: '#ef4444' },
    info:    { background: 'var(--ink)' },
  }

  return (
    <ToastContext.Provider value={{
      success: m => add(m, 'success'),
      error:   m => add(m, 'error'),
      info:    m => add(m, 'info'),
    }}>
      {children}
      {/* Toast portal — fixed top right */}
      <div className="fixed top-4 end-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-xs w-full">
        {toasts.map(toast => (
          <div key={toast.id}
            className={`${toast.leaving ? 'toast-out' : 'toast-in'}
              flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg
              bg-white border pointer-events-auto`}
            style={{ borderColor: 'var(--line)' }}>
            <span className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
              style={ICON_STYLE[toast.type]}>
              {ICONS[toast.type]}
            </span>
            <p className="text-sm font-semibold leading-snug" style={{ color: 'var(--ink)' }}>{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Keep Toaster as alias for backward compatibility
export const Toaster = ToastProvider

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be inside Toaster')
  return ctx
}