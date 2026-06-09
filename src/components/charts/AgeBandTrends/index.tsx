import { Skeleton } from '@/components/ui/skeleton'
import AgeBandTrends from './AgeBandTrends'
import ChartFilterLabel from '../../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import { NationalRegionalLegend } from '../NationalRegionalLegend'
import type { Db } from '../../../hooks/dashboard/useDashboard'

export default function AgeBandTrendsCard({
  db,
  className
}: {
  db: Db
  className?: string
}) {
  const latestYear = db.activeYear ?? db.latestTrend?.year ?? null
  return (
    <ChartCard
      className={className}
      contentClassName="min-h-80"
      title={
        <>
          Age Band Trends
          <ChartFilterLabel
            year={db.activeYear}
            gender={db.activeGender}
            ageBand={db.activeAgeBand}
          />
        </>
      }
      description="per 1,000 people"
      legend={
        db.regionName ? <NationalRegionalLegend regionName={db.regionName} /> : undefined
      }
    >
      {db.loading ? (
        <div className="flex flex-col gap-2 p-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-7 rounded" />
          ))}
        </div>
      ) : (
        <AgeBandTrends
          data={db.natAgeSplit}
          regionalData={db.regAgeSplit.length > 0 ? db.regAgeSplit : undefined}
          latestYear={latestYear}
          selectedYear={db.activeYear}
          regionName={db.regionName}
          filterAgeBand={db.activeAgeBand?.name ?? null}
        />
      )}
    </ChartCard>
  )
}
