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
  const normalizedLower = normalized.toLowerCase()
  const hasAny = (needles: string[]) => needles.some((needle) => normalizedLower.includes(needle))

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
    'Phone number already exists': {
      en: 'This phone number is already registered. Please sign in or use a different number.',
      ar: 'رقم الهاتف هذا مسجل مسبقًا. يرجى تسجيل الدخول أو استخدام رقم آخر.',
    },
    'Phone number is already registered': {
      en: 'This phone number is already registered. Please sign in or use a different number.',
      ar: 'رقم الهاتف هذا مسجل مسبقًا. يرجى تسجيل الدخول أو استخدام رقم آخر.',
    },
    'Email already exists': {
      en: 'This email is already registered. Please sign in or use a different email.',
      ar: 'هذا البريد الإلكتروني مسجل مسبقًا. يرجى تسجيل الدخول أو استخدام بريد آخر.',
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

  if (
    (normalizedLower.includes('newpassword') || normalizedLower.includes('password')) &&
    (normalizedLower.includes('minimum length') || normalizedLower.includes('at least'))
  ) {
    return t(
      'Password must be at least 8 characters long.',
      'كلمة المرور يجب أن تكون 8 أحرف على الأقل.'
    )
  }

  if (normalizedLower.includes('phone') && normalizedLower.includes('password')) {
    return t('Invalid phone number or password.', 'رقم الهاتف أو كلمة المرور غير صحيحين.')
  }

  if (normalizedLower.includes('password') && normalizedLower.includes('current')) {
    return t('Current password is incorrect.', 'كلمة المرور الحالية غير صحيحة.')
  }

  if (
    hasAny(['phone', 'phonenumber', 'mobile']) &&
    hasAny(['already exists', 'already registered', 'already in use', 'duplicate', 'taken', 'exists', 'used'])
  ) {
    return t(
      'This phone number is already registered. Please sign in or use a different number.',
      'رقم الهاتف هذا مسجل مسبقًا. يرجى تسجيل الدخول أو استخدام رقم آخر.'
    )
  }

  if (
    normalizedLower.includes('email') &&
    hasAny(['already exists', 'already registered', 'already in use', 'duplicate', 'taken', 'exists', 'used'])
  ) {
    return t(
      'This email is already registered. Please sign in or use a different email.',
      'هذا البريد الإلكتروني مسجل مسبقًا. يرجى تسجيل الدخول أو استخدام بريد آخر.'
    )
  }

  if (normalizedLower.includes('confirm') && normalizedLower.includes('password')) {
    return t('Passwords do not match.', 'كلمتا المرور غير متطابقتين.')
  }

  if (normalizedLower.includes('phone') && normalizedLower.includes('invalid')) {
    return t('Phone number format is invalid.', 'تنسيق رقم الهاتف غير صحيح.')
  }

  if (normalizedLower.includes('email') && normalizedLower.includes('invalid')) {
    return t('Email format is invalid.', 'تنسيق البريد الإلكتروني غير صحيح.')
  }

  if (normalizedLower.includes('required')) {
    return t(
      normalized,
      'بعض البيانات المطلوبة غير مكتملة. يرجى التحقق والمحاولة مجددًا.'
    )
  }

  return t(normalized, 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.')
}
