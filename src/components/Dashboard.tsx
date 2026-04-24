import { Card, Skeleton } from '@heroui/react'
import AppNavbar from './AppNavbar'
import MedicationList from './MedicationList'
import TrendChart from './charts/TrendChart'
import AgeBandSparklines from './charts/AgeBandSparklines'
import DemographicHeatmap from './charts/DemographicHeatmap'
import GenderGapChart from './charts/GenderGapChart'
import MapView from './charts/MapView'
import RegionalRanking from './charts/RegionalRanking'
import KpiCard from './KpiCard'
import DrugInfoCard from './DrugInfoCard'
import ChartFilterLabel from './ChartFilterLabel'
import { useDashboard } from '../hooks/useDashboard'
import { fmtPer1000, fmtPer1000Delta, fmtDelta } from '../lib/format'

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const db = useDashboard()

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppNavbar
        onLogout={onLogout}
        activeDrug={db.activeDrug}
        activeRegion={db.activeRegion}
        activeYear={db.activeYear}
        activeGender={db.activeGender}
        activeAgeBand={db.activeAgeBand}
        availableAgeBands={db.availableAgeBands}
        savedAtcCodes={new Set(db.medications.map((m) => m.drugData.atcCode))}
        onDrugChange={db.setActiveDrug}
        onRegionChange={db.setActiveRegion}
        onYearChange={db.setActiveYear}
        onGenderChange={db.setActiveGender}
        onAgeBandChange={db.setActiveAgeBand}
        onSaveDrug={(drug) => db.addMedication(drug.atcCode)}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
          <MedicationList
            medications={db.medications}
            loading={db.medsLoading}
            activeDrugAtcCode={db.activeDrug?.atcCode ?? null}
            onSelect={db.setActiveDrug}
            onRemove={db.removeMedication}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-w-screen-2xl mx-auto w-full">
          {/* ── KPI cards ─────────────────────────────────────────────── */}
          {db.loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <Card.Content className="p-4 flex flex-col gap-2">
                    <Skeleton className="h-3 w-1/3 rounded" />
                    <Skeleton className="h-8 w-1/2 rounded" />
                    <Skeleton className="h-3 w-2/3 rounded" />
                  </Card.Content>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <KpiCard
                label={`Total Patients${db.regionName ? ` · ${db.regionName}` : ''}`}
                value={
                  db.latestTrend
                    ? db.latestTrend.totalPatients.toLocaleString()
                    : '—'
                }
                delta={
                  db.patientsPct != null
                    ? {
                        value: fmtDelta(db.patientsPct, '%'),
                        subLabel: db.prevTrend
                          ? `(${db.prevTrend.totalPatients.toLocaleString()})`
                          : undefined
                      }
                    : undefined
                }
                nationalDelta={null}
                info={
                  <>
                    <p>
                      Number of unique patients who received at least one
                      dispensing for this drug
                      {db.latestTrend ? ` in ${db.latestTrend.year}` : ''}.
                    </p>
                    <p className="mt-2">
                      National total:{' '}
                      {db.natLatest
                        ? db.natLatest.totalPatients.toLocaleString()
                        : '—'}{' '}
                      patients.
                    </p>
                    {db.regLatest && (
                      <p className="mt-2">
                        Total dispensings in {db.regionName ?? 'your region'} (
                        {db.regLatest.year}):{' '}
                        {db.regLatest.totalPrescriptions.toLocaleString()}.
                      </p>
                    )}
                  </>
                }
              />

              <KpiCard
                label={`Dispensings per 1,000 ${db.demographicLabel ?? 'Inhabitants'}${db.regionName ? ` · ${db.regionName}` : ''}`}
                value={
                  db.latestTrend ? fmtPer1000(db.latestTrend.per1000) : '—'
                }
                delta={
                  db.per1000Diff != null
                    ? {
                        value: fmtPer1000Delta(db.per1000Diff),
                        subLabel: db.prevTrend
                          ? `(${fmtPer1000(db.prevTrend.per1000)})`
                          : undefined
                      }
                    : undefined
                }
                nationalDelta={
                  db.per1000DeltaVsNat != null && db.natLatest
                    ? {
                        value: fmtDelta(db.per1000DeltaVsNat, '%'),
                        pct: db.per1000DeltaVsNat,
                        avgLabel: fmtPer1000(db.natLatest.per1000)
                      }
                    : null
                }
                info={
                  db.demographicLabel
                    ? `Dispensings per 1,000 ${db.demographicLabel}. The API filters the data for this demographic.`
                    : `Dispensings per 1,000 inhabitants in ${db.regionName ?? 'your region'}. National average: ${db.natLatest ? fmtPer1000(db.natLatest.per1000) : '—'}.`
                }
              />

              <KpiCard
                label={`Chronic Use Ratio${db.regionName ? ` · ${db.regionName}` : ''}`}
                value={
                  db.chronicUseRatio != null
                    ? `${db.chronicUseRatio.toFixed(2)}x`
                    : '—'
                }
                delta={
                  db.ratioDiff != null && db.prevTrend != null
                    ? {
                        value: fmtDelta(db.ratioDiff, 'x', 2),
                        subLabel: `(${(db.prevTrend.totalPrescriptions / db.prevTrend.totalPatients).toFixed(2)}x)`
                      }
                    : undefined
                }
                nationalDelta={
                  db.ratioDeltaVsNat != null && db.natChronicRatio != null
                    ? {
                        value: fmtDelta(db.ratioDeltaVsNat, '%'),
                        pct: db.ratioDeltaVsNat,
                        avgLabel: `${db.natChronicRatio.toFixed(2)}x`
                      }
                    : null
                }
                info="Total dispensings divided by total patients. A value above 1 means patients dispensed the drug more than once on average, typical for chronic conditions."
              />
            </div>
          )}

          {!db.activeDrug ? (
            <Card>
              <Card.Content className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Select a medication from the sidebar or search bar to explore
                dispensing data
              </Card.Content>
            </Card>
          ) : (
            <>
              {/* ── Charts: trends, age, heatmap, map ─────────────────── */}
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
                        <Card.Description>
                          per 1,000 inhabitants
                        </Card.Description>
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
                          {db.activeYear ?? db.latestTrend?.year ?? '—'} · lines
                          = 2006–
                          {db.activeYear ?? db.latestTrend?.year ?? '2024'}{' '}
                          trend
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
                            db.regAgeSplit.length > 0
                              ? db.regAgeSplit
                              : undefined
                          }
                          latestYear={
                            db.activeYear ?? db.latestTrend?.year ?? null
                          }
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
                            db.filteredRegGrid.length > 0
                              ? db.filteredRegGrid
                              : undefined
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
                        <Card.Description>
                          per 1,000 inhabitants
                        </Card.Description>
                      </div>
                      <div className="flex flex-col items-start gap-1 pt-0.5 shrink-0 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-1.5 w-16 rounded-full shrink-0"
                            style={{
                              background:
                                'linear-gradient(to right, #f1f5f9, #475569)'
                            }}
                          />
                          <span className="text-slate-600 whitespace-nowrap">
                            {db.user.regionId != null
                              ? 'Less than yours'
                              : 'Below average'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-1.5 w-16 rounded-full shrink-0"
                            style={{
                              background:
                                'linear-gradient(to right, #fed7aa, #c2410c)'
                            }}
                          />
                          <span className="text-orange-700 whitespace-nowrap">
                            {db.user.regionId != null
                              ? 'More than yours'
                              : 'Above average'}
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
                        selectedRegionId={db.activeRegion?.id ?? null}
                        hoveredRegionId={db.hoveredRegionId}
                        onHoverRegion={db.setHoveredRegionId}
                        onRegionClick={db.handleRegionClick}
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
                        selectedRegionId={db.activeRegion?.id ?? null}
                        hoveredRegionId={db.hoveredRegionId}
                        onHoverRegion={db.setHoveredRegionId}
                        onRegionClick={db.handleRegionClick}
                      />
                    </Card.Content>
                  </Card>
                </div>
              </div>

              {/* ── Gender gap + drug profile ──────────────────────────── */}
              <div className="flex gap-3 items-start">
                <div
                  ref={db.chartCardRef}
                  style={{ width: '560px' }}
                  className="shrink-0"
                >
                  <Card>
                    <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
                      <div>
                        <Card.Title>
                          Patient Gender Gap
                          <ChartFilterLabel
                            regionName={db.regionName}
                            ageBand={db.activeAgeBand}
                          />
                        </Card.Title>
                        <Card.Description>
                          per 1,000 inhabitants · all years
                        </Card.Description>
                      </div>
                    </Card.Header>
                    <Card.Content className="p-0">
                      {db.loading ? (
                        <Skeleton className="h-48 m-4 rounded" />
                      ) : (
                        <GenderGapChart
                          data={db.natGenderSplit}
                          regionalData={db.regGenderSplit}
                          regionName={db.regionName}
                          filterGender={db.activeGender}
                          selectedYear={db.activeYear}
                        />
                      )}
                    </Card.Content>
                  </Card>
                </div>

                <div className="flex-1" style={{ height: db.chartCardHeight }}>
                  <DrugInfoCard
                    atcCode={db.activeDrug.atcCode}
                    drugName={db.activeDrug.name}
                    narcoticClass={db.activeDrug.narcoticClass}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
