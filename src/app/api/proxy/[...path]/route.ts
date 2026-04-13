import http from 'node:http'
import https from 'node:https'
import { URL } from 'node:url'
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ''
const MAX_PROXY_BODY_BYTES = Number(process.env.PROXY_MAX_BODY_BYTES ?? 1_048_576)
const REQUEST_TIMEOUT_MS = Number(process.env.PROXY_REQUEST_TIMEOUT_MS ?? 10_000)
const HTTP_AGENT = new http.Agent({ keepAlive: true })
const HTTPS_AGENT = new https.Agent({ keepAlive: true, rejectUnauthorized: true })
const HTTPS_AGENT_INSECURE = new https.Agent({ keepAlive: true, rejectUnauthorized: false })
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

function allowInsecureLocalhost(url: URL): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    url.protocol === 'https:' &&
    ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  )
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  const targetUrl = buildTargetUrl(path, request.nextUrl.search)
  const transport = targetUrl.protocol === 'https:' ? https : http
  const contentLength = Number(request.headers.get('content-length') ?? '0')

  if (contentLength > MAX_PROXY_BODY_BYTES) {
    return NextResponse.json(
      { message: 'Payload too large' },
      { status: 413 }
    )
  }

  const body =
    request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : Buffer.from(await request.arrayBuffer())

  if (body && body.length > MAX_PROXY_BODY_BYTES) {
    return NextResponse.json(
      { message: 'Payload too large' },
      { status: 413 }
    )
  }

  const requestHeaders: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (REQUEST_HEADER_DENYLIST.has(lowerKey)) {
      return
    }
    requestHeaders[key] = value
  })

  const upstream = await new Promise<{
    status: number
    statusText: string
    headers: http.IncomingHttpHeaders
    body: Buffer
  }>((resolve, reject) => {
    const req = transport.request(
      targetUrl,
      {
        method: request.method,
        headers: requestHeaders,
        agent:
          targetUrl.protocol === 'https:'
            ? (allowInsecureLocalhost(targetUrl) ? HTTPS_AGENT_INSECURE : HTTPS_AGENT)
            : HTTP_AGENT,
      },
      (res) => {
        const chunks: Buffer[] = []

        res.on('data', (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })

        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 500,
            statusText: res.statusMessage ?? 'Internal Server Error',
            headers: res.headers,
            body: Buffer.concat(chunks),
          })
        })
      }
    )

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(new Error(`Upstream request timed out after ${REQUEST_TIMEOUT_MS}ms`))
    })
    req.on('error', reject)

    if (body && body.length > 0) {
      req.write(body)
    }

    req.end()
  })

  const response = new NextResponse(new Uint8Array(upstream.body), {
    status: upstream.status,
    statusText: upstream.statusText,
  })

  Object.entries(upstream.headers).forEach(([key, value]) => {
    if (!value || RESPONSE_HEADER_DENYLIST.has(key.toLowerCase())) {
      return
    }

    if (Array.isArray(value)) {
      response.headers.delete(key)
      value.forEach((item) => response.headers.append(key, item))
      return
    }

    response.headers.set(key, value)
  })

  return response
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
