'use client'

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from '@/context/locale'

const RECENT_KEY = 'store_recent_searches'
const MAX_RECENT = 5

export function SearchBar({
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

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (autoFocus && mounted) inputRef.current?.focus()
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
    } catch { setRecent([]) }
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
    } catch { /* ignore */ }
  }, [mounted])

  function removeRecent(query: string, event: ReactMouseEvent) {
    event.stopPropagation()
    try {
      const next = recent.filter((item) => item !== query)
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
      setRecent(next)
    } catch { setRecent(recent.filter((item) => item !== query)) }
  }

  function clearRecent() {
    try { localStorage.removeItem(RECENT_KEY) } catch { /* ignore */ }
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
    if (event.key === 'ArrowDown') { event.preventDefault(); setHighlighted((c) => Math.min(c + 1, items.length - 1)); return }
    if (event.key === 'ArrowUp')   { event.preventDefault(); setHighlighted((c) => Math.max(c - 1, -1)); return }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (highlighted >= 0 && items[highlighted]) doSearch(items[highlighted])
      else doSearch(value)
      return
    }
    if (event.key === 'Escape') { setFocused(false); setHighlighted(-1); inputRef.current?.blur() }
  }

  const normalizedSearch = deferredValue.trim().toLowerCase()
  const filteredRecent = useMemo(
    () => normalizedSearch ? recent.filter((i) => i.toLowerCase().includes(normalizedSearch)) : recent,
    [normalizedSearch, recent]
  )

  const showDropdown = focused && filteredRecent.length > 0

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div
        className={`relative flex items-center transition-all duration-200 ${focused ? 'rounded-xl ring-2' : ''}`}
        style={focused ? { '--tw-ring-color': 'rgba(255,107,44,0.25)' } as React.CSSProperties : {}}
      >
        <SearchIcon
          className="pointer-events-none absolute start-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--mute)' }}
        />
        <input
          ref={inputRef}
          type="search"
          value={value}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          onChange={(e) => { setValue(e.target.value); setHighlighted(-1) }}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          className="w-full rounded-xl border bg-white py-2 pe-10 ps-9 text-sm transition-colors placeholder:text-[var(--mute)] focus:outline-none"
          style={{ borderColor: focused ? 'var(--orange)' : 'var(--line)', color: 'var(--ink)' }}
        />
        {value && (
          <button
            type="button"
            onClick={() => { setValue(''); inputRef.current?.focus(); router.push('/shop') }}
            className="absolute end-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full transition-colors"
            style={{ background: 'var(--paper-2)' }}
          >
            <CloseSmIcon />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className="absolute top-full z-50 mt-1.5 w-full overflow-hidden rounded-2xl border bg-white shadow-xl"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="flex items-center justify-between px-3 pb-1 pt-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--mute)' }}>
              {t('Recent Searches', 'عمليات البحث الأخيرة')}
            </span>
            <button
              onClick={clearRecent}
              className="text-[10px] font-bold transition-colors hover:text-red-500"
              style={{ color: 'var(--mute)' }}
            >
              {t('Clear all', 'مسح الكل')}
            </button>
          </div>
          <div className="py-1">
            {filteredRecent.map((item, index) => (
              <div
                key={item}
                onClick={() => doSearch(item)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doSearch(item) } }}
                role="button"
                tabIndex={0}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start text-sm transition-colors"
                style={{ background: highlighted === index ? 'rgba(255,107,44,0.06)' : undefined }}
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <ClockIcon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'var(--champagne)' }} />
                  <span className="truncate font-medium" style={{ color: 'var(--ink)' }}>{item}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => removeRecent(item, e)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-red-50 hover:text-red-400"
                  style={{ color: 'var(--mute)' }}
                >
                  <CloseSmIcon />
                </button>
              </div>
            ))}
          </div>
          {value.trim() && (
            <div className="border-t px-3 py-2" style={{ borderColor: 'var(--line)' }}>
              <button
                onClick={() => doSearch(value)}
                className="flex w-full items-center gap-2 text-sm font-bold transition-colors hover:opacity-80"
                style={{ color: 'var(--orange)' }}
              >
                <SearchIcon className="h-4 w-4" />
                {t('Search for', 'البحث عن')} &quot;{value.trim()}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
export const SearchIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
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
