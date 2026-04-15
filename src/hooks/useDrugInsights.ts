import { useState, useEffect, useRef } from 'react'
import type { DrugInsights } from '../types'
import { gqlFetch } from '../lib/graphql'
import { DRUG_INSIGHTS_QUERY } from '../lib/queries'

export function useDrugInsights(
  atcCode: string | null,
  year: number | null,
  region: number | null
) {
  const [insights, setInsights] = useState<DrugInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Track whether we have already loaded data so we only show the skeleton on
  // the very first fetch, not on subsequent refetches (e.g. region changes).
  const hasDataRef = useRef(false)

  useEffect(() => {
    if (!atcCode) {
      setInsights(null)
      hasDataRef.current = false
      setLoading(false)
      return
    }

    if (!hasDataRef.current) setLoading(true)
    setError(null)

    const controller = new AbortController()
    const variables: Record<string, unknown> = { atcCode }
    if (year) variables.year = year
    if (region) variables.region = region

    gqlFetch<{ drugInsights: DrugInsights }>(DRUG_INSIGHTS_QUERY, variables, controller.signal)
      .then((data) => {
        hasDataRef.current = true
        setInsights(data.drugInsights)
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [atcCode, year, region])

  return { insights, loading, error }
}
