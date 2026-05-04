import { NextResponse } from 'next/server'
import { getWebVitalSummary, recordWebVital } from '@/lib/analytics/webVitalsStore'

type WebVitalPayload = {
  id?: string
  name?: string
  value?: number
  delta?: number
  rating?: string
  page?: string
  deviceType?: 'mobile' | 'desktop'
  viewportWidth?: number
  navigationType?: string
  recordedAt?: string
  attribution?: Record<string, unknown>
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as WebVitalPayload

    const rating =
      payload.rating === 'good' || payload.rating === 'needs-improvement' || payload.rating === 'poor'
        ? payload.rating
        : 'good'

    recordWebVital({
      ...payload,
      rating,
    })

    if (process.env.NODE_ENV !== 'production') {
      console.info('[home-web-vitals]', {
        page: payload.page,
        name: payload.name,
        value: payload.value,
        rating: payload.rating,
        deviceType: payload.deviceType,
        attribution: payload.attribution,
      })
    }

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Invalid web vitals payload' }, { status: 400 })
  }
}

export async function GET() {
  const summary = getWebVitalSummary()
  return NextResponse.json(summary, { status: 200 })
}