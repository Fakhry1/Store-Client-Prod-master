'use client'

import { useReportWebVitals } from 'next/web-vitals'

type VitalEntrySummary = {
  entryType?: string
  name?: string
  startTime?: number
  duration?: number
}

type HomeVitalMetric = {
  id: string
  name: string
  value: number
  delta: number
  rating: 'good' | 'needs-improvement' | 'poor'
  navigationType?: string
  entries?: PerformanceEntry[]
  attribution?: Record<string, unknown>
}

function roundMetric(value: number) {
  return Number(value.toFixed(2))
}

function toSelector(node: unknown): string | undefined {
  if (!(node instanceof Element)) return undefined

  const id = node.getAttribute('id')
  if (id) return `#${id}`

  const classes = Array.from(node.classList).slice(0, 2).join('.')
  if (classes) return `${node.tagName.toLowerCase()}.${classes}`

  return node.tagName.toLowerCase()
}

function summarizeEntries(entries?: PerformanceEntry[]): VitalEntrySummary[] | undefined {
  if (!entries?.length) return undefined

  return entries.slice(0, 5).map((entry) => ({
    entryType: entry.entryType,
    name: entry.name,
    startTime: roundMetric(entry.startTime),
    duration: roundMetric(entry.duration),
  }))
}

function sanitizeAttribution(attribution?: Record<string, unknown>) {
  if (!attribution) return undefined

  const sanitized = Object.entries(attribution).reduce<Record<string, unknown>>((result, [key, value]) => {
    if (value == null) return result

    if (typeof value === 'number') {
      result[key] = roundMetric(value)
      return result
    }

    if (typeof value === 'string' || typeof value === 'boolean') {
      result[key] = value
      return result
    }

    if (value instanceof Element) {
      result[key] = toSelector(value)
      return result
    }

    if (Array.isArray(value) && value.every((item) => item instanceof PerformanceEntry)) {
      result[key] = summarizeEntries(value)
      return result
    }

    return result
  }, {})

  return Object.keys(sanitized).length > 0 ? sanitized : undefined
}

function reportMetric(metric: HomeVitalMetric) {
  const isMobile = typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  const debugEnabled =
    process.env.NODE_ENV === 'development' ||
    (typeof window !== 'undefined' && window.localStorage.getItem('debug:web-vitals') === '1')

  const payload = {
    id: metric.id,
    name: metric.name,
    value: roundMetric(metric.value),
    delta: roundMetric(metric.delta),
    rating: metric.rating,
    page: '/',
    navigationType: metric.navigationType,
    entries: summarizeEntries(metric.entries),
    attribution: sanitizeAttribution(metric.attribution),
    deviceType: isMobile ? 'mobile' : 'desktop',
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : undefined,
    recordedAt: new Date().toISOString(),
  }

  const prefix = payload.rating === 'poor'
    ? '[web-vitals][poor]'
    : payload.rating === 'needs-improvement'
      ? '[web-vitals][warn]'
      : '[web-vitals]'

  if (debugEnabled) {
    console.info(prefix, payload)
  }

  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon('/api/analytics/web-vitals', blob)
    return
  }

  void fetch('/api/analytics/web-vitals', {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
    keepalive: true,
  })
}

export function HomeVitals() {
  useReportWebVitals((metric) => {
    reportMetric(metric as HomeVitalMetric)
  })

  return null
}