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
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>

      <div
        className={`flex items-stretch overflow-hidden rounded-2xl border bg-white transition-all ${
          error
            ? 'border-rose-300 ring-2 ring-rose-100'
            : 'border-slate-200 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20'
        }`}
      >
        <div className="relative min-w-[9.5rem] border-slate-200 bg-stone-50/80 sm:min-w-[10.5rem]">
          <select
            value={countryIso}
            onChange={(e) => handleCountryChange(e.target.value)}
            className="h-full w-full appearance-none bg-transparent px-3 py-3 pe-8 text-sm font-bold text-slate-700 outline-none"
          >
            {PHONE_COUNTRIES.map((country) => (
              <option key={country.iso} value={country.iso}>
                {(locale === 'ar' ? country.nameAr : country.nameEn)} ({country.dialCode})
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-xs font-black text-slate-400">
            {selectedCountry.flag}
          </span>
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
          className="w-full min-w-0 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {showMetaRow && (
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className={`text-xs ${error ? 'text-rose-500' : 'text-slate-400'}`}>
            {error || hint || t('International format will be saved automatically', 'سيتم حفظ الرقم بصيغة دولية تلقائيًا')}
          </p>
          <span className="shrink-0 text-xs font-bold text-slate-400" dir="ltr">
            {selectedCountry.dialCode}
          </span>
        </div>
      )}
    </div>
  )
}
