import { useState, useEffect, useRef } from 'react'
import type { DrugInsights } from '../types'
import { gqlFetch } from '../lib/graphql'
import { DRUG_INSIGHTS_QUERY } from '../lib/queries'

export function useDrugInsights(
  atcCode: string | null,
  year: number | null,
  region: number | null,
  gender: number | null = null,
  ageGroup: number | null = null
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
    if (gender) variables.gender = gender
    if (ageGroup) variables.ageGroup = ageGroup

    async function load() {
      try {
        const data = await gqlFetch<{ drugInsights: DrugInsights }>(
          DRUG_INSIGHTS_QUERY,
          variables,
          controller.signal
        )
        hasDataRef.current = true
        setInsights(data.drugInsights)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()

    return () => controller.abort()
  }, [atcCode, year, region, gender, ageGroup])

  return { insights, loading, error }
}
