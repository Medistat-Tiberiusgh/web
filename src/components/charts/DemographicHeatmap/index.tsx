import { Skeleton } from '@/components/ui/skeleton'
import DemographicHeatmap from './DemographicHeatmap'
import ChartFilterLabel from '../../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import type { Db } from '../../../hooks/dashboard/useDashboard'

export default function DemographicHeatmapCard({
  db,
  className
}: {
  db: Db
  className?: string
}) {
  return (
    <ChartCard
      className={className}
      contentClassName="min-h-80"
      title={
        <>
          Demographic Heatmap
          <ChartFilterLabel year={db.activeYear} regionName={db.regionName} />
        </>
      }
      description="per 1,000 people"
    >
      {db.loading ? (
        <div className="grid grid-cols-3 gap-1 p-4">
          {Array.from({ length: 54 }).map((_, index) => (
            <Skeleton key={index} className="h-5 rounded" />
          ))}
        </div>
      ) : (
        <DemographicHeatmap
          data={db.nationalGrid}
          regionalData={
            db.regionalGrid.length > 0 ? db.regionalGrid : undefined
          }
          highlightAgeBand={db.activeAgeBand?.id ?? null}
        />
      )}
    </ChartCard>
  )
}
