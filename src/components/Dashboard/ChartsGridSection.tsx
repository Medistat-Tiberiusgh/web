import { useState } from 'react'
import { Card, Skeleton } from '@heroui/react'
import TrendChart from '../charts/TrendChart'
import AgeBandSparklines from '../charts/AgeBandSparklines'
import DemographicHeatmap from '../charts/DemographicHeatmap'
import MapView from '../charts/MapView'
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
        <Card>
          <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
            <div>
              <Card.Title>
                Dispensing Trend · 2006–2024
                <ChartFilterLabel
                  gender={db.activeGender}
                  ageBand={db.activeAgeBand}
                />
              </Card.Title>
              <Card.Description>per 1,000 inhabitants</Card.Description>
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
          </Card.Header>
          <Card.Content className="p-0">
            {db.loading ? (
              <Skeleton className="h-48 m-4 rounded" />
            ) : (
              <TrendChart
                data={db.effectiveNatTrend}
                regionalData={db.effectiveRegTrend}
                regionName={db.regionName}
                selectedYear={db.activeYear}
                onYearChange={db.setActiveYear}
              />
            )}
          </Card.Content>
        </Card>

        <Card>
          <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
            <div>
              <Card.Title>
                Age Band Trends
                <ChartFilterLabel
                  year={db.activeYear}
                  gender={db.activeGender}
                  ageBand={db.activeAgeBand}
                />
              </Card.Title>
              <Card.Description>
                per 1,000 people · bars ={' '}
                {db.activeYear ?? db.latestTrend?.year ?? '—'} · lines = 2006–
                {db.activeYear ?? db.latestTrend?.year ?? '2024'} trend
              </Card.Description>
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
          </Card.Header>
          <Card.Content className="p-0">
            {db.loading ? (
              <div className="flex flex-col gap-2 p-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 rounded" />
                ))}
              </div>
            ) : (
              <AgeBandSparklines
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
          </Card.Content>
        </Card>

        <Card>
          <Card.Header className="px-4 pt-4 pb-0">
            <Card.Title>
              Heatmap · Age &amp; Gender
              <ChartFilterLabel
                year={db.activeYear}
                regionName={db.regionName}
              />
            </Card.Title>
            <Card.Description>per 1,000 people</Card.Description>
          </Card.Header>
          <Card.Content className="p-0">
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
          </Card.Content>
        </Card>
      </div>

      {/* Right column: map + ranking */}
      <div className="flex flex-col gap-3 w-full lg:w-80 xl:w-96 lg:shrink-0">
        <Card>
          <Card.Header className="px-4 pt-4 pb-0 flex-row items-start justify-between">
            <div>
              <Card.Title>
                Dispensing Intensity Map
                <ChartFilterLabel
                  year={db.activeYear}
                  gender={db.activeGender}
                  ageBand={db.activeAgeBand}
                />
              </Card.Title>
              <Card.Description>per 1,000 inhabitants</Card.Description>
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
                  {db.user.regionId != null ? 'Less than yours' : 'Below average'}
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
                  {db.user.regionId != null ? 'More than yours' : 'Above average'}
                </span>
              </div>
            </div>
          </Card.Header>
          <Card.Content
            className="pt-3 px-0 pb-0 overflow-hidden"
            style={{ height: '630px' }}
          >
            <MapView
              regions={db.mapRegions}
              nationalAverage={db.nationalAverage}
              selectedRegionId={db.activeRegion?.id ?? null}
              hoveredRegionId={hoveredRegionId}
              onHoverRegion={setHoveredRegionId}
              onRegionClick={handleRegionClick}
            />
          </Card.Content>
        </Card>

        <Card>
          <Card.Header className="px-4 pt-4 pb-0 shrink-0">
            <Card.Title>
              Regional Ranking
              <ChartFilterLabel
                year={db.activeYear}
                gender={db.activeGender}
                ageBand={db.activeAgeBand}
              />
            </Card.Title>
            <Card.Description>
              Dispensings per 1,000 residents · descending
            </Card.Description>
          </Card.Header>
          <Card.Content className="p-0 overflow-hidden">
            <RegionalRanking
              regions={db.mapRegions}
              nationalAverage={db.nationalAverage}
              selectedRegionId={db.activeRegion?.id ?? null}
              hoveredRegionId={hoveredRegionId}
              onHoverRegion={setHoveredRegionId}
              onRegionClick={handleRegionClick}
            />
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}
