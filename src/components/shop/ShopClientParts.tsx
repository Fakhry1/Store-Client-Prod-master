'use client'

import Link from 'next/link'
import { useLocale } from '@/context/locale'

// ── CategoryName ──────────────────────────────────────────────────────────────
// ✅ اسم التصنيف حسب اللغة

export function CategoryName({ cat }: {
  cat: { nameAr: string; nameEn: string; id?: number }
}) {
  const { locale } = useLocale()
  return (
    <span className="flex-1 truncate">
      {locale === 'ar' ? cat.nameAr : cat.nameEn}
    </span>
  )
}

// ── ProductCount ──────────────────────────────────────────────────────────────
// ✅ عداد المنتجات حسب اللغة

export function ProductCount({ total, page }: { total: number; page: number }) {
  const { t } = useLocale()
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm font-black" style={{ color: 'var(--ink)' }}>{total}</span>
      <span className="text-sm" style={{ color: 'var(--mute)' }}>{t('products', 'منتج')}</span>
      {page > 1 && (
        <span className="text-xs font-medium" style={{ color: 'var(--mute)' }}>
          · {t('Page', 'صفحة')} {page}
        </span>
      )}
    </div>
  )
}

// ── ActiveFilterChip ──────────────────────────────────────────────────────────
// ✅ chips الفلاتر النشطة حسب اللغة

export function ActiveFilterChip({
  labelEn, labelAr, href
}: {
  labelEn: string; labelAr: string; href: string
}) {
  const { locale } = useLocale()
  const label = locale === 'ar' ? labelAr : labelEn
  return (
    <Link href={href} prefetch={false}
      className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold transition-all hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
      style={{ background: 'rgba(255,107,44,0.08)', color: 'var(--orange)', borderColor: 'rgba(255,107,44,0.20)' }}>
      {label}
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
          d="M6 18L18 6M6 6l12 12" />
      </svg>
    </Link>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
// ✅ رسالة الفراغ حسب اللغة

export function EmptyState({ search }: { search?: string }) {
  const { t } = useLocale()
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4">
      <div className="w-20 h-20 rounded-3xl border bg-white shadow-sm flex items-center justify-center mb-5" style={{ borderColor: 'var(--line)' }}>
        <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--line)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
      </div>
      <h3 className="text-lg font-black mb-1" style={{ color: 'var(--ink)' }}>
        {t('No products found', 'لا توجد منتجات')}
      </h3>
      <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: 'var(--mute)' }}>
        {search
          ? `${t('No results for', 'لا نتائج لـ')} "${search}" — ${t('try a different word', 'جرّب كلمة مختلفة')}`
          : t('No products match the selected filters', 'لا توجد منتجات تطابق الفلاتر المختارة')
        }
      </p>
      <Link href="/shop" prefetch={false}
        className="px-7 py-3 text-white text-sm font-black rounded-2xl transition-colors"
        style={{ background: 'var(--ink)' }}>
        {t('Clear filters', 'مسح الفلاتر')}
      </Link>
    </div>
  )
}

// ── SidebarSectionTitle ───────────────────────────────────────────────────────
// ✅ عنوان قسم الـ sidebar حسب اللغة

export function SidebarSectionTitle({
  titleEn, titleAr
}: {
  titleEn: string; titleAr: string
}) {
  const { locale } = useLocale()
  return (
    <h3 className="text-xs font-black uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--mute)' }}>
      {locale === 'ar' ? titleAr : titleEn}
    </h3>
  )
}