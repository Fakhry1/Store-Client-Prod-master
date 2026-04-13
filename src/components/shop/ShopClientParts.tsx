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
      <span className="text-sm font-black text-slate-900">{total}</span>
      <span className="text-sm text-slate-400">{t('products', 'منتج')}</span>
      {page > 1 && (
        <span className="text-xs text-slate-400 font-medium">
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
      className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-800
        border border-amber-200 rounded-full text-xs font-bold hover:bg-red-50
        hover:text-red-700 hover:border-red-200 transition-all">
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
      <div className="w-20 h-20 rounded-3xl bg-white border border-slate-100 shadow-sm
        flex items-center justify-center mb-5">
        <svg className="w-9 h-9 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" />
        </svg>
      </div>
      <h3 className="text-lg font-black text-slate-800 mb-1">
        {t('No products found', 'لا توجد منتجات')}
      </h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs leading-relaxed">
        {search
          ? `${t('No results for', 'لا نتائج لـ')} "${search}" — ${t('try a different word', 'جرّب كلمة مختلفة')}`
          : t('No products match the selected filters', 'لا توجد منتجات تطابق الفلاتر المختارة')
        }
      </p>
      <Link href="/shop" prefetch={false}
        className="px-7 py-3 bg-slate-900 text-white text-sm font-black
          rounded-2xl hover:bg-amber-500 transition-colors">
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
    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
      {locale === 'ar' ? titleAr : titleEn}
    </h3>
  )
}