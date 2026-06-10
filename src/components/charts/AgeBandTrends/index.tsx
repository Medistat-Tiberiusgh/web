import { Skeleton } from '@/components/ui/skeleton'
import AgeBandTrends from './AgeBandTrends'
import ChartFilterLabel from '../../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import { NationalRegionalLegend } from '../NationalRegionalLegend'
import type { AgeSplitPoint } from '../../../types'
import type { AgeBand } from '../../../types'

export default function AgeBandTrendsCard({
  loading,
  selectedYear,
  latestTrendYear,
  gender,
  ageBand,
  regionName,
  nationalData,
  regionalData,
  className
}: {
  loading: boolean
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
      {loading ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-7 rounded" />
          ))}
        </div>
      ) : (
        <AgeBandTrends
          data={nationalData}
          regionalData={regionalData.length > 0 ? regionalData : undefined}
          latestYear={latestYear}
          selectedYear={selectedYear}
          regionName={regionName}
          filterAgeBand={ageBand?.name ?? null}
        />
      )}
    </ChartCard>
  )
}
