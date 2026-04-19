'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/cart'
import { useAuth } from '@/context/auth'
import { useLocale } from '@/context/locale'

export function BottomNav() {
  const pathname      = usePathname()
  const { itemCount } = useCart()
  const { user, isLoading } = useAuth()
  const { t }         = useLocale()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // يُخفى BottomNav في صفحة المنتج (sticky Add to Cart يتولى المهمة)
  const hideOn = ['/auth/login', '/auth/register']
  if (hideOn.includes(pathname)) return null

  if (!mounted) {
    return (
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.07)]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-[60px] px-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center justify-center gap-1">
              <div className="w-5 h-5 rounded bg-slate-100 animate-pulse" />
              <div className="w-8 h-2 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </nav>
    )
  }

  const links = [
    {
      href:   '/',
      label:  t('Home', 'الرئيسية'),
      active: pathname === '/',
      icon: (a: boolean) => (
        <svg className="w-5 h-5" fill={a ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.8}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href:   '/shop',
      label:  t('Shop', 'المتجر'),
      active: pathname.startsWith('/shop') || pathname.startsWith('/product'),
      icon: (a: boolean) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 2.2 : 1.8}
            d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      href:   '/cart',
      label:  t('Cart', 'السلة'),
      active: pathname === '/cart',
      badge:  itemCount > 0 ? itemCount : undefined,
      icon: (a: boolean) => (
        <svg className="w-5 h-5" fill={a ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.8}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      href:   '/wishlist',
      label:  t('Saved', 'المفضلة'),
      active: pathname === '/wishlist',
      icon: (a: boolean) => (
        <svg className="w-5 h-5" fill={a ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.8}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      href:   user ? '/account' : '/auth/login',
      label:  user ? t('Account', 'حسابي') : t('Sign in', 'دخول'),
      active: pathname.startsWith('/account') || pathname.startsWith('/auth'),
      icon: (a: boolean) => isLoading ? (
        <div className="w-6 h-6 rounded-lg bg-slate-100 animate-pulse" />
      ) : user ? (
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center
          font-black text-[11px] transition-all
          ${a ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
          {user.firstName?.charAt(0).toUpperCase()}
        </div>
      ) : (
        <svg className="w-5 h-5" fill={a ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.8}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50
      bg-white/95 backdrop-blur border-t border-slate-100
      shadow-[0_-4px_24px_rgba(0,0,0,0.07)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="grid grid-cols-5 h-[60px]">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex flex-col items-center justify-center gap-0.5
              transition-all duration-150 active:scale-90
              ${link.active ? 'text-amber-600' : 'text-slate-400'}`}>

            {/* Active indicator dot */}
            {link.active && (
              <span className="absolute top-1 w-1 h-1 rounded-full bg-amber-500" />
            )}

            {/* Badge */}
            {link.badge && (
              <span className="absolute top-1.5 start-1/2 translate-x-2 min-w-[16px] h-4
                bg-red-500 text-white text-[9px] font-black rounded-full
                flex items-center justify-center px-1 z-10">
                {link.badge > 9 ? '9+' : link.badge}
              </span>
            )}

            <div className={`transition-transform duration-150 ${link.active ? 'scale-110' : 'scale-100'}`}>
              {link.icon(link.active)}
            </div>

            <span className={`text-[9px] font-bold leading-none
              ${link.active ? 'text-amber-600' : 'text-slate-400'}`}>
              {link.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
