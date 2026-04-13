import http from 'node:http'
import https from 'node:https'
import { URL } from 'node:url'

type ServerRequestOptions = {
  token?: string
  timeoutMs?: number
}

const BASE_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost:44304'
const HTTP_AGENT = new http.Agent({ keepAlive: true })
const HTTPS_AGENT = new https.Agent({ keepAlive: true, rejectUnauthorized: true })
const HTTPS_AGENT_INSECURE = new https.Agent({ keepAlive: true, rejectUnauthorized: false })

function buildUrl(path: string): URL {
  return new URL(path, BASE_URL)
}

function allowInsecureLocalhost(url: URL): boolean {
  return (
    process.env.NODE_ENV === 'development' &&
    url.protocol === 'https:' &&
    ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
  )
}

function getAgent(url: URL): http.Agent | https.Agent {
  if (url.protocol !== 'https:') return HTTP_AGENT
  return allowInsecureLocalhost(url) ? HTTPS_AGENT_INSECURE : HTTPS_AGENT
}

export async function serverApiGet<T>(
  path: string,
  { token, timeoutMs = 8000 }: ServerRequestOptions = {}
): Promise<T> {
  const url = buildUrl(path)
  const transport = url.protocol === 'https:' ? https : http

  return new Promise<T>((resolve, reject) => {
    const req = transport.request(
      url,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        agent: getAgent(url),
      },
      (res) => {
        let raw = ''

        res.setEncoding('utf8')
        res.on('data', (chunk) => {
          raw += chunk
        })
        res.on('end', () => {
          const status = res.statusCode ?? 500

          if (status < 200 || status >= 300) {
            try {
              const parsed = raw ? JSON.parse(raw) : null
              reject(new Error(parsed?.message ?? `Request failed with status ${status}`))
            } catch {
              reject(new Error(raw || `Request failed with status ${status}`))
            }
            return
          }

          if (!raw) {
            resolve(undefined as T)
            return
          }

          try {
            resolve(JSON.parse(raw) as T)
          } catch (error) {
            reject(error)
          }
        })
      }
    )

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Request timed out after ${timeoutMs}ms`))
    })
    req.on('error', reject)
    req.end()
  })
}
