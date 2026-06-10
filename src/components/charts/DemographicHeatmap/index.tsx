import { Skeleton } from '@/components/ui/skeleton'
import DemographicHeatmap from './DemographicHeatmap'
import ChartFilterLabel from '../../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import type { DemographicCell } from '../../../types'

export default function DemographicHeatmapCard({
  loading,
  year,
  regionName,
  highlightAgeBand,
  nationalData,
  regionalData,
  className
}: {
  loading: boolean
  year: number | null
  regionName: string | null
  highlightAgeBand: number | null
  nationalData: DemographicCell[]
  regionalData: DemographicCell[]
  className?: string
}) {
  return (
    <ChartCard
      className={className}
      contentClassName="min-h-80"
      title={
        <>
          Demographic Heatmap
          <ChartFilterLabel year={year} regionName={regionName} />
        </>
      }
      description="per 1,000 people"
    >
      {loading ? (
        <div className="grid grid-cols-3 gap-1 p-4">
          {Array.from({ length: 54 }).map((_, index) => (
            <Skeleton key={index} className="h-5 rounded" />
          ))}
        </div>
      ) : (
        <DemographicHeatmap
          data={nationalData}
          regionalData={regionalData.length > 0 ? regionalData : undefined}
          highlightAgeBand={highlightAgeBand}
        />
      )}
    </ChartCard>
  )
}
