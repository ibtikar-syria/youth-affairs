import type { AuthTokenPayload } from './types'

const encoder = new TextEncoder()

const toBase64Url = (value: string) =>
  btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')

const fromBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padLength = (4 - (base64.length % 4)) % 4
  return atob(base64 + '='.repeat(padLength))
}

const importKey = (secret: string) =>
  crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ])

const signHmac = async (value: string, secret: string) => {
  const key = await importKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  const bytes = new Uint8Array(signature)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return toBase64Url(binary)
}

export const signJwt = async (payload: Omit<AuthTokenPayload, 'exp'>, secret: string, ttlSeconds = 60 * 60 * 8) => {
  const fullPayload: AuthTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }

  const header = toBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = toBase64Url(JSON.stringify(fullPayload))
  const signature = await signHmac(`${header}.${body}`, secret)
  return `${header}.${body}.${signature}`
}

export const verifyJwt = async (token: string, secret: string): Promise<AuthTokenPayload | null> => {
  const [header, body, signature] = token.split('.')
  if (!header || !body || !signature) {
    return null
  }

  const expected = await signHmac(`${header}.${body}`, secret)
  if (expected !== signature) {
    return null
  }

  try {
    const payload = JSON.parse(fromBase64Url(body)) as AuthTokenPayload
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return payload
  } catch {
    return null
  }
}