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

/**
 * Joins base + path safely.
 * - If path is absolute (http/https), returns it.
 * - If base is empty, returns a relative path (same-origin).
 */
export function joinUrl(base: string, path?: string | null): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path

  const b = normalizeBaseUrl(base)
  const p = path.startsWith('/') ? path : `/${path}`

  if (!b) return p
  return `${b}${p}`
}

export function getPublicApiBaseUrl(): string {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL)
}
