import { useState, useEffect } from 'react'
import type { DrugInsights } from '../types'
import { gqlFetch } from '../lib/graphql'
import { DRUG_INSIGHTS_QUERY } from '../lib/queries'

export function useDrugInsights(
  atcCode: string | null,
  year: number | null,
  region: number | null
) {
  const [insights, setInsights] = useState<DrugInsights | null>(null)
  // true only when fetching with no data yet (first load or deselect)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!atcCode) {
      setInsights(null)
      setLoading(false)
      return
    }

    // Only show skeleton when we have nothing to display yet
    setLoading((prev) => insights === null ? true : prev)
    setError(null)

    const variables: Record<string, unknown> = { atcCode }
    if (year) variables.year = year
    if (region) variables.region = region

    gqlFetch<{ drugInsights: DrugInsights }>(DRUG_INSIGHTS_QUERY, variables)
      .then((data) => setInsights(data.drugInsights))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [atcCode, year, region])

  return { insights, loading, error }
}
