import ByRegion from './ByRegion'
import ChartFilterLabel from '../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import type { RegionalStat, AgeBand } from '../../../types'

export default function ByRegionCard({
  year,
  gender,
  ageBand,
  regions,
  nationalAverage,
  selectedRegionId,
  onRegionClick,
  className
}: {
  year: number | null
  gender: string | null
  ageBand: AgeBand | null
  regions: RegionalStat[]
  nationalAverage: number | null
  selectedRegionId: number | null
  onRegionClick: (regionId: number, regionName: string) => void
  className?: string
}) {
  return (
    <ChartCard
      className={className}
      contentClassName="overflow-hidden min-h-157.5"
      title={
        <>
          By Region
          <ChartFilterLabel year={year} gender={gender} ageBand={ageBand} />
        </>
      }
      description="per 1,000 inhabitants"
    >
      <ByRegion
        regions={regions}
        nationalAverage={nationalAverage}
        selectedRegionId={selectedRegionId}
        onRegionClick={onRegionClick}
      />
    </ChartCard>
  )
}
