import { NextResponse } from 'next/server'

type WebVitalPayload = {
  name?: string
  value?: number
  rating?: string
  page?: string
  attribution?: Record<string, unknown>
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as WebVitalPayload

    if (process.env.NODE_ENV !== 'production') {
      console.info('[home-web-vitals]', {
        page: payload.page,
        name: payload.name,
        value: payload.value,
        rating: payload.rating,
        attribution: payload.attribution,
      })
    }

    return new NextResponse(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Invalid web vitals payload' }, { status: 400 })
  }
}