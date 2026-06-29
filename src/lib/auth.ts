import type { User } from '../context/UserContext'
import { redirectUri, claimCallback } from './oauth'
import { LINK_PROVIDER_MUTATION } from './queries'

const TOKEN_KEY = 'medistat_token'
const API_URL = import.meta.env.VITE_API_URL as string

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = JSON.parse(atob(token.split('.')[1]))
    return typeof exp === 'number' && exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function decodeToken(token: string): User | null {
  if (isTokenExpired(token)) return null
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return {
      sub: decoded.sub,
      username: decoded.username,
      email: decoded.email,
      avatarUrl: decoded.avatarUrl ?? null
    }
  } catch {
    return null
  }
}

export function loadCurrentUser(): User | null {
  const token = getToken()
  if (!token) return null
  const user = decodeToken(token)
  if (!user) clearToken()
  return user
}

export async function exchangeCodeForToken(
  provider: string,
  code: string,
  codeVerifier: string
): Promise<string | null> {
  const res = await fetch(`${API_URL}/auth/${provider}/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, codeVerifier, redirectUri: redirectUri() })
  })
  const data: { token?: string } = await res.json()
  return data.token ?? null
}

export async function completeLogin(): Promise<User | null> {
  const params = claimCallback()
  if (!params) return null
  const alreadySignedIn = getToken() !== null
  if (alreadySignedIn) {
    return linkProviderToAccount(params.provider, params.code, params.verifier)
  }
  return signInWithCode(params.provider, params.code, params.verifier)
}

async function signInWithCode(
  provider: string,
  code: string,
  codeVerifier: string
): Promise<User | null> {
  const token = await exchangeCodeForToken(provider, code, codeVerifier)
  if (!token) return null
  saveToken(token)
  return decodeToken(token)
}

async function linkProviderToAccount(
  provider: string,
  code: string,
  codeVerifier: string
): Promise<User | null> {
  const response = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify({
      query: LINK_PROVIDER_MUTATION,
      variables: { provider, code, codeVerifier, redirectUri: redirectUri() }
    })
  })
  const result = await response.json()
  if (result.errors?.length) throw new Error(result.errors[0].message)
  return loadCurrentUser()
}
