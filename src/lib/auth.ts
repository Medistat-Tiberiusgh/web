import type { User } from '../context/UserContext'
import { redirectUri, claimCallback } from './oauth'

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
      regionId: decoded.regionId,
      genderId: decoded.genderId,
      ageGroupId: decoded.ageGroupId,
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
  code: string,
  codeVerifier: string
): Promise<string | null> {
  const res = await fetch(`${API_URL}/auth/github/exchange`, {
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
  const token = await exchangeCodeForToken(params.code, params.verifier)
  if (!token) return null
  saveToken(token)
  return decodeToken(token)
}
