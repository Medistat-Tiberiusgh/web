export const VERIFIER_KEY = 'medistat_pkce_verifier'
export const PROVIDER_KEY = 'medistat_oauth_provider'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

export function redirectUri(): string {
  return `${window.location.origin}/`
}

export async function startGithubLogin(): Promise<void> {
  const challenge = await beginPkce('github')
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri(),
    // user:email is required so the backend can read the verified primary email
    // it uses to key and link accounts; read:user alone does not grant it.
    scope: 'read:user user:email',
    code_challenge: challenge,
    code_challenge_method: 'S256'
  })
  window.location.href = `https://github.com/login/oauth/authorize?${params}`
}

export async function startGoogleLogin(): Promise<void> {
  const challenge = await beginPkce('google')
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account'
  })
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

// Stores the PKCE verifier and which provider started the flow, so the callback
// knows where to exchange the code. Returns the challenge for the authorize URL.
async function beginPkce(provider: string): Promise<string> {
  const verifier = generateVerifier()
  const challenge = await computeChallenge(verifier)
  sessionStorage.setItem(VERIFIER_KEY, verifier)
  sessionStorage.setItem(PROVIDER_KEY, provider)
  return challenge
}

export function claimCallback(): {
  code: string
  verifier: string
  provider: string
} | null {
  const code = new URLSearchParams(window.location.search).get('code')
  if (!code) return null
  const verifier = sessionStorage.getItem(VERIFIER_KEY)
  const provider = sessionStorage.getItem(PROVIDER_KEY)
  sessionStorage.removeItem(VERIFIER_KEY)
  sessionStorage.removeItem(PROVIDER_KEY)
  window.history.replaceState({}, '', window.location.pathname)
  if (!verifier || !provider) return null
  return { code, verifier, provider }
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
