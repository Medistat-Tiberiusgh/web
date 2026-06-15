import type {
  AgeSplitPoint,
  DemographicCell,
  GenderSplitPoint,
  RegionalStat,
  TrendPoint
} from '../../types'
import { useGqlQuery } from '../../lib/useGqlQuery'
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

  const { data, error } = useGqlQuery<DashboardResponse | null>(
    DASHBOARD_QUERY,
    variables,
    { initialData: null, enabled: !!atcCode }
  )

  return {
    national: data?.nat ?? null,
    regional: data?.reg ?? null,
    error
  }
}
