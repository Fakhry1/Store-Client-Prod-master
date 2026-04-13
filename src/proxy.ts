import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/account',
  '/orders',
  '/wishlist',
]
const CSP_REPORT_ENDPOINT = '/api/security/csp-report'
const ENABLE_CSP_REPORT_ONLY = process.env.CSP_REPORT_ONLY === '1'

function withReporting(directives: string[]): string[] {
  return [
    ...directives,
    `report-uri ${CSP_REPORT_ENDPOINT}`,
    'report-to csp-endpoint',
  ]
}

function buildCsp(nonce: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development'

  const directives = withReporting([
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https:${isDevelopment ? ' http:' : ''}`,
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ])

  if (!isDevelopment) {
    directives.push('upgrade-insecure-requests')
  }

  return directives.join('; ')
}

function buildCspReportOnly(nonce: string): string {
  const isDevelopment = process.env.NODE_ENV === 'development'

  const directives = withReporting([
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'${isDevelopment ? " 'unsafe-eval'" : ''}`,
    "style-src 'self'",
    `img-src 'self' data: blob: https:${isDevelopment ? ' http:' : ''}`,
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ])

  if (!isDevelopment) {
    directives.push('upgrade-insecure-requests')
  }

  return directives.join('; ')
}

function buildReportToHeader(): string {
  return JSON.stringify({
    group: 'csp-endpoint',
    max_age: 10886400,
    endpoints: [{ url: CSP_REPORT_ENDPOINT }],
  })
}

function applySecurityHeaders(response: NextResponse, nonce: string) {
  response.headers.set('Content-Security-Policy', buildCsp(nonce))
  response.headers.set('Report-To', buildReportToHeader())

  if (ENABLE_CSP_REPORT_ONLY) {
    response.headers.set('Content-Security-Policy-Report-Only', buildCspReportOnly(nonce))
  }

  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const nonce = crypto.randomUUID().replace(/-/g, '')
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const nextResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  applySecurityHeaders(nextResponse, nonce)

  const isProtected = PROTECTED_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  if (!isProtected) {
    return nextResponse
  }

  const authHint = request.cookies.get('store_auth_hint')

  if (!authHint?.value) {
    const loginUrl = new URL('/auth/login', request.url)
    const redirectPath = `${pathname}${request.nextUrl.search}`
    loginUrl.searchParams.set('redirect', redirectPath)
    const redirectResponse = NextResponse.redirect(loginUrl)
    applySecurityHeaders(redirectResponse, nonce)
    return redirectResponse
  }

  return nextResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
