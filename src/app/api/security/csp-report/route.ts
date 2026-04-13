import { NextResponse } from 'next/server'

type CspReportBody = {
  'csp-report'?: Record<string, unknown>
} & Record<string, unknown>

type CounterMap = Record<string, number>

type CspAggregateStore = {
  totalReports: number
  byEffectiveDirective: CounterMap
  byBlockedUri: CounterMap
  byDisposition: CounterMap
  lastSeenAt: string | null
}

declare global {
  var __storeCspAggregate: CspAggregateStore | undefined
}

function getAggregateStore(): CspAggregateStore {
  if (!globalThis.__storeCspAggregate) {
    globalThis.__storeCspAggregate = {
      totalReports: 0,
      byEffectiveDirective: {},
      byBlockedUri: {},
      byDisposition: {},
      lastSeenAt: null,
    }
  }

  return globalThis.__storeCspAggregate
}

function normalizeLabel(value: unknown, fallback: string): string {
  const text = typeof value === 'string' ? value.trim() : ''
  return text || fallback
}

function incrementCounter(counter: CounterMap, key: string) {
  counter[key] = (counter[key] ?? 0) + 1
}

function topEntries(counter: CounterMap, limit = 10): Array<{ key: string; count: number }> {
  return Object.entries(counter)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

function toObject(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {}
}

function sanitizeReport(input: Record<string, unknown>): Record<string, unknown> {
  const allowedKeys = [
    'document-uri',
    'referrer',
    'violated-directive',
    'effective-directive',
    'original-policy',
    'disposition',
    'blocked-uri',
    'line-number',
    'column-number',
    'source-file',
    'status-code',
  ]

  const sanitized: Record<string, unknown> = {}
  for (const key of allowedKeys) {
    if (key in input) {
      sanitized[key] = input[key]
    }
  }

  return sanitized
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as CspReportBody
    const rawReport = toObject(body['csp-report'] ?? body)
    const report = sanitizeReport(rawReport)

    if (Object.keys(report).length > 0) {
      const aggregate = getAggregateStore()
      const effectiveDirective = normalizeLabel(report['effective-directive'], 'unknown')
      const blockedUri = normalizeLabel(report['blocked-uri'], 'unknown')
      const disposition = normalizeLabel(report.disposition, 'unknown')

      aggregate.totalReports += 1
      aggregate.lastSeenAt = new Date().toISOString()
      incrementCounter(aggregate.byEffectiveDirective, effectiveDirective)
      incrementCounter(aggregate.byBlockedUri, blockedUri)
      incrementCounter(aggregate.byDisposition, disposition)

      console.warn('[csp-report]', JSON.stringify(report))
    }
  } catch {
    // Never fail user requests because of report processing issues.
  }

  return new NextResponse(null, { status: 204 })
}

export async function GET() {
  const aggregate = getAggregateStore()

  return NextResponse.json({
    totalReports: aggregate.totalReports,
    lastSeenAt: aggregate.lastSeenAt,
    topEffectiveDirectives: topEntries(aggregate.byEffectiveDirective),
    topBlockedUris: topEntries(aggregate.byBlockedUri),
    topDispositions: topEntries(aggregate.byDisposition),
  })
}
