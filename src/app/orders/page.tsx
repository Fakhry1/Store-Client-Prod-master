'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { orderApi, walletApi } from '@/lib/api'
import { useAuth } from '@/context/auth'
import { useLocale } from '@/context/locale'
import { getCurrencyLabel } from '@/lib/store'
import type { CustomerWalletDetails, DeliveryStatus, Order } from '@/types'

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS: Record<number, { en: string; ar: string; color: string; dot: string }> = {
  0: { en: 'Pending Review',   ar: 'قيد المراجعة',    color: 'bg-slate-100 text-slate-600 border-slate-200',  dot: 'bg-slate-400'  },
  1: { en: 'Confirmed',        ar: 'تم التأكيد',      color: 'bg-blue-50 text-blue-700 border-blue-200',      dot: 'bg-blue-500'   },
  2: { en: 'Preparing',        ar: 'قيد التجهيز',     color: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500'  },
  3: { en: 'Ready for Pickup', ar: 'جاهز للاستلام',   color: 'bg-teal-50 text-teal-700 border-teal-200',      dot: 'bg-teal-500'   },
  4: { en: 'Picked Up',        ar: 'تم الاستلام',     color: 'bg-green-50 text-green-700 border-green-200',   dot: 'bg-green-500'  },
  5: { en: 'Cancelled',        ar: 'ملغى',            color: 'bg-red-50 text-red-600 border-red-200',         dot: 'bg-red-500'    },
}

const STEPS_EN = ['Pending Review', 'Confirmed', 'Preparing', 'Ready', 'Picked Up']
const STEPS_AR = ['مراجعة',         'تأكيد',    'تجهيز',   'جاهز', 'تم الاستلام']

const FILTER_TABS = [
  { key: -1, en: 'All',       ar: 'الكل'        },
  { key: 0,  en: 'Pending',   ar: 'قيد الانتظار'},
  { key: 2,  en: 'Active',    ar: 'نشط'          },
  { key: 3,  en: 'Ready',     ar: 'جاهز'         },
  { key: 4,  en: 'Completed', ar: 'مكتمل'        },
]

const DELIVERY_STATUS_UI: Record<DeliveryStatus, { en: string; ar: string; color: string }> = {
  0: { en: 'Assigned', ar: 'تم الإسناد', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  1: { en: 'In Delivery', ar: 'قيد التوصيل', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  2: { en: 'Delivered', ar: 'تم التسليم', color: 'bg-green-50 text-green-700 border-green-200' },
  3: { en: 'Delivery Cancelled', ar: 'تم إلغاء التوصيل', color: 'bg-red-50 text-red-600 border-red-200' },
}

type FulfillmentKind = 'pickup' | 'delivery'

const STATUS_ICONS: Record<number, string> = {
  0: '🕐',
  1: '✓',
  2: '⚙',
  3: '📦',
  4: '✅',
  5: '✕',
}

const normalizeFulfillmentType = (value: Order['fulfillmentType']): FulfillmentKind =>
  String(value).toLowerCase() === '2' || String(value).toLowerCase() === 'delivery'
    ? 'delivery'
    : 'pickup'

const getFulfillmentKind = (order?: Partial<Order> | null): FulfillmentKind => {
  if (!order) return 'pickup'

  if (
    order.deliveryAssignment ||
    order.deliveryAddress ||
    (typeof order.deliveryFee === 'number' && order.deliveryFee > 0)
  ) {
    return 'delivery'
  }

  if (
    order.statusHistory?.some((entry) => {
      const note = entry.notes?.toLowerCase() ?? ''
      return note.includes('delivery order created') || note.includes('delivery')
    })
  ) {
    return 'delivery'
  }

  return normalizeFulfillmentType(order.fulfillmentType as Order['fulfillmentType'])
}

const getStatusMeta = (order: Order) => {
  const fulfillment = getFulfillmentKind(order)
  if (fulfillment === 'delivery' && order.status === 3) {
    return {
      en: 'In Delivery',
      ar: 'قيد التوصيل',
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-blue-500',
        icon: '🚚',
    }
  }

  if (fulfillment === 'delivery' && order.status === 4) {
    return {
      en: 'Delivered',
      ar: 'تم التسليم',
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-green-500',
        icon: '📬',
    }
  }

  const fallback = STATUS[order.status] ?? STATUS[0]
  return {
    ...fallback,
    icon: STATUS_ICONS[order.status] ?? '•',
  }
}

const getOrderSteps = (order: Order, locale: 'en' | 'ar') => {
  const fulfillment = getFulfillmentKind(order)

  if (fulfillment === 'delivery') {
    return locale === 'ar'
      ? ['انتظار', 'تأكيد', 'تحضير', 'قيد التوصيل', 'تم التسليم']
      : ['Pending', 'Confirmed', 'Preparing', 'In Delivery', 'Delivered']
  }

  return locale === 'ar'
    ? STEPS_AR
    : STEPS_EN
}

const getWalletAppliedAmount = (order: Order) => order.walletAmountApplied ?? 0

const getAmountDue = (order: Order) => order.amountDue ?? order.total

const getCurrentStep = (order: Order) => {
  if (order.status === 5) return -1

  const fulfillment = getFulfillmentKind(order)
  if (fulfillment !== 'delivery') {
    return Math.min(order.status, 4)
  }

  const deliveryStatus = order.deliveryAssignment?.deliveryStatus
  if (deliveryStatus === 2) return 4
  if (deliveryStatus === 1) return 3
  if (order.status >= 2 && order.deliveryAssignment) return 3
  return Math.min(order.status, 2)
}

const textHasAny = (value: string | null | undefined, patterns: string[]) => {
  if (!value) return false
  const normalized = value.toLowerCase()
  return patterns.some((pattern) => normalized.includes(pattern))
}

const getOrderActivityFlags = (order: Order, walletDetails?: CustomerWalletDetails | null) => {
  const replacementPatterns = ['replacement', 'replace', 'استبدال', 'بديل']
  const returnPatterns = ['return', 'refund', 'استرجاع', 'ارجاع', 'مرتجع']
  const historyEntries = order.statusHistory ?? []
  const relatedTransactions = (walletDetails?.transactions ?? []).filter(
    (transaction) => transaction.orderId === order.id
  )

  const hasReplacement =
    relatedTransactions.some((transaction) => Boolean(transaction.replacementRequestId)) ||
    historyEntries.some((entry) =>
      textHasAny(entry.notes, replacementPatterns) || textHasAny(entry.statusText, replacementPatterns)
    )

  const hasReturn =
    relatedTransactions.some((transaction) => Boolean(transaction.returnRequestId) || transaction.type === 4) ||
    historyEntries.some((entry) =>
      textHasAny(entry.notes, returnPatterns) || textHasAny(entry.statusText, returnPatterns)
    )

  return { hasReplacement, hasReturn }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const router    = useRouter()
  const sp        = useSearchParams()
  const orderId   = sp.get('id') ? Number(sp.get('id')) : null
  const isNew     = sp.get('new') === '1'
  const remainingInCart = (() => {
    const value = sp.get('remaining')
    if (!value) return 0
    const parsed = Number(value)
    return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
  })()
  const { token, isLoading: authLoading } = useAuth()
  const { t, locale } = useLocale()
  const currencyLabel = getCurrencyLabel(locale)

  const [orders,     setOrders]     = useState<Order[]>([])
  const [detail,     setDetail]     = useState<Order | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const [filterTab,  setFilterTab]  = useState(-1)
  const ordersLoadedRef = useRef(false)
  const detailCacheRef = useRef<Map<number, Order>>(new Map())
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (authLoading) return
    if (!token) { router.push('/auth/login'); return }

    const reqId = ++requestIdRef.current

    if (!orderId && ordersLoadedRef.current) {
      setLoading(false)
      setDetail(null)
      return
    }

    if (orderId) {
      const cachedDetail = detailCacheRef.current.get(orderId)
      if (cachedDetail) {
        startTransition(() => setDetail(cachedDetail))
        setLoading(false)
      } else {
        setLoading(true)
      }
    } else {
      setLoading(true)
    }

    const load = async () => {
      try {
        if (orderId) {
          const loadedDetail = await orderApi.getById(token, orderId)
          if (reqId !== requestIdRef.current) return
          detailCacheRef.current.set(orderId, loadedDetail)
          startTransition(() => setDetail(loadedDetail))
        } else {
          const res = await orderApi.myOrders(token, undefined, 1, 20) as any
          if (reqId !== requestIdRef.current) return
          const nextOrders = Array.isArray(res) ? res : (res?.orders ?? [])
          const nextTotal = Array.isArray(res) ? nextOrders.length : Number(res?.total ?? nextOrders.length)
          ordersLoadedRef.current = true
          startTransition(() => {
            setOrders(nextOrders)
            setCurrentPage(1)
            setTotalOrders(nextTotal)
          })
        }
      } catch {
        if (reqId !== requestIdRef.current) return
        if (!orderId) {
          ordersLoadedRef.current = true
          setOrders([])
          setCurrentPage(1)
          setTotalOrders(0)
        }
      } finally {
        if (reqId === requestIdRef.current) setLoading(false)
      }
    }
    void load()
  }, [authLoading, token, orderId, router])

  if (loading || authLoading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  )

  if (orderId && detail) {
    return (
      <OrderDetail
        order={detail} isNew={isNew}
        remainingInCart={remainingInCart}
        onBack={() => router.push('/orders')}
      />
    )
  }

  const filtered = filterTab === -1
    ? orders
    : orders.filter(o => o.status === filterTab)

  const hasMoreOrders = orders.length < totalOrders

  async function handleLoadMore() {
    if (!token || orderId || loadingMore || !hasMoreOrders) return

    setLoadingMore(true)
    try {
      const nextPage = currentPage + 1
      const res = await orderApi.myOrders(token, undefined, nextPage, 20) as any
      const nextOrders = Array.isArray(res) ? res : (res?.orders ?? [])
      const nextTotal = Array.isArray(res) ? nextOrders.length : Number(res?.total ?? totalOrders)

      startTransition(() => {
        setOrders((prev) => {
          const seen = new Set(prev.map((item) => item.id))
          const merged = [...prev]
          for (const order of nextOrders) {
            if (!seen.has(order.id)) {
              seen.add(order.id)
              merged.push(order)
            }
          }
          return merged
        })
        setCurrentPage(nextPage)
        setTotalOrders(nextTotal)
      })
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f6f2] py-6 md:py-8">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <div className="mb-6 flex items-center gap-3 rounded-[32px] border border-stone-200 bg-white/90 p-4 shadow-[0_16px_34px_rgba(15,23,42,0.04)] backdrop-blur md:p-5">
          <Link href="/account"
            className="rounded-xl border border-stone-200 bg-[#faf7f1] p-2 transition-all hover:bg-stone-100 md:hidden">
            <svg className="w-5 h-5 text-slate-600 flip-rtl" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{t('My Orders', 'طلباتي')}</h1>
            {orders.length > 0 && (
              <p className="text-xs text-slate-400 mt-0.5">
                {orders.length} {t('orders', 'طلبات')}
              </p>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        {orders.length > 0 && (
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTER_TABS.map(tab => (
              <button key={tab.key}
                onClick={() => setFilterTab(tab.key)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold
                  transition-all whitespace-nowrap
                  ${filterTab === tab.key
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'border border-stone-200 bg-white text-slate-500 hover:border-stone-300'
                  }`}>
                {locale === 'ar' ? tab.ar : tab.en}
                {tab.key !== -1 && (
                  <span className={`ms-1.5 px-1.5 py-0.5 rounded-full text-[10px]
                    ${filterTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {orders.filter(o => o.status === tab.key).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="rounded-[32px] border border-stone-200 bg-white py-24 text-center shadow-[0_16px_34px_rgba(15,23,42,0.04)]">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-stone-100
              border border-slate-100 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-black text-slate-700 text-lg mb-2">
              {filterTab === -1
                ? t('No orders yet', 'لا توجد طلبات بعد')
                : t('No orders here', 'لا توجد طلبات بهذه الحالة')
              }
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
              {filterTab === -1
                ? t('Your order history will appear here after your first purchase', 'ستظهر سجل طلباتك هنا بعد أول عملية شراء')
                : t('Try selecting a different filter above', 'جرّب اختيار فلتر مختلف')
              }
            </p>
            {filterTab === -1 && (
              <Link href="/shop"
                className="px-7 py-3 bg-slate-900 text-white font-black
                  rounded-2xl hover:bg-amber-600 transition-colors text-sm inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {t('Start Shopping', 'ابدأ التسوق')}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => {
              const st = getStatusMeta(order)
              const fulfillmentType = getFulfillmentKind(order)
              const deliveryStatus = order.deliveryAssignment?.deliveryStatus
              return (
                <Link key={order.id} href={`/orders?id=${order.id}`}
                  className="block rounded-[28px] border border-stone-200 bg-white p-4
                    transition-all hover:border-stone-300 hover:shadow-[0_16px_32px_rgba(15,23,42,0.06)] active:scale-[0.99]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Order number + status */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <p className="font-black text-slate-900 text-sm">{order.orderNumber}</p>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold
                          px-2 py-0.5 rounded-full border ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          <span>{st.icon}</span>
                          {locale === 'ar' ? st.ar : st.en}
                        </span>
                        {fulfillmentType === 'delivery' && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border bg-purple-50 text-purple-700 border-purple-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            {locale === 'ar' ? 'توصيل' : 'Delivery'}
                          </span>
                        )}
                        {fulfillmentType === 'delivery' && deliveryStatus !== undefined && (
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-bold ${DELIVERY_STATUS_UI[deliveryStatus].color}`}>
                            {locale === 'ar' ? DELIVERY_STATUS_UI[deliveryStatus].ar : DELIVERY_STATUS_UI[deliveryStatus].en}
                          </span>
                        )}
                      </div>

                      {/* Date + branch */}
                      <p className="text-xs text-slate-400 mb-1.5">
                        {new Date(order.createdAt).toLocaleDateString(
                          locale === 'ar' ? 'ar-SA' : 'en-SA',
                          { day: 'numeric', month: 'long' }
                        )}
                        {' · '}
                        <span className="text-slate-500 font-medium">{order.branchName}</span>
                      </p>

                      {/* Items preview */}
                      <p className="text-xs text-slate-400">
                        {order.items.length} {t('items', 'منتجات')}
                        {order.items.length > 0 && (
                          <span className="ms-1 text-slate-500">
                            · {locale === 'ar'
                              ? (order.items[0].productNameAr || order.items[0].productNameEn)
                              : (order.items[0].productNameEn || order.items[0].productNameAr)}
                            {order.items.length > 1 && ` +${order.items.length - 1}`}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Total + arrow */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-end">
                    <p className="font-black text-slate-900">{getAmountDue(order).toFixed(2)}</p>
                    <p className="text-xs text-slate-400">
                      {getWalletAppliedAmount(order) > 0
                        ? t('Amount due', 'المبلغ المستحق')
                        : currencyLabel}
                    </p>
                    {getWalletAppliedAmount(order) > 0 && (
                      <p className="text-[11px] text-emerald-600">
                        {t('Wallet used', 'تم استخدام المحفظة')} {getWalletAppliedAmount(order).toFixed(2)} {currencyLabel}
                      </p>
                    )}
                  </div>
                      <svg className="w-4 h-4 text-slate-300 flip-rtl"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Ready banner */}
                  {fulfillmentType === 'pickup' && order.status === 3 && (
                    <div className="mt-3 -mx-4 -mb-4 px-4 py-2.5 bg-teal-50
                      border-t border-teal-100 flex items-center gap-2">
                      <span className="text-teal-500 text-base">📍</span>
                      <p className="text-xs font-bold text-teal-700">
                        {t('Ready for pickup at', 'جاهز للاستلام من')} {order.branchName}
                      </p>
                    </div>
                  )}

                  {fulfillmentType === 'delivery' && deliveryStatus === 1 && (
                    <div className="mt-3 -mx-4 -mb-4 flex items-center gap-2 border-t border-blue-100 bg-blue-50 px-4 py-2.5">
                      <span className="text-base text-blue-500">🚚</span>
                      <p className="text-xs font-bold text-blue-700">
                        {t('Your order is in delivery', 'طلبك قيد التوصيل')}
                      </p>
                    </div>
                  )}
                </Link>
              )
            })}

            {filterTab === -1 && hasMoreOrders && (
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition-colors hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loadingMore
                  ? t('Loading more...', 'جارٍ تحميل المزيد...')
                  : t('Load more orders', 'تحميل المزيد من الطلبات')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Order Detail ─────────────────────────────────────────────────────────────
function OrderDetail({ order, isNew, remainingInCart, onBack }: {
  order: Order; isNew: boolean; remainingInCart: number; onBack: () => void
}) {
  const { token } = useAuth()
  const { t, locale } = useLocale()
  const currencyLabel = getCurrencyLabel(locale)
  const fulfillmentType = getFulfillmentKind(order)
  const deliveryFee = order.deliveryFee
  const deliveryAssignment = order.deliveryAssignment
  const steps = getOrderSteps(order, locale)
  const currentStep = getCurrentStep(order)
  const st = getStatusMeta(order)
  const [walletDetails, setWalletDetails] = useState<CustomerWalletDetails | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)

  useEffect(() => {
    if (!token || !order.customerId) {
      setWalletDetails(null)
      setWalletLoading(false)
      return
    }

    let cancelled = false
    setWalletLoading(true)

    walletApi
      .me(token, 50)
      .then((wallet) => {
        if (!cancelled) setWalletDetails(wallet)
      })
      .catch(() => {
        if (!cancelled) setWalletDetails(null)
      })
      .finally(() => {
        if (!cancelled) setWalletLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, order.id, order.customerId])

  const relatedWalletTransactions = (walletDetails?.transactions ?? []).filter(
    (transaction) => transaction.orderId === order.id
  )
  const financialTimeline = [
    ...relatedWalletTransactions.map((transaction) => {
      const isRefund = transaction.type === 3 || transaction.type === 4
      return {
        key: `wallet-${transaction.id}`,
        at: transaction.createdAt,
        title:
          locale === 'ar'
            ? isRefund
              ? 'استرجاع إلى المحفظة'
              : 'خصم من المحفظة'
            : isRefund
            ? transaction.type === 4
              ? 'Return refund'
              : 'Wallet refund'
            : 'Wallet payment',
        subtitle: transaction.notes || transaction.typeText,
        amountLabel: `${isRefund ? '+' : '−'}${transaction.amount.toFixed(2)} ${currencyLabel}`,
        tone: isRefund ? 'text-emerald-600' : 'text-amber-600',
      }
    }),
  ].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  const activityFlags = getOrderActivityFlags(order, walletDetails)

  return (
    <div className="min-h-screen bg-[#f8f6f2] py-6">
      <div className="max-w-xl mx-auto px-4 pb-10">

        {/* Back */}
        <button onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500
            hover:text-slate-900 mb-5 transition-colors group">
          <svg className="w-4 h-4 flip-rtl group-hover:-translate-x-0.5 transition-transform"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('All orders', 'كل الطلبات')}
        </button>

        {/* ── New order success celebration ── */}
        {isNew && (
          <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50
            border border-green-200 rounded-3xl overflow-hidden shadow-sm">
            {/* Top bar */}
            <div className="bg-green-500 px-5 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-black text-white text-sm">
                {t('Order placed successfully!', 'تم إرسال طلبك بنجاح!')}
              </h3>
            </div>
            {/* Body */}
            <div className="px-5 py-4 space-y-3">
              {remainingInCart > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                  <p className="text-xs font-black text-amber-900">
                    {t(
                      `${remainingInCart} items are still in your cart and were not included in this order.`,
                      `تبقّى ${remainingInCart} منتج في السلة ولم يتم تضمينه في هذا الطلب.`
                    )}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">📍</span>
                </div>
                <div>
                    <p className="text-xs text-green-700 font-bold">
                      {fulfillmentType === 'delivery'
                        ? t('Delivery branch', 'الفرع المسؤول عن التوصيل')
                        : t('Pickup location', 'مكان الاستلام')}
                    </p>
                    <p className="text-sm font-black text-green-900">{order.branchName}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-base">📱</span>
                </div>
                  <p className="text-sm text-green-800 font-medium">
                    {fulfillmentType === 'delivery'
                      ? t(
                          'You can track each delivery step here after a vehicle is assigned.',
                          'يمكنك متابعة خطوات التوصيل هنا بعد إسناد المركبة.'
                        )
                      : t(
                          'You will receive a notification when your order is ready',
                          'ستصلك إشعار عندما يصبح طلبك جاهزاً'
                        )}
                  </p>
              </div>
              <div className="pt-1 border-t border-green-200 flex items-center justify-between">
                <p className="text-xs text-green-600 font-bold">
                  {t('Order number', 'رقم الطلب')}: {order.orderNumber}
                </p>
                <div className="text-end">
                  <p className="text-sm font-black text-green-800">
                    {getAmountDue(order).toFixed(2)} {currencyLabel}
                  </p>
                  {getWalletAppliedAmount(order) > 0 && (
                    <p className="text-[11px] font-semibold text-emerald-700">
                      {t('After wallet deduction', 'بعد خصم المحفظة')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header card */}
        <div className="mb-4 rounded-[32px] border border-stone-200 bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.04)]">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h1 className="text-lg font-black text-slate-900">{order.orderNumber}</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(order.createdAt).toLocaleDateString(
                  locale === 'ar' ? 'ar-SA' : 'en-SA',
                  { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
                )}
              </p>
              {(activityFlags.hasReplacement || activityFlags.hasReturn) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {activityFlags.hasReplacement && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-black text-blue-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      {t('Replacement recorded', 'تم عليه استبدال')}
                    </span>
                  )}
                  {activityFlags.hasReturn && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {t('Return recorded', 'تم عليه استرجاع')}
                    </span>
                  )}
                </div>
              )}
            </div>
            <span className={`inline-flex items-center gap-1.5 text-sm font-bold
              px-3 py-1.5 rounded-full border flex-shrink-0 ${st.color}`}>
              <span className={`w-2 h-2 rounded-full ${st.dot}`} />
              <span>{st.icon}</span>
              {locale === 'ar' ? st.ar : st.en}
            </span>
          </div>

          {/* Progress tracker */}
          {order.status !== 5 && (
            <div className="mt-2 mb-2">
              <div className="flex items-start justify-between relative">
                {/* Track bg */}
                <div className="absolute start-[7%] end-[7%] top-3.5 h-0.5 bg-slate-200" />
                {/* Track fill */}
                <div className="absolute start-[7%] top-3.5 h-0.5 bg-slate-900 transition-all duration-500"
                  style={{ width: `${(currentStep / 4) * 86}%` }} />
                {steps.map((label, idx) => {
                  const done    = idx <= currentStep
                  const current = idx === currentStep
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1.5 z-10 flex-1">
                      <div className={`w-7 h-7 rounded-full border-2 flex items-center
                        justify-center transition-all
                        ${done
                          ? 'border-slate-900 bg-slate-900'
                          : 'border-slate-200 bg-white'
                        }
                        ${current ? 'ring-4 ring-slate-200' : ''}`}>
                        {done ? (
                          <svg className="w-3.5 h-3.5 text-white" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                              strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-200" />
                        )}
                      </div>
                      <span className={`text-[10px] font-semibold text-center leading-tight
                        ${done ? 'text-slate-900' : 'text-slate-400'}`}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cancelled notice */}
          {order.status === 5 && (
            <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
              <p className="text-sm font-bold text-red-600 text-center">
                {t('This order was cancelled', 'تم إلغاء هذا الطلب')}
              </p>
            </div>
          )}

          {/* Branch + Payment */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center
                justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">
                  {t('Branch', 'الفرع')}
                </p>
                <p className="font-bold text-slate-800 text-xs">{order.branchName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center
                justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wide font-bold">
                  {t('Payment', 'الدفع')}
                </p>
                <p className="font-bold text-slate-800 text-xs">{order.paymentMethodText}</p>
              </div>
            </div>
          </div>

          {/* ✅ FIX: fulfillmentType و deliveryFee بأمان */}
          {fulfillmentType && (
            <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">{t('Fulfillment', 'طريقة الاستلام')}</p>
              <p className="text-xs font-black text-slate-900">
                {fulfillmentType === 'delivery' ? t('Delivery', 'توصيل') : t('Pickup', 'استلام')}
                {fulfillmentType === 'delivery' && deliveryFee !== undefined && (
                  <span className="text-slate-500 font-bold"> · {deliveryFee.toFixed(2)} {currencyLabel} </span>
                )}
              </p>
            </div>
          )}

          {fulfillmentType === 'pickup' && order.pickupAddress && (
            <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-500">{t('Pickup Address', 'عنوان الاستلام')}</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{order.pickupAddress.label}</p>
              <p className="mt-1 text-xs text-slate-500">{order.pickupAddress.fullAddress}</p>
            </div>
          )}

          {fulfillmentType === 'delivery' && order.deliveryAddress && (
            <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-bold text-slate-500">{t('Delivery Address', 'عنوان التوصيل')}</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{order.deliveryAddress.label}</p>
              <p className="mt-1 text-xs text-slate-500">{order.deliveryAddress.fullAddress}</p>
            </div>
          )}
        </div>

        {fulfillmentType === 'delivery' && (
          <div className="mb-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">{t('Delivery Tracking', 'تتبع التوصيل')}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {deliveryAssignment
                    ? t('Delivery progress is updated as the order moves to the customer.', 'يتم تحديث حالة التوصيل مع انتقال الطلب إلى العميل.')
                    : t('Your order is being prepared and will appear here once a vehicle is assigned.', 'طلبك قيد التجهيز وسيظهر هنا بمجرد إسناد مركبة للتوصيل.')}
                </p>
              </div>
              {deliveryAssignment && (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${DELIVERY_STATUS_UI[deliveryAssignment.deliveryStatus].color}`}>
                  {locale === 'ar'
                    ? DELIVERY_STATUS_UI[deliveryAssignment.deliveryStatus].ar
                    : DELIVERY_STATUS_UI[deliveryAssignment.deliveryStatus].en}
                </span>
              )}
            </div>

            {deliveryAssignment ? (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      key: 0,
                      icon: '🚚',
                      en: 'Assigned',
                      ar: 'تم الإسناد',
                      done: true,
                      time: deliveryAssignment.assignedAt,
                    },
                    {
                      key: 1,
                      icon: '🛣️',
                      en: 'In Delivery',
                      ar: 'قيد التوصيل',
                      done: deliveryAssignment.deliveryStatus >= 1,
                      time: deliveryAssignment.startedAt,
                    },
                    {
                      key: 2,
                      icon: '📬',
                      en: 'Delivered',
                      ar: 'تم التسليم',
                      done: deliveryAssignment.deliveryStatus === 2,
                      time: deliveryAssignment.deliveredAt,
                    },
                  ].map((step) => (
                    <div
                      key={step.key}
                      className={`rounded-2xl border p-3 ${
                        step.done ? 'border-slate-200 bg-slate-50' : 'border-slate-100 bg-white'
                      }`}
                    >
                      <p className={`text-xs font-black ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.icon} {locale === 'ar' ? step.ar : step.en}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {step.time
                          ? new Date(step.time).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-SA', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : t('Awaiting update', 'بانتظار التحديث')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-slate-500">{t('Assigned vehicle', 'المركبة المسندة')}</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{deliveryAssignment.plateNumber}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {deliveryAssignment.owner.fullName} · {deliveryAssignment.owner.phone}
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                {t('No vehicle has been assigned yet.', 'لم يتم إسناد مركبة للتوصيل بعد.')}
              </div>
            )}
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm mb-4">
          <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
            {t('Items', 'المنتجات')}
            <span className="text-xs font-bold text-slate-400 bg-slate-100
              px-2 py-0.5 rounded-full">
              {order.items.length}
            </span>
          </h3>
          <div className="divide-y divide-slate-100">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                {/* Qty badge */}
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center
                  justify-center flex-shrink-0">
                  <span className="text-xs font-black text-slate-600">×{item.quantity}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {locale === 'ar'
                      ? (item.productNameAr || item.productNameEn)
                      : (item.productNameEn || item.productNameAr)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {locale === 'ar'
                      ? (item.variantNameAr || item.variantNameEn)
                      : (item.variantNameEn || item.variantNameAr)}
                  </p>
                  {item.hadOffer && (
                    <p className="text-xs mt-0.5">
                      <span className="line-through text-slate-400">
                        {item.baseUnitPrice.toFixed(2)}
                      </span>
                      <span className="text-green-600 font-semibold ms-1">
                        {item.unitPrice.toFixed(2)} {currencyLabel}
                      </span>
                    </p>
                  )}
                </div>
                <p className="font-black text-slate-900 text-sm flex-shrink-0">
                  {item.totalPrice.toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ms-0.5">{currencyLabel}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
          <h3 className="font-black text-slate-900 mb-4">{t('Payment Summary', 'ملخص الدفع')}</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{t('Subtotal', 'المجموع الفرعي')}</span>
              <span className="font-semibold">{order.subtotal.toFixed(2)} {currencyLabel}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>
                  {t('Discount', 'خصم')}
                  {order.promoCodeUsed && (
                    <code className="ms-1.5 text-xs bg-green-50 border border-green-200
                      px-1.5 py-0.5 rounded-lg font-mono">
                      {order.promoCodeUsed}
                    </code>
                  )}
                </span>
                <span>−{order.discountAmount.toFixed(2)} {currencyLabel}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-500">
              <span>{t('VAT 15%', 'ضريبة القيمة المضافة 15%')}</span>
              <span>{order.tax.toFixed(2)} {currencyLabel}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-900
              pt-3 border-t border-slate-200">
              <span>{t('Gross total', 'الإجمالي قبل المحفظة')}</span>
              <span className="text-amber-600">{order.total.toFixed(2)} {currencyLabel}</span>
            </div>
            {getWalletAppliedAmount(order) > 0 && (
              <div className="flex justify-between font-semibold text-emerald-600">
                <span>{t('Wallet deduction', 'خصم المحفظة')}</span>
                <span>−{getWalletAppliedAmount(order).toFixed(2)} {currencyLabel}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
              <span>{t('Amount due', 'المبلغ المستحق')}</span>
              <span className="text-slate-900">{getAmountDue(order).toFixed(2)} {currencyLabel}</span>
            </div>
            {order.status === 5 && getWalletAppliedAmount(order) > 0 && (
              <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                {t(
                  'Wallet amount was returned after the order was cancelled.',
                  'تمت إعادة مبلغ المحفظة بعد إلغاء الطلب.'
                )}
              </p>
            )}
          </div>
        </div>

        {false && (walletLoading || relatedWalletTransactions.length > 0 || getWalletAppliedAmount(order) > 0) && (
          <div className="mt-4 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-900">{t('Wallet Activity', 'حركة المحفظة')}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  {t(
                    'Wallet transactions linked to this order appear here.',
                    'تظهر هنا حركات المحفظة المرتبطة بهذا الطلب.'
                  )}
                </p>
              </div>
              {walletDetails && (
                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {t('Balance', 'الرصيد')}: {walletDetails?.balance?.toFixed(2) ?? '0.00'} {currencyLabel}
                </span>
              )}
            </div>

            {walletLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                {t('Loading wallet activity...', 'جارٍ تحميل حركة المحفظة...')}
              </div>
            ) : relatedWalletTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                {t('No wallet transactions are linked to this order yet.', 'لا توجد حركات محفظة مرتبطة بهذا الطلب حتى الآن.')}
              </div>
            ) : (
              <div className="space-y-3">
                {relatedWalletTransactions.map((transaction) => {
                  const isRefund = transaction.type === 3 || transaction.type === 4
                  const amountPrefix = isRefund ? '+' : '−'
                  return (
                    <div key={transaction.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900">{transaction.typeText}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(transaction.createdAt).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-SA', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                          {transaction.notes && (
                            <p className="mt-2 text-xs text-slate-600">{transaction.notes}</p>
                          )}
                        </div>
                        <div className="text-end">
                          <p className={`text-sm font-black ${isRefund ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {amountPrefix}{transaction.amount.toFixed(2)} {currencyLabel}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {t('Balance', 'الرصيد')}: {transaction.balanceBefore.toFixed(2)} → {transaction.balanceAfter.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {false && (walletLoading || financialTimeline.length > 0) && (
          <div className="mt-4 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="font-black text-slate-900">{t('Financial Timeline', 'التسلسل المالي')}</h3>
              <p className="mt-1 text-xs text-slate-400">
                {t(
                  'A simple timeline of wallet-related financial events for this order.',
                  'تسلسل مبسط للأحداث المالية المرتبطة بالمحفظة لهذا الطلب.'
                )}
              </p>
            </div>

            {walletLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                {t('Loading financial activity...', 'جارٍ تحميل النشاط المالي...')}
              </div>
            ) : financialTimeline.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                {t('No financial activity is linked to this order yet.', 'لا توجد حركة مالية مرتبطة بهذا الطلب حتى الآن.')}
              </div>
            ) : (
              <div className="space-y-3">
                {financialTimeline.map((entry, index) => (
                  <div key={entry.key} className="flex gap-3">
                    <div className="flex w-5 flex-shrink-0 flex-col items-center">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-slate-900" />
                      {index !== financialTimeline.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900">{entry.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {new Date(entry.at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-SA', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </p>
                          <p className="mt-2 text-xs text-slate-600">{entry.subtitle}</p>
                        </div>
                        <span className={`text-sm font-black ${entry.tone}`}>{entry.amountLabel}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
