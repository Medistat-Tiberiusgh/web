import { useState, useEffect, useRef } from 'react'
import { gqlFetch } from './graphql'

interface QueryOptions<T> {
  // Required so every call site declares its one empty representation — list
  // hooks pass `[]`, detail hooks pass `null`. No phantom `undefined` state.
  initialData: T
  // When false, the query is skipped and state resets to `initialData`.
  enabled?: boolean
}

interface QueryResult<T> {
  data: T
  error: string | null
  loading: boolean
}

/**
 * Read-only GraphQL query as a hook. Owns request cancellation, error capture,
 * and the "has anything loaded since the last reset" question so consuming
 * hooks keep only their domain logic.
 *
 * Loading is true only on the first load since the last reset: a variable
 * change while enabled is a silent refetch (stale data stays on screen until
 * the new response lands), and only `enabled: false` clears back to initialData.
 */
export function useGqlQuery<T>(
  query: string,
  variables: Record<string, unknown>,
  options: QueryOptions<T>
): QueryResult<T> {
  const { initialData, enabled = true } = options

  const [data, setData] = useState<T>(initialData)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(enabled)
  const hasLoaded = useRef(false)

  // Variables are built as object literals with stable key order at each call
  // site, so stringifying is a safe change-detector for the effect.
  const variablesKey = JSON.stringify(variables)

  useEffect(() => {
    if (!enabled) {
      setData(initialData)
      setError(null)
      setLoading(false)
      hasLoaded.current = false
      return
    }

    // First load since the last reset shows the loader; later refetches swap
    // data silently and keep the stale data visible.
    if (!hasLoaded.current) setLoading(true)
    setError(null)

    const controller = new AbortController()

    async function load() {
      try {
        const result = await gqlFetch<T>(query, variables, controller.signal)
        hasLoaded.current = true
        setData(result)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()

    return () => controller.abort()
    // `variablesKey` stands in for `variables`; `initialData` is only read in
    // the reset branch and is stable per call site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, variablesKey, enabled])

  return { data, error, loading }
}
