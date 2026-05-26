import { getToken } from './auth'

const GRAPHQL_URL = `${import.meta.env.VITE_API_URL}/graphql`

export async function gqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
  signal?: AbortSignal
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    signal
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }

  const json = await res.json()

  if (json.errors?.length) {
    throw new Error(json.errors[0].message)
  }

  return json.data as T
}
