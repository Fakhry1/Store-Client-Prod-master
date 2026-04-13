type TranslateFn = (en: string, ar: string) => string

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replaceCountMessage(
  message: string,
  englishPrefix: string,
  arabicPrefix: string,
  arabicSuffix: string
) {
  const pattern = new RegExp(`^${escapeRegExp(englishPrefix)}\\s+(\\d+)`)
  const match = message.match(pattern)
  if (!match) return null
  return `${arabicPrefix} ${match[1]} ${arabicSuffix}`.trim()
}

export function translateApiError(message: string, t: TranslateFn) {
  const normalized = message.trim()

  if (!normalized) {
    return t(
      'Something went wrong. Please try again.',
      'حدث خطأ ما. يرجى المحاولة مرة أخرى.'
    )
  }

  const exactMap: Record<string, { en: string; ar: string }> = {
    'Product variant not available in this branch': {
      en: 'This product option is not available in the selected branch.',
      ar: 'هذا الخيار غير متوفر في الفرع المحدد.',
    },
    'Maximum quantity per item is 10': {
      en: 'Maximum quantity per item is 10.',
      ar: 'الحد الأقصى لكل منتج هو 10 قطع.',
    },
    'Cart item not found': {
      en: 'Cart item not found.',
      ar: 'تعذر العثور على العنصر داخل السلة.',
    },
    'Item no longer available': {
      en: 'This item is no longer available.',
      ar: 'هذا العنصر لم يعد متوفرًا.',
    },
    'Product no longer available': {
      en: 'This product is no longer available.',
      ar: 'هذا المنتج لم يعد متوفرًا.',
    },
    'Item removed from cart': {
      en: 'Item removed from cart.',
      ar: 'تم حذف العنصر من السلة.',
    },
    'Cart cleared successfully': {
      en: 'Cart cleared successfully.',
      ar: 'تم تفريغ السلة بنجاح.',
    },
    'Cart not found': {
      en: 'Cart not found.',
      ar: 'تعذر العثور على السلة.',
    },
    'Guest cart not found or empty': {
      en: 'Guest cart was not found or is already empty.',
      ar: 'سلة الزائر غير موجودة أو فارغة بالفعل.',
    },
    'All items are available': {
      en: 'All items are available.',
      ar: 'جميع العناصر متوفرة.',
    },
    'Some items in your cart are no longer available or quantities have changed': {
      en: 'Some items in your cart are no longer available or their quantities changed.',
      ar: 'بعض العناصر في سلتك لم تعد متوفرة أو تغيرت كمياتها.',
    },
    'Invalid credentials': {
      en: 'Invalid phone number or password.',
      ar: 'رقم الهاتف أو كلمة المرور غير صحيحين.',
    },
    'Invalid phone number or password': {
      en: 'Invalid phone number or password.',
      ar: 'رقم الهاتف أو كلمة المرور غير صحيحين.',
    },
    Unauthenticated: {
      en: 'Your session has expired. Please sign in again.',
      ar: 'انتهت جلستك. يرجى تسجيل الدخول مرة أخرى.',
    },
    'Unable to start your session. Please try again.': {
      en: 'Unable to start your session. Please try again.',
      ar: 'تعذر بدء الجلسة. يرجى المحاولة مرة أخرى.',
    },
    'Request failed': {
      en: 'Request failed. Please try again.',
      ar: 'فشل تنفيذ الطلب. يرجى المحاولة مرة أخرى.',
    },
    'Product not found': {
      en: 'Product not found.',
      ar: 'المنتج غير موجود.',
    },
    'No active offers right now': {
      en: 'There are no active offers right now.',
      ar: 'لا توجد عروض فعالة حاليًا.',
    },
  }

  const mapped = exactMap[normalized]
  if (mapped) {
    return t(mapped.en, mapped.ar)
  }

  const stockMessage =
    replaceCountMessage(normalized, 'Only', 'المتوفر فقط', 'قطعة في المخزون') ??
    replaceCountMessage(normalized, 'Only', 'المتوفر فقط', 'قطعة')

  if (stockMessage && (normalized.includes('items available') || normalized.includes('items available in stock'))) {
    return t(normalized, stockMessage)
  }

  if (normalized.includes('phone') && normalized.includes('password')) {
    return t('Invalid phone number or password.', 'رقم الهاتف أو كلمة المرور غير صحيحين.')
  }

  if (normalized.includes('password') && normalized.includes('current')) {
    return t('Current password is incorrect.', 'كلمة المرور الحالية غير صحيحة.')
  }

  if (normalized.includes('already exists') && normalized.includes('phone')) {
    return t(
      'An account with this phone number already exists.',
      'يوجد حساب مسجل بهذا الرقم بالفعل.'
    )
  }

  if (normalized.includes('already exists') && normalized.includes('email')) {
    return t(
      'An account with this email already exists.',
      'يوجد حساب مسجل بهذا البريد بالفعل.'
    )
  }

  if (normalized.includes('required')) {
    return t(
      normalized,
      'بعض البيانات المطلوبة غير مكتملة. يرجى التحقق والمحاولة مجددًا.'
    )
  }

  return t(normalized, 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.')
}
