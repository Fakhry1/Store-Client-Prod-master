'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { CartProvider } from '@/context/cart'
import { ToastProvider } from '@/components/ui/Toaster'
import { Navbar } from '@/components/layout/Navbar'
import { BottomNav } from '@/components/layout/BottomNav'

function isAuthRoute(pathname: string): boolean {
  return pathname.startsWith('/auth')
}

export function RouteScopedShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (isAuthRoute(pathname)) {
    return <main>{children}</main>
  }

  return (
    <CartProvider>
      <ToastProvider>
        <Navbar />
        <main className="pb-20 md:pb-0">{children}</main>
        <BottomNav />
      </ToastProvider>
    </CartProvider>
  )
}
