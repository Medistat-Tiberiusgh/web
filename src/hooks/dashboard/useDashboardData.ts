import { useState, useEffect } from 'react'
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

export interface DashboardFilters {
  atcCode: string | null
  region: number | null
  gender: number | null
  ageGroup: number | null
  year: number | null
}

interface DashboardResponse {
  nat: NationalInsights
  reg?: RegionalInsights
}

export function useDashboardData(filters: DashboardFilters) {
  const { atcCode, region, gender, ageGroup, year } = filters
  const [national, setNational] = useState<NationalInsights | null>(null)
  const [regional, setRegional] = useState<RegionalInsights | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!atcCode) return

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
        setNational(data.nat)
        setRegional(data.reg ?? null)
        setError(null)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setError((e as Error).message)
      }
    }
    load()

    return () => controller.abort()
  }, [atcCode, region, gender, ageGroup, year])

  return { national, regional, error }
}
