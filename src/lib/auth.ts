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
