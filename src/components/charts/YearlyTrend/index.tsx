import YearlyTrend from './YearlyTrend'
import ChartFilterLabel from '../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import { NationalRegionalLegend } from '../NationalRegionalLegend'
import type { TrendPoint } from '../../../types'
import type { AgeBand } from '../../../types'

export default function YearlyTrendCard({
  gender,
  ageBand,
  regionName,
  nationalData,
  regionalData,
  selectedYear,
  onYearChange,
  earliestYear,
  latestYear,
  className
}: {
  gender: string | null
  ageBand: AgeBand | null
  regionName: string | null
  nationalData: TrendPoint[]
  regionalData?: TrendPoint[]
  selectedYear: number | null
  onYearChange: (year: number | null) => void
  earliestYear: number
  latestYear: number
  className?: string
}) {
  return (
    <ChartCard
      className={className}
      contentClassName="min-h-72"
      title={
        <>
          Yearly Trend · {earliestYear}–{latestYear}
          <ChartFilterLabel gender={gender} ageBand={ageBand} />
        </>
      }
      description="per 1,000 inhabitants"
      legend={<NationalRegionalLegend regionName={regionName} />}
    >
      <YearlyTrend
        nationalData={nationalData}
        regionalData={regionalData}
        regionName={regionName}
        selectedYear={selectedYear}
        onYearChange={onYearChange}
      />
    </ChartCard>
  )
}
