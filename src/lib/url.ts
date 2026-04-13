/**
 * URL helpers to avoid "Failed to construct 'URL': Invalid URL"
 * when NEXT_PUBLIC_API_URL is missing or lacks a scheme (http/https).
 */
export function normalizeBaseUrl(input?: string | null): string {
  const raw = (input ?? '').trim()
  if (!raw) return ''

  // Already absolute
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, '')

  // If provided as host:port or domain without scheme
  const host = raw.replace(/\/$/, '')
  const isLocal =
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('0.0.0.0')

  const scheme = isLocal ? 'http://' : 'https://'
  return (scheme + host).replace(/\/$/, '')
}

function isLikelyImagePath(path: string): boolean {
  const normalized = path.trim().toLowerCase()
  return (
    normalized.includes('/images/') ||
    /\.(png|jpe?g|webp|gif|svg|avif)(\?|$)/.test(normalized)
  )
}

function getPublicImageBaseUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? process.env.NEXT_PUBLIC_BLOB_BASE_URL ?? ''
  )
}

function isPrivateOrLocalHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase()
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized.startsWith('10.') ||
    normalized.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized)
  )
}

/**
 * Joins base + path safely.
 * - If path is absolute (http/https), returns it.
 * - If base is empty, returns a relative path (same-origin).
 */
export function joinUrl(base: string, path?: string | null): string | null {
  if (!path) return null

  const imageBase = getPublicImageBaseUrl()

  if (/^https?:\/\//i.test(path)) {
    try {
      const source = new URL(path)
      if (!isLikelyImagePath(source.pathname)) {
        return path
      }

      const rewriteBase =
        imageBase ||
        (isPrivateOrLocalHost(source.hostname) ? normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL) : '')

      if (!rewriteBase) {
        return path
      }

      const target = new URL(`${source.pathname}${source.search}`, `${rewriteBase}/`)
      return target.toString()
    } catch {
      return path
    }
  }

  const b = normalizeBaseUrl(base)
  const p = path.startsWith('/') ? path : `/${path}`

  if (imageBase && isLikelyImagePath(p)) {
    return `${imageBase}${p}`
  }

  if (!b) return p
  return `${b}${p}`
}

export function getPublicApiBaseUrl(): string {
  return normalizeBaseUrl(
    process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_HOSTNAME ?? ''
  )
}
