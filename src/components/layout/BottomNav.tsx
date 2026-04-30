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

  useEffect(() => { setMounted(true) }, [])

  const hideOn = ['/auth/login', '/auth/register']
  if (hideOn.includes(pathname)) return null

  if (!mounted) {
    return (
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t"
        style={{ borderColor: 'var(--line)', boxShadow: '0 -4px 24px rgba(10,31,68,0.07)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="grid grid-cols-5 h-[60px] px-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center gap-1">
              <div className="w-5 h-5 rounded inone-skeleton" />
              <div className="w-8 h-2 rounded inone-skeleton" />
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
      icon: (active: boolean) => (
        <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.8}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href:   '/shop',
      label:  t('Shop', 'المتجر'),
      active: pathname.startsWith('/shop') || pathname.startsWith('/product'),
      icon: (active: boolean) => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.2 : 1.8}
            d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
    },
    {
      href:   '/cart',
      label:  t('Cart', 'السلة'),
      active: pathname === '/cart',
      badge:  itemCount > 0 ? itemCount : undefined,
      icon: (active: boolean) => (
        <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.8}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      href:   '/wishlist',
      label:  t('Saved', 'المفضلة'),
      active: pathname === '/wishlist',
      icon: (active: boolean) => (
        <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.8}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      href:   user ? '/account' : '/auth/login',
      label:  user ? t('Account', 'حسابي') : t('Sign in', 'دخول'),
      active: pathname.startsWith('/account') || pathname.startsWith('/auth'),
      icon: (active: boolean) => isLoading ? (
        <div className="w-6 h-6 rounded-lg inone-skeleton" />
      ) : user ? (
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[11px] transition-all"
          style={{ background: active ? 'var(--orange)' : 'var(--paper-2)', color: active ? '#fff' : 'var(--ink)' }}
        >
          {user.firstName?.charAt(0).toUpperCase()}
        </div>
      ) : (
        <svg className="w-5 h-5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 1.8}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t"
      style={{ borderColor: 'var(--line)', boxShadow: '0 -4px 24px rgba(10,31,68,0.07)', paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5 h-[60px]">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="relative flex flex-col items-center justify-center gap-0.5 transition-all duration-150 active:scale-90"
            style={{ color: link.active ? 'var(--orange)' : 'var(--mute)' }}
          >
            {/* Active indicator */}
            {link.active && (
              <span
                className="absolute top-1.5 h-1 w-5 rounded-full"
                style={{ background: 'var(--orange)' }}
              />
            )}

            {/* Cart badge */}
            {link.badge && (
              <span
                className="absolute top-1.5 start-1/2 translate-x-2 min-w-[16px] h-4 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 z-10"
                style={{ background: 'var(--orange)' }}
              >
                {link.badge > 9 ? '9+' : link.badge}
              </span>
            )}

            <div className={`transition-transform duration-150 ${link.active ? 'scale-110' : 'scale-100'}`}>
              {link.icon(link.active)}
            </div>

            <span className="text-[9px] font-bold leading-none">
              {link.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
