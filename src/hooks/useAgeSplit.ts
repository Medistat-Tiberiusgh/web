import { useState, useEffect, useRef } from 'react'
import type { AgeSplitPoint } from '../types'
import { gqlFetch } from '../lib/graphql'
import { AGE_SPLIT_QUERY } from '../lib/queries'

/**
 * Fetches the full age band split for a drug, always returning all age bands.
 * Kept separate from useDrugInsights so an age band filter never collapses
 * AgeBandSparklines to a single row — the component highlights instead.
 */
export function useAgeSplit(
  atcCode: string | null,
  region: number | null,
  gender: number | null
) {
  const [ageSplit, setAgeSplit] = useState<AgeSplitPoint[]>([])
  const hasDataRef = useRef(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!atcCode) {
      setAgeSplit([])
      hasDataRef.current = false
      setLoading(false)
      return
    }

    if (!hasDataRef.current) setLoading(true)

    const controller = new AbortController()
    const variables: Record<string, unknown> = { atcCode }
    if (region) variables.region = region
    if (gender) variables.gender = gender

    async function load() {
      try {
        const data = await gqlFetch<{
          drugInsights: { ageSplit: AgeSplitPoint[] }
        }>(AGE_SPLIT_QUERY, variables, controller.signal)
        hasDataRef.current = true
        setAgeSplit(data.drugInsights.ageSplit)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setAgeSplit([])
      } finally {
        setLoading(false)
      }
    }
    load()

    return () => controller.abort()
  }, [atcCode, region, gender])

  return { ageSplit, loading }
}
