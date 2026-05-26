import { useState, useEffect, useRef } from 'react'
import type {
  AgeSplitPoint,
  DemographicCell,
  GenderSplitPoint,
  RegionalStat,
  TrendPoint
} from '../../types'
import { gqlFetch } from '../../lib/graphql'
import { DASHBOARD_QUERY } from '../../lib/queries'

export interface NationalInsights {
  trend: TrendPoint[]
  genderSplit: GenderSplitPoint[]
  regionalPopularity: RegionalStat[]
  ageSplit: AgeSplitPoint[]
  demographicGrid: DemographicCell[]
}

export interface RegionalInsights {
  trend: TrendPoint[]
  genderSplit: GenderSplitPoint[]
  ageSplit: AgeSplitPoint[]
  demographicGrid: DemographicCell[]
}

interface DashboardResponse {
  nat: NationalInsights
  reg?: RegionalInsights
}

export function useDashboardData(
  atcCode: string | null,
  region: number | null,
  gender: number | null,
  ageGroup: number | null,
  year: number | null
) {
  const [national, setNational] = useState<NationalInsights | null>(null)
  const [regional, setRegional] = useState<RegionalInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Only show the skeleton on the first fetch — subsequent filter changes
  // should swap data without flashing the loading state.
  const hasDataRef = useRef(false)

  useEffect(() => {
    if (!atcCode) {
      setNational(null)
      setRegional(null)
      hasDataRef.current = false
      setLoading(false)
      return
    }

    if (!hasDataRef.current) setLoading(true)
    setError(null)

    const controller = new AbortController()
    // Only forward variables that have a value — sending `null` would trigger
    // the API's validators on a non-existent id.
    const variables: Record<string, unknown> = {
      atcCode,
      hasRegion: region != null
    }
    if (region != null) variables.region = region
    if (gender != null) variables.gender = gender
    if (ageGroup != null) variables.ageGroup = ageGroup
    if (year != null) variables.year = year

    async function load() {
      try {
        const data = await gqlFetch<DashboardResponse>(
          DASHBOARD_QUERY,
          variables,
          controller.signal
        )
        hasDataRef.current = true
        setNational(data.nat)
        setRegional(data.reg ?? null)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setError((e as Error).message)
      } finally {
        setLoading(false)
      }
    }
    load()

    return () => controller.abort()
  }, [atcCode, region, gender, ageGroup, year])

  return { national, regional, loading, error }
}
