'use client'

import Link from 'next/link'
import { useLocale } from '@/context/locale'

type TermsSection = {
  id: string
  titleEn: string
  titleAr: string
  pointsEn: string[]
  pointsAr: string[]
}

const sections: TermsSection[] = [
  {
    id: 'service',
    titleEn: 'Use of the Store',
    titleAr: 'استخدام المتجر',
    pointsEn: [
      'Using the store means accepting these Terms & Conditions and any policies referenced within them.',
      'Product availability, pricing, promotions, and branch-specific catalog visibility may change before an order is confirmed.',
      'The store may limit or refuse suspicious, abusive, or clearly invalid orders.',
    ],
    pointsAr: [
      'استخدام المتجر يعني الموافقة على هذه الشروط والأحكام وأي سياسات مرتبطة بها.',
      'توفر المنتجات والأسعار والعروض وظهور المنتجات حسب الفرع قد يتغير قبل تأكيد الطلب.',
      'يحق للمتجر تقييد أو رفض الطلبات المشبوهة أو المسيئة أو غير الصحيحة بوضوح.',
    ],
  },
  {
    id: 'orders',
    titleEn: 'Orders and Payment',
    titleAr: 'الطلبات والدفع',
    pointsEn: [
      'An order is considered submitted only after the checkout flow is completed successfully.',
      'Orders may be paid partially or fully using the customer wallet when that option is available.',
      'Any remaining amount due must be settled using the selected payment method accepted by the store.',
    ],
    pointsAr: [
      'لا يعتبر الطلب مُرسلاً إلا بعد إتمام خطوات الشراء بنجاح.',
      'يمكن سداد الطلب كليًا أو جزئيًا عبر محفظة العميل عندما تكون هذه الميزة متاحة.',
      'أي مبلغ متبقٍ يجب سداده عبر وسيلة الدفع المختارة والمعتمدة من المتجر.',
    ],
  },
  {
    id: 'cancellation',
    titleEn: 'Cancellation Policy',
    titleAr: 'سياسة الإلغاء',
    pointsEn: [
      'Cancellation is subject to the order status shown in the system and may not be available after preparation begins.',
      'When an eligible order is cancelled, reserved stock may be restored and eligible wallet amounts may be returned to the customer wallet.',
      'Promo usage and promotional benefits tied to the cancelled order may be reversed according to store rules.',
    ],
    pointsAr: [
      'الإلغاء يخضع لحالة الطلب الظاهرة في النظام، وقد لا يكون متاحًا بعد بدء تجهيز الطلب.',
      'عند إلغاء الطلب المؤهل، قد تتم إعادة الكمية المحجوزة للمخزون وإرجاع المبالغ المؤهلة إلى محفظة العميل.',
      'قد يتم عكس استخدام الكوبونات أو المزايا الترويجية المرتبطة بالطلب الملغى وفق قواعد المتجر.',
    ],
  },
  {
    id: 'replacement',
    titleEn: 'Replacement Policy',
    titleAr: 'سياسة الاستبدال',
    pointsEn: [
      'Replacement requests are reviewed according to store policy, product availability, branch stock, and order eligibility.',
      'A replacement may require paying the difference if the new item costs more than the original item.',
      'If the replacement item costs less, the difference may be recorded to the customer wallet according to the active store policy.',
    ],
    pointsAr: [
      'طلبات الاستبدال تخضع للمراجعة حسب سياسة المتجر وتوفر المنتج ومخزون الفرع وأهلية الطلب.',
      'قد يتطلب الاستبدال دفع فرق السعر إذا كان المنتج البديل أعلى قيمة من المنتج الأصلي.',
      'إذا كان المنتج البديل أقل سعرًا فقد يُسجل الفرق في محفظة العميل وفق السياسة المعتمدة.',
    ],
  },
  {
    id: 'returns',
    titleEn: 'Return Policy',
    titleAr: 'سياسة الاسترجاع',
    pointsEn: [
      'Return requests are accepted only for eligible orders and eligible quantities within the approved return window.',
      'Returned products must meet the store acceptance conditions and may be refused if they are damaged, incomplete, or misused.',
      'Approved refunds are currently issued to the customer wallet unless another policy is explicitly stated by the store.',
    ],
    pointsAr: [
      'يتم قبول طلبات الاسترجاع فقط للطلبات والكميات المؤهلة خلال المدة المحددة للاسترجاع.',
      'يجب أن تكون المنتجات المسترجعة مطابقة لشروط القبول، ويحق للمتجر رفضها إذا كانت تالفة أو ناقصة أو أسيء استخدامها.',
      'المبالغ المستردة المعتمدة تُضاف حاليًا إلى محفظة العميل ما لم تنص سياسة أخرى من المتجر على غير ذلك.',
    ],
  },
  {
    id: 'wallet',
    titleEn: 'Customer Wallet',
    titleAr: 'محفظة العميل',
    pointsEn: [
      'Wallet balance may be created from eligible refunds, replacement differences, or store credits.',
      'Wallet balance can be used in supported orders and only up to the order total allowed by the system.',
      'Wallet balances are non-transferable and not redeemable for cash unless the store explicitly announces otherwise.',
    ],
    pointsAr: [
      'قد ينشأ رصيد المحفظة من الاسترجاعات المؤهلة أو فروقات الاستبدال أو أرصدة المتجر.',
      'يمكن استخدام رصيد المحفظة في الطلبات المدعومة وبحد أقصى يسمح به النظام لكل طلب.',
      'رصيد المحفظة غير قابل للتحويل أو الاستبدال نقدًا ما لم يعلن المتجر خلاف ذلك صراحة.',
    ],
  },
  {
    id: 'delivery',
    titleEn: 'Delivery, Pickup, and Addresses',
    titleAr: 'التوصيل والاستلام والعناوين',
    pointsEn: [
      'Customers are responsible for providing correct contact details, branch selection, and delivery address information.',
      'Delivery timing may vary according to branch workload, service coverage, and operational conditions.',
      'The store may contact the customer to confirm, clarify, or reschedule delivery or pickup details when needed.',
    ],
    pointsAr: [
      'العميل مسؤول عن صحة بيانات التواصل واختيار الفرع وبيانات عنوان التوصيل.',
      'قد تختلف مدة التوصيل بحسب ضغط الفرع ونطاق الخدمة والظروف التشغيلية.',
      'يحق للمتجر التواصل مع العميل لتأكيد أو توضيح أو إعادة جدولة تفاصيل التوصيل أو الاستلام عند الحاجة.',
    ],
  },
  {
    id: 'promotions',
    titleEn: 'Promotions and Coupons',
    titleAr: 'العروض والكوبونات',
    pointsEn: [
      'Promotions, discounts, and coupon codes are subject to their own validity rules and may expire or be changed without prior notice.',
      'The store may prevent repeated abuse, duplicate use, or misuse of promotional benefits.',
      'If an order is cancelled or changed, the original promotional benefit may be adjusted according to the final transaction outcome.',
    ],
    pointsAr: [
      'العروض والخصومات وأكواد الكوبونات تخضع لشروط صلاحيتها الخاصة وقد تنتهي أو تتغير دون إشعار مسبق.',
      'يحق للمتجر منع إساءة الاستخدام أو التكرار غير المسموح أو الاستفادة غير الصحيحة من المزايا الترويجية.',
      'عند إلغاء الطلب أو تعديله قد يتم تعديل الأثر الترويجي الأصلي بحسب النتيجة النهائية للمعاملة.',
    ],
  },
  {
    id: 'privacy',
    titleEn: 'Privacy and Updates',
    titleAr: 'الخصوصية والتحديثات',
    pointsEn: [
      'The store processes customer information only as needed to operate the service, fulfill orders, and provide support.',
      'These Terms & Conditions may be updated from time to time, and the version published at the time of checkout will govern the order.',
      'For questions or disputes, the customer should contact the store support channels listed in the storefront.',
    ],
    pointsAr: [
      'يقوم المتجر بمعالجة بيانات العميل بالقدر اللازم لتشغيل الخدمة وتنفيذ الطلبات وتقديم الدعم.',
      'قد يتم تحديث هذه الشروط والأحكام من وقت لآخر، وتُطبق النسخة المنشورة وقت إتمام الطلب على ذلك الطلب.',
      'عند وجود استفسار أو نزاع يجب على العميل التواصل عبر قنوات الدعم المعروضة في المتجر.',
    ],
  },
]

export default function TermsPage() {
  const { locale, t } = useLocale()
  const isArabic = locale === 'ar'

  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)' }}>
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-6 md:py-10">
        <div className="rounded-[32px] border bg-white p-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)] md:p-8" style={{ borderColor: 'var(--line)' }}>
          <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-end md:justify-between" style={{ borderColor: 'var(--line)' }}>
            <div className="space-y-2">
              <span className="inline-flex w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-amber-700">
                {t('Terms & Conditions', 'الشروط والأحكام')}
              </span>
              <h1 className="text-2xl font-black leading-tight md:text-4xl" style={{ color: 'var(--ink)' }}>
                {t('Please review these terms before placing your order.', 'يرجى مراجعة هذه الشروط قبل إتمام طلبك.')}
              </h1>
              <p className="max-w-3xl text-sm leading-7 md:text-[15px]" style={{ color: 'var(--mute)' }}>
                {t(
                  'These terms explain how orders, cancellations, replacements, returns, wallet balance, delivery, and promotions are handled in the store.',
                  'توضح هذه الشروط كيفية التعامل مع الطلبات والإلغاء والاستبدال والاسترجاع ورصيد المحفظة والتوصيل والعروض داخل المتجر.'
                )}
              </p>
            </div>

            <Link
              href="/cart?step=review"
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-black text-white transition-colors"
              style={{ background: 'var(--ink)' }}
            >
              {t('Back to Checkout', 'العودة لإتمام الطلب')}
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[240px_minmax(0,1fr)] md:gap-6">
            <aside className="rounded-[28px] border p-4 md:sticky md:top-24 md:h-fit" style={{ borderColor: 'var(--line)', background: 'var(--paper)' }}>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.24em]" style={{ color: 'var(--mute)' }}>
                {t('Quick Navigation', 'تنقل سريع')}
              </p>
              <div className="flex flex-wrap gap-2 md:flex-col">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="rounded-full border bg-white px-3 py-2 text-xs font-bold transition-colors hover:border-[var(--orange)] hover:text-[var(--orange)] md:rounded-2xl md:px-4 md:py-3 md:text-sm"
                    style={{ borderColor: 'var(--line)', color: 'var(--mute)' }}
                  >
                    {isArabic ? section.titleAr : section.titleEn}
                  </a>
                ))}
              </div>
            </aside>

            <div className="space-y-4">
              {sections.map((section) => {
                const title = isArabic ? section.titleAr : section.titleEn
                const points = isArabic ? section.pointsAr : section.pointsEn

                return (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24 rounded-[28px] border bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.04)] md:p-6"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <h2 className="text-lg font-black md:text-xl" style={{ color: 'var(--ink)' }}>{title}</h2>
                    <div className="mt-4 space-y-3">
                      {points.map((point, index) => (
                        <div key={`${section.id}-${index}`} className="flex items-start gap-3">
                          <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white"
                            style={{ background: 'var(--ink)' }}>
                            {index + 1}
                          </span>
                          <p className="text-sm leading-7 md:text-[15px]" style={{ color: 'var(--mute)' }}>{point}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

