'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth'
import { useLocale } from '@/context/locale'

const MENU_ITEMS = [
  {
    href: '/account/profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    labelEn: 'My Profile', labelAr: 'ملفي الشخصي',
    subEn: 'Edit your info and password', subAr: 'تعديل بياناتك وكلمة المرور',
    last: false,
  },
  {
    href: '/orders',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    labelEn: 'My Orders', labelAr: 'طلباتي',
    subEn: 'Track and manage your orders', subAr: 'تتبع طلباتك وإدارتها',
    last: false,
  },
  {
    href: '/wishlist',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    labelEn: 'Wishlist', labelAr: 'المفضلة',
    subEn: 'Products you saved for later', subAr: 'المنتجات التي حفظتها',
    last: false,
  },
  {
    href: '/account/addresses',
    icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z',
    labelEn: 'Addresses', labelAr: 'العناوين',
    subEn: 'Manage your pickup addresses', subAr: 'إدارة عناوين الاستلام',
    last: true,
  },
]

export default function AccountPage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuth()
  const { t } = useLocale()

  useEffect(() => {
    if (!isLoading && !user) router.push('/auth/login')
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--paper)' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'var(--line)', borderTopColor: 'var(--ink)' }} />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen py-6 md:py-8" style={{ background: 'var(--paper)' }}>
      <div className="max-w-xl mx-auto px-4">

        {/* Profile card */}
        <div className="mb-4 overflow-hidden rounded-[34px] border bg-white shadow-[0_18px_38px_rgba(15,23,42,0.05)]" style={{ borderColor: 'var(--line)' }}>
          <div className="h-20" style={{ background: 'linear-gradient(135deg, var(--ink), var(--black))' }} />
          <div className="p-6 -mt-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[22px] border-4 border-white shadow-md"
                style={{ background: 'var(--orange)' }}>
                <span className="text-2xl font-black text-white">
                  {user.firstName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0 pt-3">
                <h2 className="text-lg font-black truncate" style={{ color: 'var(--ink)' }}>
                  {user.firstName} {user.lastName}
                </h2>
                {user.phoneNumber && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--mute)' }}>
                    <span dir="ltr">{user.phoneNumber}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="mb-4 overflow-hidden rounded-[34px] border bg-white shadow-[0_18px_38px_rgba(15,23,42,0.05)]" style={{ borderColor: 'var(--line)' }}>
          {MENU_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-4 px-5 py-4 transition-colors hover:opacity-80 ${!item.last ? 'border-b' : ''}`}
              style={{ borderColor: 'var(--line)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--paper)', color: 'var(--ink)' }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: 'var(--ink)' }}>{t(item.labelEn, item.labelAr)}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--mute)' }}>{t(item.subEn, item.subAr)}</p>
              </div>
              <svg className="w-4 h-4 flex-shrink-0 flip-rtl" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={{ color: 'var(--line)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Sign out */}
        <button onClick={async () => { await logout(); router.push('/shop') }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-red-100 py-3.5 text-sm font-black text-red-500 transition-colors hover:bg-red-50">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {t('Sign Out', 'تسجيل الخروج')}
        </button>

      </div>
    </div>
  )
}
