'use client'

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth'
import { useCart } from '@/context/cart'
import { useLocale } from '@/context/locale'

const RECENT_KEY = 'store_recent_searches'
const MAX_RECENT = 5

export function Navbar() {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()
  const { itemCount } = useCart()
  const { locale, toggle, t } = useLocale()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:h-16">
          <Link href="/" className="flex flex-shrink-0 items-center" aria-label={t('inOne home', 'الصفحة الرئيسية inOne')}>
            <span className="text-2xl font-black tracking-[0.2em] text-slate-900 md:text-[28px]">INONE</span>
          </Link>

          <div className="hidden max-w-md flex-1 md:flex">
            <div className="h-9 w-full animate-pulse rounded-xl bg-slate-100" />
          </div>

          <nav className="flex items-center gap-1">
            <span className="hidden h-8 w-14 animate-pulse rounded-lg bg-slate-100 sm:flex" />
            <span className="h-8 w-8 animate-pulse rounded-xl bg-slate-100" />
            <span className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />
          </nav>
        </div>

        <div className="px-4 pb-2.5 md:hidden">
          <div className="h-9 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 md:h-16">
        <div className="flex min-w-0 items-center gap-2.5 md:gap-3">
          <Link href="/" className="flex flex-shrink-0 items-center" aria-label={t('inOne home', 'الصفحة الرئيسية inOne')}>
            <span className="text-2xl font-black tracking-[0.2em] text-slate-900 md:text-[28px]">INONE</span>
          </Link>

          <Link
            href="/shop"
            className="hidden rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500 transition-colors hover:border-amber-300 hover:text-amber-700 md:inline-flex"
          >
            {t('Shop', 'المتجر')}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileSearchOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:border-amber-300 hover:text-slate-600 md:hidden"
          aria-label={t('Open search', 'فتح البحث')}
        >
          <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
          </svg>
          <span className="truncate">{t('Search products...', 'ابحث عن منتجات...')}</span>
        </button>

        <div className="hidden max-w-md flex-1 md:flex">
          <SearchBar placeholder={t('Search products...', 'ابحث عن منتجات...')} />
        </div>

        <nav className="flex items-center gap-1">
          <button
            onClick={toggle}
            aria-label={t('Change language', 'تغيير اللغة')}
            className="hidden items-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition-colors hover:border-amber-400 hover:text-amber-600 md:flex"
          >
            {locale === 'ar' ? 'EN' : 'ع'}
          </button>

          <button
            onClick={toggle}
            aria-label={t('Change language', 'تغيير اللغة')}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-[11px] font-black text-slate-600 transition-colors hover:border-amber-400 hover:text-amber-600 md:hidden"
          >
            {locale === 'ar' ? 'EN' : 'ع'}
          </button>

          <Link
            href="/terms"
            className="hidden px-3 py-2 text-sm font-bold text-slate-500 transition-colors hover:text-amber-700 lg:block"
          >
            {t('Terms', 'الشروط')}
          </Link>

          <Link
            href={user ? '/account' : '/auth/login'}
            className="flex items-center justify-center rounded-xl p-2 transition-colors hover:bg-slate-50 sm:hidden"
            aria-label={user ? t('My account', 'حسابي') : t('Sign in', 'دخول')}
          >
            {isLoading ? (
              <span className="h-8 w-8 animate-pulse rounded-xl bg-slate-100" />
            ) : user ? (
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white">
                {initials || user.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500">
                <UserIcon />
              </span>
            )}
          </Link>

          {isLoading ? (
            <div className="hidden items-center gap-2 px-2 py-1.5 sm:flex">
              <span className="h-8 w-8 animate-pulse rounded-xl bg-slate-100" />
              <span className="hidden h-4 w-16 animate-pulse rounded bg-slate-100 lg:block" />
            </div>
          ) : user ? (
            <div className="relative hidden sm:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className={`flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all ${
                  menuOpen ? 'bg-slate-100 shadow-inner' : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black text-white transition-all ${
                    menuOpen ? 'bg-amber-600 shadow-md shadow-amber-200' : 'bg-slate-900'
                  }`}
                >
                  {initials}
                </div>
                <span className="hidden max-w-24 truncate text-sm font-bold text-slate-700 lg:block">
                  {user.firstName}
                </span>
                <svg
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute end-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">
                  <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="truncate text-[15px] font-bold text-slate-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="py-1.5">
                    {[
                      { href: '/account/profile', label: t('My Profile', 'ملفي الشخصي'), icon: <UserIcon /> },
                      { href: '/orders', label: t('My Orders', 'طلباتي'), icon: <OrderIcon /> },
                      { href: '/wishlist', label: t('Wishlist', 'المفضلة'), icon: <HeartIcon /> },
                      { href: '/account/addresses', label: t('Addresses', 'عناويني'), icon: <LocationIcon /> },
                      { href: '/terms', label: t('Terms & Conditions', 'الشروط والأحكام'), icon: <DocumentIcon /> },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${
                          pathname.startsWith(item.href)
                            ? 'font-bold text-amber-600'
                            : 'font-medium text-slate-700'
                        }`}
                      >
                        <span className={pathname.startsWith(item.href) ? 'text-amber-600' : 'text-slate-400'}>
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-slate-100 py-1.5">
                    <button
                      onClick={async () => {
                        setMenuOpen(false)
                        await logout()
                      }}
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
                className="hidden px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:block"
              >
                {t('Sign in', 'دخول')}
              </Link>
              <Link
                href="/auth/register"
                className="hidden rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white transition-colors hover:bg-amber-600 sm:flex"
              >
                {t('Register', 'تسجيل')}
              </Link>
            </>
          )}

          <Link href="/cart" className="relative rounded-xl p-2.5 transition-colors hover:bg-slate-50">
            <svg className="h-5 w-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-bold text-white">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <div className="border-t border-stone-100 px-4 py-2 md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Link href="/shop?sort=newest" className="whitespace-nowrap rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-black text-white">
            {t('New in', 'وصل حديثًا')}
          </Link>
          <Link href="/shop?sort=price_desc" className="whitespace-nowrap rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
            {t('Premium picks', 'اختيارات فاخرة')}
          </Link>
          <Link href="/shop?sort=price_asc" className="whitespace-nowrap rounded-full border border-stone-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600">
            {t('Smart deals', 'صفقات ذكية')}
          </Link>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <button
            type="button"
            aria-label={t('Close search', 'إغلاق البحث')}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setMobileSearchOpen(false)}
          />

          <div className="absolute inset-x-0 top-0 rounded-b-[32px] border-b border-stone-200 bg-[#fcfaf5] px-4 pb-5 pt-4 shadow-[0_20px_60px_rgba(15,23,42,0.16)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-600">{t('Find faster', 'ابحث أسرع')}</p>
                <p className="mt-1 text-lg font-black text-slate-900">{t('Search the catalog', 'ابحث داخل المتجر')}</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-stone-200 bg-white text-slate-500"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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

function SearchBar({
  placeholder,
  autoFocus = false,
  onSearchComplete,
}: {
  placeholder: string
  autoFocus?: boolean
  onSearchComplete?: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLocale()
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const deferredValue = useDeferredValue(value)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (autoFocus && mounted) {
      inputRef.current?.focus()
    }
  }, [autoFocus, mounted])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const currentSearch = new URLSearchParams(window.location.search).get('search') ?? ''
    setValue(currentSearch)
  }, [pathname])

  useEffect(() => {
    if (!mounted || !focused) return
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
      setRecent(Array.isArray(saved) ? saved : [])
    } catch {
      setRecent([])
    }
  }, [focused, mounted])

  useEffect(() => {
    function handler(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setFocused(false)
        setHighlighted(-1)
      }
    }

    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const saveRecent = useCallback((query: string) => {
    if (!query.trim() || !mounted) return

    try {
      const previous = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]') as string[]
      const next = [query, ...previous.filter((item) => item !== query)].slice(0, MAX_RECENT)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      setRecent(next)
    } catch {
      // Ignore local storage issues.
    }
  }, [mounted])

  function removeRecent(query: string, event: ReactMouseEvent) {
    event.stopPropagation()
    try {
      const next = recent.filter((item) => item !== query)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      setRecent(next)
    } catch {
      setRecent(recent.filter((item) => item !== query))
    }
  }

  function clearRecent() {
    try {
      localStorage.removeItem(RECENT_KEY)
    } catch {
      // Ignore local storage issues.
    }
    setRecent([])
  }

  function doSearch(query: string) {
    const trimmed = query.trim()
    if (trimmed) saveRecent(trimmed)
    setValue(trimmed)
    setFocused(false)
    setHighlighted(-1)
    inputRef.current?.blur()
    onSearchComplete?.()
    router.push(trimmed ? `/shop?search=${encodeURIComponent(trimmed)}` : '/shop')
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    const items = recent.filter((item) => !value || item.toLowerCase().includes(value.toLowerCase()))

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setHighlighted((current) => Math.min(current + 1, items.length - 1))
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setHighlighted((current) => Math.max(current - 1, -1))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (highlighted >= 0 && items[highlighted]) {
        doSearch(items[highlighted])
      } else {
        doSearch(value)
      }
      return
    }

    if (event.key === 'Escape') {
      setFocused(false)
      setHighlighted(-1)
      inputRef.current?.blur()
    }
  }

  const normalizedSearch = deferredValue.trim().toLowerCase()
  const filteredRecent = useMemo(
    () => (
      normalizedSearch
        ? recent.filter((item) => item.toLowerCase().includes(normalizedSearch))
        : recent
    ),
    [normalizedSearch, recent]
  )

  const showDropdown = focused && filteredRecent.length > 0

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className={`relative flex items-center transition-all duration-200 ${focused ? 'rounded-xl ring-2 ring-amber-500/30' : ''}`}>
        <svg
          className="pointer-events-none absolute start-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
          />
        </svg>

        <input
          ref={inputRef}
          type="search"
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(event) => {
            setValue(event.target.value)
            setHighlighted(-1)
          }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pe-10 ps-9 text-sm transition-colors placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              setValue('')
              inputRef.current?.focus()
              router.push('/shop')
            }}
            className="absolute end-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-slate-300 transition-colors hover:bg-slate-400"
          >
            <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/60">
          <div className="flex items-center justify-between px-3 pb-1 pt-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {t('Recent Searches', 'عمليات البحث الأخيرة')}
            </span>
            <button
              onClick={clearRecent}
              className="text-[10px] font-bold text-slate-400 transition-colors hover:text-red-500"
            >
              {t('Clear all', 'مسح الكل')}
            </button>
          </div>

          <div className="py-1">
            {filteredRecent.map((item, index) => (
              <div
                key={item}
                onClick={() => doSearch(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    doSearch(item)
                  }
                }}
                role="button"
                tabIndex={0}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start text-sm transition-colors ${
                  highlighted === index ? 'bg-amber-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <svg className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="truncate font-medium text-slate-700">{item}</span>
                </div>
                <button
                  type="button"
                  onClick={(event) => removeRecent(item, event)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-red-50 hover:text-red-400"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {value.trim() && (
            <div className="border-t border-slate-100 px-3 py-2">
              <button
                onClick={() => doSearch(value)}
                className="flex w-full items-center gap-2 text-sm font-bold text-amber-600 transition-colors hover:text-amber-700"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
                  />
                </svg>
                {t('Search for', 'البحث عن')} &quot;{value.trim()}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
