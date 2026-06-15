import AgeBandTrends from './AgeBandTrends'
import ChartFilterLabel from '../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import { NationalRegionalLegend } from '../NationalRegionalLegend'
import type { AgeSplitPoint } from '../../../types'
import type { AgeBand } from '../../../types'

export default function AgeBandTrendsCard({
  selectedYear,
  latestTrendYear,
  gender,
  ageBand,
  regionName,
  nationalData,
  regionalData,
  className
}: {
  selectedYear: number | null
  latestTrendYear: number | null
  gender: string | null
  ageBand: AgeBand | null
  regionName: string | null
  nationalData: AgeSplitPoint[]
  regionalData: AgeSplitPoint[]
  className?: string
}) {
  const latestYear = selectedYear ?? latestTrendYear
  return (
    <ChartCard
      className={className}
      contentClassName="min-h-80"
      title={
        <>
          Age Band Trends
          <ChartFilterLabel
            year={selectedYear}
            gender={gender}
            ageBand={ageBand}
          />
        </>
      }
      description="per 1,000 people"
      legend={
        regionName ? <NationalRegionalLegend regionName={regionName} /> : undefined
      }
    >
      <AgeBandTrends
        data={nationalData}
        regionalData={regionalData.length > 0 ? regionalData : undefined}
        latestYear={latestYear}
        selectedYear={selectedYear}
        regionName={regionName}
        filterAgeBand={ageBand?.name ?? null}
      />
    </ChartCard>
  )
}
