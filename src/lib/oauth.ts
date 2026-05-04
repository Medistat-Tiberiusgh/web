export const VERIFIER_KEY = 'medistat_pkce_verifier'

export function redirectUri(): string {
  return `${window.location.origin}/`
}

export function claimCallback(): { code: string; verifier: string } | null {
  const code = new URLSearchParams(window.location.search).get('code')
  if (!code) return null
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  sessionStorage.removeItem(VERIFIER_KEY)
  window.history.replaceState({}, '', window.location.pathname)
  if (!verifier) return null
  return { code, verifier }
}

function base64url(bytes: Uint8Array): string {
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function generateVerifier(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return base64url(bytes)
}

export async function computeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return base64url(new Uint8Array(hash))
}
