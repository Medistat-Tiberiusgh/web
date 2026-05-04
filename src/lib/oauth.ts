export const VERIFIER_KEY = 'medistat_pkce_verifier'

export function redirectUri(): string {
  return `${window.location.origin}/`
}
