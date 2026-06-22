import { useGqlQuery } from '../lib/useGqlQuery'
import { DATA_YEARS_QUERY } from '../lib/queries'

interface DataYearRange {
  earliest: number
  latest: number
}

/**
 * The span of years the dataset covers — a global property, not tied to any
 * drug or region. Fetched once at boot and used by the year filter and the
 * Yearly Trend label, so the range stays in sync as new years are ingested.
 */
export function useYears() {
  const { data } = useGqlQuery<{ dataYearRange: DataYearRange }>(
    DATA_YEARS_QUERY,
    {},
    { initialData: { dataYearRange: { earliest: 2006, latest: 2006 } } }
  )

  const { earliest, latest } = data.dataYearRange

  // Descending, so the dropdown shows the newest year first
  const years = Array.from({ length: latest - earliest + 1 }, (_, i) => latest - i)

  return { years, earliestYear: earliest, latestYear: latest }
}
