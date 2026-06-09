import YearlyTrendCard from '../charts/YearlyTrend'
import DrugCard from '../DrugCard'
import AgeBandTrendsCard from '../charts/AgeBandTrends'
import DemographicHeatmapCard from '../charts/DemographicHeatmap'
import GenderGapCard from '../charts/GenderGap'
import ByRegionCard from '../charts/ByRegion'
import type { Db } from '../../hooks/dashboard/useDashboard'

export default function ChartsSection({ db }: { db: Db }) {
  return (
    <div className="grid grid-cols-12 gap-3">
      <YearlyTrendCard db={db} className="col-span-8" />
      <DrugCard db={db} className="col-span-4" />
      <AgeBandTrendsCard db={db} className="col-span-4" />
      <DemographicHeatmapCard db={db} className="col-span-4" />
      <GenderGapCard db={db} className="col-span-4" />
      <ByRegionCard db={db} className="col-span-12" />
    </div>
  )
}
