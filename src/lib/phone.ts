export type PhoneCountry = {
  iso: string
  dialCode: string
  flag: string
  nameEn: string
  nameAr: string
  placeholder: string
}

type Translator = (en: string, ar: string) => string

type LocalPhoneValidationOptions = {
  required?: boolean
  exactDigits?: number
  disallowLeadingZero?: boolean
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: 'SD', dialCode: '+249', flag: 'SD', nameEn: 'Sudan', nameAr: 'السودان', placeholder: '912 345 678' },
  { iso: 'SA', dialCode: '+966', flag: 'SA', nameEn: 'Saudi Arabia', nameAr: 'السعودية', placeholder: '5X XXX XXXX' },
  { iso: 'AE', dialCode: '+971', flag: 'AE', nameEn: 'UAE', nameAr: 'الإمارات', placeholder: '5X XXX XXXX' },
  { iso: 'EG', dialCode: '+20', flag: 'EG', nameEn: 'Egypt', nameAr: 'مصر', placeholder: '10 XXX XXXX' },
  { iso: 'QA', dialCode: '+974', flag: 'QA', nameEn: 'Qatar', nameAr: 'قطر', placeholder: '3XXX XXXX' },
  { iso: 'KW', dialCode: '+965', flag: 'KW', nameEn: 'Kuwait', nameAr: 'الكويت', placeholder: '5XXX XXXX' },
  { iso: 'BH', dialCode: '+973', flag: 'BH', nameEn: 'Bahrain', nameAr: 'البحرين', placeholder: '3XXX XXXX' },
  { iso: 'OM', dialCode: '+968', flag: 'OM', nameEn: 'Oman', nameAr: 'عُمان', placeholder: '9XXX XXXX' },
]

export const DEFAULT_PHONE_COUNTRY = 'SD'

export function getPhoneCountry(iso?: string): PhoneCountry {
  return PHONE_COUNTRIES.find((country) => country.iso === iso) ?? PHONE_COUNTRIES[0]
}

export function sanitizePhoneDigits(value: string): string {
  return value.replace(/\D/g, '')
}

export function buildInternationalPhone(countryIso: string, localNumber: string): string {
  const country = getPhoneCountry(countryIso)
  const digits = sanitizePhoneDigits(localNumber).replace(/^0+/, '')

  if (!digits) {
    return ''
  }

  return `${country.dialCode}${digits}`
}

export function isValidInternationalPhone(phoneNumber: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(phoneNumber)
}

export function splitInternationalPhone(phoneNumber?: string | null): { countryIso: string; localNumber: string } {
  if (!phoneNumber) {
    return { countryIso: DEFAULT_PHONE_COUNTRY, localNumber: '' }
  }

  const normalized = phoneNumber.trim()
  const matchedCountry = [...PHONE_COUNTRIES]
    .sort((a, b) => b.dialCode.length - a.dialCode.length)
    .find((country) => normalized.startsWith(country.dialCode))

  if (!matchedCountry) {
    return {
      countryIso: DEFAULT_PHONE_COUNTRY,
      localNumber: sanitizePhoneDigits(normalized),
    }
  }

  return {
    countryIso: matchedCountry.iso,
    localNumber: sanitizePhoneDigits(normalized.slice(matchedCountry.dialCode.length)),
  }
}

export function getPhoneValidationMessage(
  phoneNumber: string,
  t: Translator
): string {
  if (!phoneNumber) {
    return t('Phone number is required', 'رقم الهاتف مطلوب')
  }

  if (!isValidInternationalPhone(phoneNumber)) {
    return t('Enter a valid international phone number', 'أدخل رقم هاتف دولي صحيح')
  }

  return ''
}

export function validateLocalPhoneInput(
  countryIso: string,
  localNumber: string,
  t: Translator,
  options: LocalPhoneValidationOptions = {}
): string {
  const digits = sanitizePhoneDigits(localNumber)
  const { required = true, exactDigits, disallowLeadingZero = false } = options

  if (required && !digits) {
    return t('Phone number is required', 'رقم الهاتف مطلوب')
  }

  if (!digits) {
    return ''
  }

  if (disallowLeadingZero && digits.startsWith('0')) {
    return t('Phone number must not start with 0', 'يجب ألا يبدأ رقم الهاتف بالرقم 0')
  }

  if (exactDigits && digits.length !== exactDigits) {
    return t(
      `Phone number must be exactly ${exactDigits} digits`,
      `يجب أن يتكون رقم الهاتف من ${exactDigits} خانات`
    )
  }

  return getPhoneValidationMessage(buildInternationalPhone(countryIso, digits), t)
}

export function formatInternationalPhoneForDisplay(phoneNumber?: string | null): string {
  const { countryIso, localNumber } = splitInternationalPhone(phoneNumber)
  const country = getPhoneCountry(countryIso)

  return localNumber ? `${country.dialCode} ${localNumber}` : country.dialCode
}
