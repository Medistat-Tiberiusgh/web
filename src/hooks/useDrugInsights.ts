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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!atcCode) {
      setInsights(null)
      return
    }

    setLoading(true)
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
