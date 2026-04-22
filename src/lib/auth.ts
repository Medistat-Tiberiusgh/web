import type { User } from '../context/UserContext'

const TOKEN_KEY = 'medistat_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function decodeToken(token: string): User | null {
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
