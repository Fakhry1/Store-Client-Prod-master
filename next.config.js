/** @type {import('next').NextConfig} */

if (process.env.NODE_ENV === 'development' && process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  console.warn('[store] TLS verification disabled - development mode only')
}

function normalizeUrl(input) {
  const raw = (input || '').trim()
  if (!raw) return ''
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, '')

  const host = raw.replace(/\/$/, '')
  const isLocal =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('0.0.0.0')

  return `${isLocal ? 'http' : 'https'}://${host}`
}

function normalizeHostToUrl(host) {
  const raw = (host || '').trim()
  if (!raw) return ''
  return normalizeUrl(raw)
}

function buildRemotePattern(input) {
  const normalized = normalizeUrl(input)
  if (!normalized) return null

  const url = new URL(normalized)
  const pattern = {
    protocol: url.protocol.replace(':', ''),
    hostname: url.hostname,
    pathname: '/**',
  }

  if (url.port) {
    pattern.port = url.port
  }

  return pattern
}

const isDevelopment = process.env.NODE_ENV === 'development'

const remotePatterns = []
const apiPattern =
  buildRemotePattern(process.env.NEXT_PUBLIC_API_URL) ??
  buildRemotePattern(normalizeHostToUrl(process.env.NEXT_PUBLIC_API_HOSTNAME))
const imagePattern =
  buildRemotePattern(process.env.NEXT_PUBLIC_IMAGE_BASE_URL) ??
  buildRemotePattern(process.env.NEXT_PUBLIC_BLOB_BASE_URL) ??
  buildRemotePattern(normalizeHostToUrl(process.env.NEXT_PUBLIC_IMAGE_HOSTNAME)) ??
  buildRemotePattern(normalizeHostToUrl(process.env.NEXT_PUBLIC_BLOB_HOSTNAME))

if (isDevelopment) {
  remotePatterns.push(
    { protocol: 'https', hostname: 'localhost', port: '44304', pathname: '/**' },
    { protocol: 'http', hostname: 'localhost', port: '44304', pathname: '/**' }
  )
}

if (apiPattern) {
  remotePatterns.push(apiPattern)
}

if (imagePattern) {
  remotePatterns.push(imagePattern)
}

remotePatterns.push(
  {
    protocol: 'https',
    hostname: 'images.unsplash.com',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: '**.blob.core.windows.net',
    pathname: '/**',
  }
)

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
    ]
  },
  images: {
    unoptimized: isDevelopment,
    dangerouslyAllowLocalIP: isDevelopment,
    formats: ['image/avif', 'image/webp'],
    qualities: [100, 75],
    remotePatterns,
  },
}

module.exports = nextConfig
