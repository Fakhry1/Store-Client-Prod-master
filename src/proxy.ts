import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED_ROUTES = [
  '/account',
  '/orders',
  '/wishlist',
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  )

  if (!isProtected) {
    return NextResponse.next()
  }

  const authHint = request.cookies.get('store_auth_hint')

  if (!authHint?.value) {
    const loginUrl = new URL('/auth/login', request.url)
    const redirectPath = `${pathname}${request.nextUrl.search}`
    loginUrl.searchParams.set('redirect', redirectPath)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/account/:path*',
    '/orders/:path*',
    '/wishlist/:path*',
  ],
}
