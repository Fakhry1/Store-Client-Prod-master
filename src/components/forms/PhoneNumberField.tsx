'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocale } from '@/context/locale'
import {
  buildInternationalPhone,
  DEFAULT_PHONE_COUNTRY,
  getPhoneCountry,
  PHONE_COUNTRIES,
  splitInternationalPhone,
} from '@/lib/phone'

type PhoneNumberFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  onMetaChange?: (meta: { countryIso: string; localNumber: string }) => void
  required?: boolean
  error?: string
  hint?: string
  showMetaRow?: boolean
  inputMaxLength?: number
}

export function PhoneNumberField({
  label,
  value,
  onChange,
  onMetaChange,
  required = false,
  error,
  hint,
  showMetaRow = true,
  inputMaxLength,
}: PhoneNumberFieldProps) {
  const { locale, t } = useLocale()
  const [countryIso, setCountryIso] = useState(DEFAULT_PHONE_COUNTRY)
  const [localNumber, setLocalNumber] = useState('')

  useEffect(() => {
    const next = splitInternationalPhone(value)
    setCountryIso(next.countryIso)
    setLocalNumber(next.localNumber)
  }, [value])

  const selectedCountry = useMemo(() => getPhoneCountry(countryIso), [countryIso])

  function handleCountryChange(nextCountryIso: string) {
    setCountryIso(nextCountryIso)
    onChange(buildInternationalPhone(nextCountryIso, localNumber))
    onMetaChange?.({ countryIso: nextCountryIso, localNumber })
  }

  function handleNumberChange(nextValue: string) {
    const digits = nextValue.replace(/\D/g, '')
    setLocalNumber(digits)
    onChange(buildInternationalPhone(countryIso, digits))
    onMetaChange?.({ countryIso, localNumber: digits })
  }

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--mute)' }}>
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div
        dir="ltr"
        className={`flex items-stretch overflow-hidden rounded-2xl border bg-white transition-all ${
          error
            ? 'border-rose-300 ring-2 ring-rose-100'
            : 'focus-within:ring-2'
        }`}
        style={!error ? {
          borderColor: 'var(--line)',
        } : undefined}
      >
        <div className="relative w-[5.25rem] sm:w-[5.75rem]" style={{ background: 'var(--paper)', borderColor: 'var(--line)' }}>
          <select
            value={countryIso}
            onChange={(e) => handleCountryChange(e.target.value)}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
            className="h-full w-full appearance-none bg-transparent px-2.5 py-3 pe-7 text-sm font-bold text-transparent outline-none"
          >
            {PHONE_COUNTRIES.map((country) => (
              <option key={country.iso} value={country.iso}>
                {(locale === 'ar' ? country.nameAr : country.nameEn)} ({country.dialCode})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-0 flex items-center px-2.5 py-3">
            <span className="text-sm font-black" style={{ color: 'var(--ink)' }} dir="ltr">
              {selectedCountry.dialCode}
            </span>
          </div>
        </div>

        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          dir="ltr"
          value={localNumber}
          onChange={(e) => handleNumberChange(e.target.value)}
          placeholder={selectedCountry.placeholder}
          maxLength={inputMaxLength}
          className="w-full min-w-0 bg-white px-4 py-3 text-sm outline-none placeholder:text-[var(--mute)]"
          style={{ color: 'var(--ink)' }}
        />
      </div>

      {showMetaRow && (
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className={`text-xs ${error ? 'text-rose-500' : ''}`}
            style={error ? undefined : { color: 'var(--mute)' }}>
            {error || hint || t('International format will be saved automatically', 'سيتم حفظ الرقم بصيغة دولية تلقائيًا')}
          </p>
          <span className="shrink-0 text-xs font-bold" style={{ color: 'var(--mute)' }} dir="ltr">
            {selectedCountry.dialCode}
          </span>
        </div>
      )}
    </div>
  )
}
