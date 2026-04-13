const PROXY_BASE_PATH = '/api/proxy'

function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return PROXY_BASE_PATH
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return new URL(PROXY_BASE_PATH, siteUrl).toString().replace(/\/$/, '')
}

export const COOKIE_AUTH_SESSION = '__cookie_session__'

type ApiErrorResponse = {
  message?: string
  title?: string
  errors?: Record<string, string[]>
}

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string
  signal?: AbortSignal
  credentials?: RequestCredentials
  cacheMode?: RequestCache
  timeoutMs?: number
}

function combineAbortSignals(...signals: (AbortSignal | undefined)[]): AbortSignal | undefined {
  const activeSignals = signals.filter(Boolean) as AbortSignal[]
  if (activeSignals.length === 0) return undefined
  if (activeSignals.length === 1) return activeSignals[0]

  if (typeof AbortSignal.any === 'function') {
    return AbortSignal.any(activeSignals)
  }

  const controller = new AbortController()
  activeSignals.forEach((signal) => {
    if (signal.aborted) {
      controller.abort()
    } else {
      signal.addEventListener('abort', () => controller.abort(), { once: true })
    }
  })
  return controller.signal
}

function toPascalCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(toPascalCase)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        k.charAt(0).toUpperCase() + k.slice(1),
        toPascalCase(v),
      ])
    )
  }
  return obj
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', body, token, signal, credentials, cacheMode, timeoutMs = 8000 }: RequestOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {}
  const defaultCacheMode = 'no-store'
  const controller = new AbortController()
  const finalSignal = combineAbortSignals(signal, controller.signal)
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  const usesCookieSession = !token || token === COOKIE_AUTH_SESSION

  if (token && token !== COOKIE_AUTH_SESSION) {
    headers.Authorization = `Bearer ${token}`
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const baseUrl = getBaseUrl()

  if (process.env.NODE_ENV === 'development') {
    console.log(`-> API [${method}] ${baseUrl}${path}`)
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      credentials: credentials ?? (usesCookieSession ? 'include' : 'omit'),
      body: body ? JSON.stringify(toPascalCase(body)) : undefined,
      cache: cacheMode ?? defaultCacheMode,
      signal: finalSignal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText })) as ApiErrorResponse
      const validationMessage = err.errors
        ? Object.values(err.errors).flat().find(Boolean)
        : undefined
      throw new ApiError(
        res.status,
        validationMessage ?? err.message ?? err.title ?? 'Request failed'
      )
    }

    if (res.status === 204) return undefined as T

    return res.json() as Promise<T>
  } catch (error) {
    clearTimeout(timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timed out')
    }
    throw error
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
