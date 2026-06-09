import ByRegion from './ByRegion'
import ChartFilterLabel from '../../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import type { Db } from '../../../hooks/dashboard/useDashboard'

export default function ByRegionCard({
  db,
  className
}: {
  db: Db
  className?: string
}) {
  function handleRegionClick(regionId: number, regionName: string) {
    if (db.activeRegion?.id === regionId) db.setActiveRegion(null)
    else db.setActiveRegion({ id: regionId, regionName })
  }
  return (
    <ChartCard
      className={className}
      contentClassName="overflow-hidden min-h-157.5"
      title={
        <>
          By Region
          <ChartFilterLabel
            year={db.activeYear}
            gender={db.activeGender}
            ageBand={db.activeAgeBand}
          />
        </>
      }
      description="per 1,000 inhabitants"
    >
      <ByRegion
        regions={db.mapRegions}
        nationalAverage={db.nationalAverage}
        selectedRegionId={db.activeRegion?.id ?? null}
        onRegionClick={handleRegionClick}
      />
    </ChartCard>
  )
}
