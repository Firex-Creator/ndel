// Shared by the proxy and the demo-access server action. Uses Web Crypto only.

export const DEMO_COOKIE = 'ndel_demo_access'
export const DEMO_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const encoder = new TextEncoder()

async function hmac(message: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(process.env.PAYLOAD_SECRET || 'missing-secret'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * The cookie value is bound to the current password, so changing
 * DEMO_ACCESS_PASSWORD signs everyone out.
 */
export const expectedDemoToken = () => hmac(`demo-access:v1:${process.env.DEMO_ACCESS_PASSWORD ?? ''}`)

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** Password gate state: "open" in dev without a password, "closed" if misconfigured in production. */
export function demoGateMode(): 'protected' | 'open' | 'misconfigured' {
  if (process.env.SITE_MODE === 'live') return 'open'
  if (process.env.DEMO_ACCESS_PASSWORD) return 'protected'
  return process.env.NODE_ENV === 'production' ? 'misconfigured' : 'open'
}
