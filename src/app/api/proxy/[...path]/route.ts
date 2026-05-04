import { URL } from 'node:url'
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ''
const MAX_PROXY_BODY_BYTES = Number(process.env.PROXY_MAX_BODY_BYTES ?? 1_048_576)
const REQUEST_TIMEOUT_MS = Number(process.env.PROXY_REQUEST_TIMEOUT_MS ?? 20_000)

const REQUEST_HEADER_DENYLIST = new Set([
  'accept-encoding',
  'connection',
  'content-length',
  'host',
])

const RESPONSE_HEADER_DENYLIST = new Set([
  'connection',
  'content-length',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

type RouteContext = {
  params: Promise<{ path: string[] }>
}

function buildTargetUrl(pathSegments: string[], search: string) {
  if (!API_BASE_URL) {
    throw new Error('API_URL is not configured')
  }

  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`
  const target = new URL(pathSegments.join('/'), baseUrl)
  target.search = search
  return target
}

function toForwardRequestHeaders(request: NextRequest): Headers {
  const headers = new Headers()

  request.headers.forEach((value, key) => {
    if (!REQUEST_HEADER_DENYLIST.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  return headers
}

function copyResponseHeaders(upstreamHeaders: Headers, response: NextResponse) {
  upstreamHeaders.forEach((value, key) => {
    if (!RESPONSE_HEADER_DENYLIST.has(key.toLowerCase())) {
      response.headers.set(key, value)
    }
  })
}

function parseContentLength(request: NextRequest): number {
  const contentLength = Number(request.headers.get('content-length') ?? '0')
  return Number.isFinite(contentLength) ? Math.max(0, contentLength) : 0
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const targetUrl = buildTargetUrl(path, request.nextUrl.search)
  const contentLength = parseContentLength(request)

  if (contentLength > MAX_PROXY_BODY_BYTES) {
    return NextResponse.json({ message: 'Payload too large' }, { status: 413 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const hasBody = request.method !== 'GET' && request.method !== 'HEAD'
    const upstream = await fetch(targetUrl, {
      method: request.method,
      headers: toForwardRequestHeaders(request),
      body: hasBody ? request.body : undefined,
      signal: controller.signal,
      // Node.js fetch requires duplex for streaming request bodies.
      duplex: hasBody ? 'half' : undefined,
      cache: 'no-store',
    } as RequestInit)

    const response = new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
    })

    copyResponseHeaders(upstream.headers, response)
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reach upstream service'

    if (controller.signal.aborted) {
      return NextResponse.json(
        { message: `Upstream request timed out after ${REQUEST_TIMEOUT_MS}ms` },
        { status: 504 }
      )
    }

    return NextResponse.json({ message }, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function POST(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}

export async function OPTIONS(request: NextRequest, context: RouteContext) {
  return proxyRequest(request, context)
}
