import DemographicHeatmap from './DemographicHeatmap'
import ChartFilterLabel from '../../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import type { DemographicCell } from '../../../types'

export default function DemographicHeatmapCard({
  year,
  regionName,
  highlightAgeBand,
  nationalData,
  regionalData,
  className
}: {
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
      <DemographicHeatmap
        data={nationalData}
        regionalData={regionalData.length > 0 ? regionalData : undefined}
        highlightAgeBand={highlightAgeBand}
      />
    </ChartCard>
  )
}
