type Rating = 'good' | 'needs-improvement' | 'poor'

type WebVitalEvent = {
  id: string
  page: string
  name: string
  value: number
  delta?: number
  rating: Rating
  deviceType?: 'mobile' | 'desktop'
  viewportWidth?: number
  navigationType?: string
  recordedAt: string
}

type SummaryRow = {
  page: string
  metric: string
  deviceType: 'mobile' | 'desktop' | 'unknown'
  samples: number
  average: number
  p75: number
  poorRate: number
}

type StoreState = {
  events: WebVitalEvent[]
}

const MAX_EVENTS = Number(process.env.WEB_VITALS_MAX_EVENTS ?? 1500)
const SAMPLE_RATE = Math.min(1, Math.max(0.01, Number(process.env.WEB_VITALS_SAMPLE_RATE ?? 0.4)))

const globalStore = globalThis as typeof globalThis & {
  __storeWebVitals?: StoreState
}

function getStore(): StoreState {
  if (!globalStore.__storeWebVitals) {
    globalStore.__storeWebVitals = { events: [] }
  }
  return globalStore.__storeWebVitals
}

function percentile(values: number[], ratio: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * ratio))
  return Number(sorted[index].toFixed(2))
}

export function recordWebVital(input: Partial<WebVitalEvent>): boolean {
  if (Math.random() > SAMPLE_RATE) {
    return false
  }

  const event: WebVitalEvent = {
    id: String(input.id ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`),
    page: String(input.page ?? '/'),
    name: String(input.name ?? 'unknown'),
    value: Number(input.value ?? 0),
    delta: Number(input.delta ?? 0),
    rating: (input.rating as Rating) ?? 'good',
    deviceType: input.deviceType === 'mobile' || input.deviceType === 'desktop' ? input.deviceType : undefined,
    viewportWidth: input.viewportWidth ? Number(input.viewportWidth) : undefined,
    navigationType: input.navigationType ? String(input.navigationType) : undefined,
    recordedAt: input.recordedAt ? String(input.recordedAt) : new Date().toISOString(),
  }

  const store = getStore()
  store.events.push(event)

  if (store.events.length > MAX_EVENTS) {
    store.events.splice(0, store.events.length - MAX_EVENTS)
  }

  return true
}

export function getWebVitalSummary(): { sampledEvents: number; totalEvents: number; sampleRate: number; rows: SummaryRow[] } {
  const store = getStore()
  const grouped = new Map<string, WebVitalEvent[]>()

  for (const event of store.events) {
    const deviceType = event.deviceType ?? 'unknown'
    const key = `${event.page}|${event.name}|${deviceType}`
    const group = grouped.get(key) ?? []
    group.push(event)
    grouped.set(key, group)
  }

  const rows: SummaryRow[] = Array.from(grouped.entries()).map(([key, events]) => {
    const [page, metric, deviceType] = key.split('|')
    const values = events.map((event) => event.value)
    const poorCount = events.filter((event) => event.rating === 'poor').length

    return {
      page,
      metric,
      deviceType: (deviceType as SummaryRow['deviceType']) ?? 'unknown',
      samples: values.length,
      average: Number((values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)).toFixed(2)),
      p75: percentile(values, 0.75),
      poorRate: Number(((poorCount / Math.max(1, values.length)) * 100).toFixed(2)),
    }
  }).sort((a, b) => b.samples - a.samples)

  return {
    sampledEvents: store.events.length,
    totalEvents: store.events.length,
    sampleRate: SAMPLE_RATE,
    rows,
  }
}
