'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth'
import { useCart } from '@/context/cart'
import { useLocale } from '@/context/locale'
import { BrandLogo } from '@/components/layout/BrandLogo'
import { SearchBar, SearchIcon } from '@/components/ui/SearchBar'

export function Navbar() {
  const pathname = usePathname()
  const hideOnAuthRoute = pathname.startsWith('/auth')
  const { user, logout, isLoading } = useAuth()
  const { itemCount } = useCart()
  const { locale, toggle, t } = useLocale()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    function handler(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setMobileSearchOpen(false)
  }, [pathname])

  const initials = user
    ? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
    : ''

  if (hideOnAuthRoute) {
    return null
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm" style={{ borderColor: 'var(--line)' }}>
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:h-16">
          <div className="h-9 w-28 inone-skeleton rounded-xl flex-shrink-0" />
          {/* mobile: search trigger skeleton (same as mounted) */}
          <div className="flex min-w-0 flex-1 h-9 inone-skeleton rounded-2xl md:hidden" />
          {/* desktop: search bar skeleton */}
          <div className="hidden max-w-md flex-1 md:flex">
            <div className="h-9 w-full inone-skeleton rounded-xl" />
          </div>
          <nav className="flex items-center gap-1">
            <span className="h-8 w-14 inone-skeleton rounded-lg hidden sm:flex" />
            <span className="h-8 w-8 inone-skeleton rounded-xl" />
            <span className="h-10 w-10 inone-skeleton rounded-xl" />
          </nav>
        </div>
        {/* keep mobile header height stable before hydration */}
        <div className="border-t px-4 md:hidden h-11 flex items-center" style={{ borderColor: 'var(--line)' }}>
          <div className="flex w-full items-center gap-2 overflow-hidden">
            <span className="h-7 w-20 inone-skeleton rounded-full" />
            <span className="h-7 w-16 inone-skeleton rounded-full" />
            <span className="h-7 w-20 inone-skeleton rounded-full" />
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm" style={{ borderColor: 'var(--line)' }}>
      {/* ── Top bar ── */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:h-16">

        {/* Logo + shop link */}
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            href="/"
            className="flex flex-shrink-0 items-center"
            aria-label={t('inOne home', 'الصفحة الرئيسية inOne')}
          >
            <BrandLogo className="h-9 w-auto md:h-10" />
          </Link>

          <Link
            href="/shop"
            className="hidden rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] transition-colors hover:border-orange-400 hover:text-orange-600 md:inline-flex"
            style={{ borderColor: 'var(--line)', color: 'var(--mute)' }}
          >
            {t('Shop', 'المتجر')}
          </Link>
        </div>

        {/* Mobile search trigger */}
        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition-colors hover:border-orange-300 md:hidden"
          style={{ borderColor: 'var(--line)', color: 'var(--mute)', background: 'var(--paper)' }}
          aria-label={t('Open search', 'فتح البحث')}
        >
          <SearchIcon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{t('Search products...', 'ابحث عن منتجات...')}</span>
        </button>

        {/* Desktop search */}
        <div className="hidden max-w-md flex-1 md:flex">
          <SearchBar placeholder={t('Search products...', 'ابحث عن منتجات...')} />
        </div>

        {/* Nav icons */}
        <nav className="flex items-center gap-1">
          {/* Language toggle */}
          <button
            onClick={toggle}
            aria-label={t('Change language', 'تغيير اللغة')}
            className="hidden items-center rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors hover:border-orange-400 md:flex"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            {locale === 'ar' ? 'EN' : 'ع'}
          </button>
          <button
            onClick={toggle}
            aria-label={t('Change language', 'تغيير اللغة')}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border text-[11px] font-black transition-colors hover:border-orange-400 md:hidden"
            style={{ borderColor: 'var(--line)', color: 'var(--ink)' }}
          >
            {locale === 'ar' ? 'EN' : 'ع'}
          </button>

          <Link
            href="/terms"
            className="hidden px-3 py-2 text-sm font-bold transition-colors hover:text-orange-600 lg:block"
            style={{ color: 'var(--mute)' }}
          >
            {t('Terms', 'الشروط')}
          </Link>

          {/* User (mobile) */}
          <Link
            href={user ? '/account' : '/auth/login'}
            className="flex items-center justify-center rounded-xl p-2 transition-colors hover:bg-paper sm:hidden"
            aria-label={user ? t('My account', 'حسابي') : t('Sign in', 'دخول')}
          >
            {isLoading ? (
              <span className="h-8 w-8 inone-skeleton rounded-xl" />
            ) : user ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black text-white"
                style={{ background: 'var(--ink)' }}>
                {initials || user.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border"
                style={{ borderColor: 'var(--line)', color: 'var(--mute)' }}>
                <UserIcon />
              </span>
            )}
          </Link>

          {/* User (desktop) */}
          {isLoading ? (
            <div className="hidden items-center gap-2 px-2 py-1.5 sm:flex">
              <span className="h-8 w-8 inone-skeleton rounded-xl" />
            </div>
          ) : user ? (
            <div className="relative hidden sm:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className={`flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all ${menuOpen ? 'bg-paper-2' : 'hover:bg-paper'}`}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black text-white transition-all"
                  style={{ background: menuOpen ? 'var(--orange)' : 'var(--ink)' }}
                >
                  {initials}
                </div>
                <span className="hidden max-w-24 truncate text-sm font-bold lg:block" style={{ color: 'var(--ink)' }}>
                  {user.firstName}
                </span>
                <ChevronIcon className={`h-3.5 w-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {menuOpen && (
                <div className="absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border bg-white shadow-xl"
                  style={{ borderColor: 'var(--line)' }}>
                  <div className="border-b px-4 py-3" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
                    <p className="truncate text-[15px] font-bold" style={{ color: 'var(--ink)' }}>
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="mt-0.5 truncate text-xs" style={{ color: 'var(--mute)' }}>{user.email}</p>
                  </div>
                  <div className="py-1.5">
                    {[
                      { href: '/account/profile', label: t('My Profile', 'ملفي الشخصي'), icon: <UserIcon /> },
                      { href: '/orders', label: t('My Orders', 'طلباتي'), icon: <OrderIcon /> },
                      { href: '/wishlist', label: t('Wishlist', 'المفضلة'), icon: <HeartIcon /> },
                      { href: '/account/addresses', label: t('Addresses', 'عناويني'), icon: <LocationIcon /> },
                      { href: '/terms', label: t('Terms & Conditions', 'الشروط والأحكام'), icon: <DocumentIcon /> },
                    ].map((item) => {
                      const isActive = pathname.startsWith(item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-paper"
                          style={{ color: isActive ? 'var(--orange)' : 'var(--ink)', fontWeight: isActive ? 700 : 500 }}
                        >
                          <span style={{ color: isActive ? 'var(--orange)' : 'var(--mute)' }}>{item.icon}</span>
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>
                  <div className="border-t py-1.5" style={{ borderColor: 'var(--line)' }}>
                    <button
                      onClick={async () => { setMenuOpen(false); await logout() }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogoutIcon />
                      {t('Sign Out', 'تسجيل الخروج')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="hidden px-3 py-2 text-sm font-medium transition-colors hover:text-orange sm:block"
                style={{ color: 'var(--ink)' }}
              >
                {t('Sign in', 'دخول')}
              </Link>
              <Link
                href="/auth/register"
                className="hidden rounded-xl px-3 py-2 text-sm font-black text-white transition-all hover:opacity-90 sm:flex"
                style={{ background: 'var(--ink)' }}
              >
                {t('Register', 'تسجيل')}
              </Link>
            </>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="relative rounded-xl p-2.5 transition-colors hover:bg-paper"
            aria-label={t('Cart', 'السلة')}
          >
            <CartIcon className="h-5 w-5" style={{ color: 'var(--ink)' }} />
            {itemCount > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-xs font-black text-white"
                style={{ background: 'var(--orange)' }}>
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* ── Mobile category pills ── */}
      <div className="border-t px-4 md:hidden h-11 flex items-center" style={{ borderColor: 'var(--line)' }}>
        <div className="flex w-full items-center gap-2 overflow-x-auto scrollbar-hide">
          {[
            { href: '/shop?sort=newest', label: t('New in', 'وصل حديثًا'), primary: true },
            { href: '/shop?sort=price_desc', label: t('Premium', 'فاخر'), primary: false },
            { href: '/shop?sort=price_asc', label: t('Smart deals', 'صفقات'), primary: false },
          ].map((pill) => (
            <Link
              key={pill.href}
              href={pill.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-black leading-none transition-colors"
              style={pill.primary
                ? { background: 'var(--ink)', color: '#fff' }
                : { background: '#fff', color: 'var(--ink)', border: '1px solid var(--line)' }
              }
            >
              {pill.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Mobile full-screen search overlay ── */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <button
            type="button"
            aria-label={t('Close search', 'إغلاق البحث')}
            className="absolute inset-0 backdrop-blur-sm"
            style={{ background: 'rgba(10,31,68,0.45)' }}
            onClick={() => setMobileSearchOpen(false)}
          />
          <div className="absolute inset-x-0 top-0 rounded-b-[32px] border-b px-4 pb-5 pt-4 shadow-[0_20px_60px_rgba(10,31,68,0.18)]"
            style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: 'var(--orange)' }}>
                  {t('Find faster', 'ابحث أسرع')}
                </p>
                <p className="mt-1 text-lg font-black" style={{ color: 'var(--ink)' }}>
                  {t('Search the catalog', 'ابحث داخل المتجر')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border bg-white"
                style={{ borderColor: 'var(--line)', color: 'var(--mute)' }}
              >
                <CloseIcon />
              </button>
            </div>
            <SearchBar
              placeholder={t('Search products...', 'ابحث عن منتجات...')}
              autoFocus
              onSearchComplete={() => setMobileSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  )
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
const CartIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
)
const UserIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)
const OrderIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)
const HeartIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
)
const LocationIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const LogoutIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)
const DocumentIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)
const ChevronIcon = ({ className }: { className?: string }) => (
  <svg className={className} style={{ color: 'var(--mute)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
  </svg>
)
const CloseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const CloseSmIcon = () => (
  <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const ClockIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
