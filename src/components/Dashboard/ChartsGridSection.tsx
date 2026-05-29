import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import DispensingTrend from '../charts/DispensingTrend'
import AgeBandTrends from '../charts/AgeBandTrends'
import DemographicHeatmap from '../charts/DemographicHeatmap'
import DispensingIntensityMap from '../charts/DispensingIntensityMap'
import RegionalRanking from '../charts/RegionalRanking'
import ChartFilterLabel from '../ChartFilterLabel'
import type { useDashboard } from '../../hooks/dashboard/useDashboard'

type Db = ReturnType<typeof useDashboard>

export default function ChartsGridSection({ db }: { db: Db }) {
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)

  function handleRegionClick(regionId: number, regionName: string) {
    if (db.activeRegion?.id === regionId) db.setActiveRegion(null)
    else db.setActiveRegion({ id: regionId, regionName })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      {/* Left column */}
      <div className="flex-1 min-w-0 flex flex-col gap-3">
        <Card className="py-0 gap-0">
          <CardHeader className="flex flex-row items-start justify-between px-4 pt-4 pb-0">
            <div>
              <CardTitle>
                Dispensing Trend · 2006–2024
                <ChartFilterLabel
                  gender={db.activeGender}
                  ageBand={db.activeAgeBand}
                />
              </CardTitle>
              <CardDescription>per 1,000 inhabitants</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
              {db.regionName && (
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-1.5 rounded-full bg-teal-600 inline-block" />
                  {db.regionName}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <span className="w-4 h-1.5 rounded-full bg-blue-700 inline-block" />
                National
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-65">
            {db.loading ? (
              <Skeleton className="h-48 m-4 rounded" />
            ) : (
              <DispensingTrend
                nationalData={db.effectiveNatTrend}
                regionalData={db.effectiveRegTrend}
                regionName={db.regionName}
                selectedYear={db.activeYear}
                onYearChange={db.setActiveYear}
              />
            )}
          </CardContent>
        </Card>

        <Card className="py-0 gap-0">
          <CardHeader className="flex flex-row items-start justify-between px-4 pt-4 pb-0">
            <div>
              <CardTitle>
                Age Band Trends
                <ChartFilterLabel
                  year={db.activeYear}
                  gender={db.activeGender}
                  ageBand={db.activeAgeBand}
                />
              </CardTitle>
              <CardDescription>
                per 1,000 people · bars ={' '}
                {db.activeYear ?? db.latestTrend?.year ?? '—'} · lines = 2006–
                {db.activeYear ?? db.latestTrend?.year ?? '2024'} trend
              </CardDescription>
            </div>
            {db.regionName && (
              <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-1.5 rounded-full bg-teal-600 inline-block" />
                  {db.regionName}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-4 h-1.5 rounded-full bg-blue-700 inline-block" />
                  National
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {db.loading ? (
              <div className="flex flex-col gap-2 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 rounded" />
                ))}
              </div>
            ) : (
              <AgeBandTrends
                data={db.natAgeSplit}
                regionalData={
                  db.regAgeSplit.length > 0 ? db.regAgeSplit : undefined
                }
                latestYear={db.activeYear ?? db.latestTrend?.year ?? null}
                selectedYear={db.activeYear}
                regionName={db.regionName}
                filterAgeBand={db.activeAgeBand?.name ?? null}
              />
            )}
          </CardContent>
        </Card>

        <Card className="py-0 gap-0">
          <CardHeader className="px-4 pt-4 pb-0">
            <CardTitle>
              Demographic Heatmap
              <ChartFilterLabel
                year={db.activeYear}
                regionName={db.regionName}
              />
            </CardTitle>
            <CardDescription>per 1,000 people</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {db.loading ? (
              <div className="grid grid-cols-3 gap-1 p-4">
                {Array.from({ length: 54 }).map((_, i) => (
                  <Skeleton key={i} className="h-5 rounded" />
                ))}
              </div>
            ) : (
              <DemographicHeatmap
                data={db.filteredNatGrid}
                regionalData={
                  db.filteredRegGrid.length > 0 ? db.filteredRegGrid : undefined
                }
                regionName={db.regionName}
                filterGender={db.activeGender}
                highlightAgeBand={db.activeAgeBand?.id ?? null}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right column: map + ranking */}
      <div className="flex flex-col gap-3 w-full lg:w-80 xl:w-96 lg:shrink-0">
        <Card className="py-0 gap-0">
          <CardHeader className="px-4 pt-4 pb-0 flex flex-row items-start justify-between">
            <div>
              <CardTitle>
                Dispensing Intensity Map
                <ChartFilterLabel
                  year={db.activeYear}
                  gender={db.activeGender}
                  ageBand={db.activeAgeBand}
                />
              </CardTitle>
              <CardDescription>per 1,000 inhabitants</CardDescription>
            </div>
            <div className="flex flex-col items-start gap-1 pt-0.5 shrink-0 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div
                  className="h-1.5 w-16 rounded-full shrink-0"
                  style={{
                    background: 'linear-gradient(to right, #f1f5f9, #475569)'
                  }}
                />
                <span className="text-slate-600 whitespace-nowrap">
                  {db.user?.regionId != null ? 'Less than yours' : 'Below average'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="h-1.5 w-16 rounded-full shrink-0"
                  style={{
                    background: 'linear-gradient(to right, #fed7aa, #c2410c)'
                  }}
                />
                <span className="text-orange-700 whitespace-nowrap">
                  {db.user?.regionId != null ? 'More than yours' : 'Above average'}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent
            className="pt-3 px-0 pb-0 overflow-hidden"
            style={{ height: '630px' }}
          >
            <DispensingIntensityMap
              regions={db.mapRegions}
              nationalAverage={db.nationalAverage}
              selectedRegionId={db.activeRegion?.id ?? null}
              hoveredRegionId={hoveredRegionId}
              onHoverRegion={setHoveredRegionId}
              onRegionClick={handleRegionClick}
            />
          </CardContent>
        </Card>

        <Card className="py-0 gap-0">
          <CardHeader className="px-4 pt-4 pb-0 shrink-0">
            <CardTitle>
              Regional Ranking
              <ChartFilterLabel
                year={db.activeYear}
                gender={db.activeGender}
                ageBand={db.activeAgeBand}
              />
            </CardTitle>
            <CardDescription>
              Dispensings per 1,000 residents · descending
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <RegionalRanking
              regions={db.mapRegions}
              nationalAverage={db.nationalAverage}
              selectedRegionId={db.activeRegion?.id ?? null}
              hoveredRegionId={hoveredRegionId}
              onHoverRegion={setHoveredRegionId}
              onRegionClick={handleRegionClick}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
