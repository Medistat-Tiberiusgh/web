import { useDrugInsights } from './useDrugInsights'

/**
 * Fetches both national and regional drug insights in one call.
 * Regional data is only fetched when a regionId is provided.
 * The loading flag reflects the national fetch (the primary one).
 */
export function useDashboardInsights(atcCode: string | null, regionId: number | null) {
  const { insights: national, loading, error } = useDrugInsights(atcCode, null, null)
  const { insights: regional } = useDrugInsights(
    regionId != null ? atcCode : null,
    null,
    regionId
  )

  return { national, regional, loading, error }
}
