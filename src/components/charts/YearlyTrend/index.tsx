import { Skeleton } from '@/components/ui/skeleton'
import YearlyTrend from './YearlyTrend'
import ChartFilterLabel from '../../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import { NationalRegionalLegend } from '../NationalRegionalLegend'
import type { TrendPoint } from '../../../types'
import type { AgeBand } from '../../../types'

export default function YearlyTrendCard({
  loading,
  gender,
  ageBand,
  regionName,
  nationalData,
  regionalData,
  selectedYear,
  onYearChange,
  className
}: {
  loading: boolean
  gender: string | null
  ageBand: AgeBand | null
  regionName: string | null
  nationalData: TrendPoint[]
  regionalData?: TrendPoint[]
  selectedYear: number | null
  onYearChange: (year: number | null) => void
  className?: string
}) {
  return (
    <ChartCard
      className={className}
      contentClassName="min-h-72"
      title={
        <>
          Yearly Trend · 2006–2024
          <ChartFilterLabel gender={gender} ageBand={ageBand} />
        </>
      }
      description="per 1,000 inhabitants"
      legend={<NationalRegionalLegend regionName={regionName} />}
    >
      {loading ? (
        <Skeleton className="h-48 m-4 rounded" />
      ) : (
        <YearlyTrend
          nationalData={nationalData}
          regionalData={regionalData}
          regionName={regionName}
          selectedYear={selectedYear}
          onYearChange={onYearChange}
        />
      )}
    </ChartCard>
  )
}
