import YearlyTrendCard from '../charts/YearlyTrend'
import DrugCard from '../drug/DrugCard'
import AgeBandTrendsCard from '../charts/AgeBandTrends'
import DemographicHeatmapCard from '../charts/DemographicHeatmap'
import GenderGapCard from '../charts/GenderGap'
import ByRegionCard from '../charts/ByRegion'
import type { Db } from '../../hooks/dashboard/useDashboard'

export default function ChartsSection({ db }: { db: Db }) {
  function handleRegionClick(regionId: number, regionName: string) {
    if (db.activeRegion?.id === regionId) db.setActiveRegion(null)
    else db.setActiveRegion({ id: regionId, regionName })
  }

  return (
    <div className="grid grid-cols-12 gap-3">
      <YearlyTrendCard
        className="col-span-8"
        gender={db.activeGender}
        ageBand={db.activeAgeBand}
        regionName={db.regionName}
        nationalData={db.effectiveNationalTrend}
        regionalData={db.effectiveRegionalTrend}
        selectedYear={db.activeYear}
        onYearChange={db.setActiveYear}
        earliestYear={db.earliestYear}
        latestYear={db.latestYear}
      />

      <DrugCard className="col-span-4" drug={db.activeDrug!} />

      <AgeBandTrendsCard
        className="col-span-4"
        selectedYear={db.activeYear}
        latestTrendYear={db.latestTrend?.year ?? null}
        gender={db.activeGender}
        ageBand={db.activeAgeBand}
        regionName={db.regionName}
        nationalData={db.nationalAgeSplit}
        regionalData={db.regionalAgeSplit}
      />

      <DemographicHeatmapCard
        className="col-span-4"
        year={db.activeYear}
        regionName={db.regionName}
        highlightAgeBand={db.activeAgeBand?.id ?? null}
        nationalData={db.nationalGrid}
        regionalData={db.regionalGrid}
      />

      <GenderGapCard
        className="col-span-4"
        regionName={db.regionName}
        ageBand={db.activeAgeBand}
        nationalData={db.nationalGenderSplit}
        regionalData={db.regionalGenderSplit}
      />

      <ByRegionCard
        className="col-span-12"
        year={db.activeYear}
        gender={db.activeGender}
        ageBand={db.activeAgeBand}
        regions={db.mapRegions}
        nationalAverage={db.nationalAverage}
        selectedRegionId={db.activeRegion?.id ?? null}
        onRegionClick={handleRegionClick}
      />
    </div>
  )
}
