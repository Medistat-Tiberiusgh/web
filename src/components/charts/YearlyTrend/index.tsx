import { Skeleton } from '@/components/ui/skeleton'
import YearlyTrend from './YearlyTrend'
import ChartFilterLabel from '../../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import { NationalRegionalLegend } from '../NationalRegionalLegend'
import type { Db } from '../../../hooks/dashboard/useDashboard'

export default function YearlyTrendCard({
  db,
  className
}: {
  db: Db
  className?: string
}) {
  return (
    <ChartCard
      className={className}
      contentClassName="min-h-72"
      title={
        <>
          Yearly Trend · 2006–2024
          <ChartFilterLabel gender={db.activeGender} ageBand={db.activeAgeBand} />
        </>
      }
      description="per 1,000 inhabitants"
      legend={<NationalRegionalLegend regionName={db.regionName} />}
    >
      {db.loading ? (
        <Skeleton className="h-48 m-4 rounded" />
      ) : (
        <YearlyTrend
          nationalData={db.effectiveNatTrend}
          regionalData={db.effectiveRegTrend}
          regionName={db.regionName}
          selectedYear={db.activeYear}
          onYearChange={db.setActiveYear}
        />
      )}
    </ChartCard>
  )
}
