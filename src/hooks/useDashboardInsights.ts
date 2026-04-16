import { useDrugInsights } from './useDrugInsights'

/**
 * Fetches both national and regional drug insights in one call.
 * Regional data is only fetched when a regionId is provided.
 * Demographic filters (genderId, ageBandId) are passed to the API — the server
 * applies them selectively: only `trend` and `regionalPopularity` are filtered,
 * while `genderSplit`, `ageSplit`, and `demographicGrid` always return full data.
 * The loading flag reflects the national fetch (the primary one).
 */
export function useDashboardInsights(
  atcCode: string | null,
  regionId: number | null,
  genderId: number | null,
  ageBandId: number | null,
) {
  const { insights: national, loading, error } = useDrugInsights(atcCode, null, null, genderId, ageBandId)
  const { insights: regional } = useDrugInsights(
    regionId != null ? atcCode : null,
    null,
    regionId,
    genderId,
    ageBandId,
  )

  return { national, regional, loading, error }
}
