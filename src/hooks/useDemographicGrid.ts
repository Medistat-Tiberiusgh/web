import { useState, useEffect, useRef } from 'react'
import type { DemographicCell } from '../types'
import { gqlFetch } from '../lib/graphql'
import { DEMOGRAPHIC_GRID_QUERY } from '../lib/queries'

/**
 * Fetches the demographic grid (gender × age) for a specific year.
 * Kept separate from useDrugInsights so a year filter can be applied here
 * without limiting the full trend series used by TrendChart.
 */
export function useDemographicGrid(
  atcCode: string | null,
  region: number | null,
  year: number | null,
) {
  const [grid, setGrid] = useState<DemographicCell[]>([])
  const hasDataRef = useRef(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!atcCode) {
      setGrid([])
      hasDataRef.current = false
      setLoading(false)
      return
    }

    if (!hasDataRef.current) setLoading(true)

    const controller = new AbortController()
    const variables: Record<string, unknown> = { atcCode }
    if (region) variables.region = region
    if (year) variables.year = year

    async function load() {
      try {
        const data = await gqlFetch<{ drugInsights: { demographicGrid: DemographicCell[] } }>(
          DEMOGRAPHIC_GRID_QUERY,
          variables,
          controller.signal,
        )
        hasDataRef.current = true
        setGrid(data.drugInsights.demographicGrid)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setGrid([])
      } finally {
        setLoading(false)
      }
    }
    load()

    return () => controller.abort()
  }, [atcCode, region, year])

  return { grid, loading }
}
