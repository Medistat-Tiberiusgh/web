import { useState } from 'react'
import { Card, Skeleton } from '@heroui/react'
import AppNavbar from './components/AppNavbar'
import KpiCard from './components/KpiCard'
import TrendChart from './components/TrendChart'
import MapView from './components/MapView'
import RegionalRanking from './components/RegionalRanking'
import GenderGapChart from './components/GenderGapChart'
import AgeBandChart from './components/AgeBandChart'
import MedicationList from './components/MedicationList'
import { useMedications } from './hooks/useMedications'
import { useDrugInsights } from './hooks/useDrugInsights'
import { UserContext } from './context/UserContext'
import { mockUser } from './mock/user'
import type { User } from './context/UserContext'

// Formats a number to 1 decimal place with sign, avoiding "-0.0"
function fmtDelta1(n: number, suffix = '') {
  const v = parseFloat(n.toFixed(1))
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}${suffix}`
}

export default function App() {
  const [user] = useState<User>(mockUser)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const { medications, loading: medsLoading } = useMedications()

  const selectedMed = selectedIndex !== null ? medications[selectedIndex] : null
  const { insights: nationalInsights, loading: insightsLoading } =
    useDrugInsights(selectedMed?.drugData?.atcCode ?? null, null, null)
  const { insights: regionalInsights } = useDrugInsights(
    selectedMed?.drugData?.atcCode ?? null,
    null,
    user.regionId
  )

  // National trend points
  const natLatest =
    (nationalInsights?.trend.at(-1)?.totalPatients ?? 0) > 0
      ? nationalInsights!.trend.at(-1)!
      : null
  // Regional trend points
  const regLatest =
    (regionalInsights?.trend.at(-1)?.totalPatients ?? 0) > 0
      ? regionalInsights!.trend.at(-1)!
      : null
  const regPrev =
    (regionalInsights?.trend.at(-2)?.totalPatients ?? 0) > 0
      ? regionalInsights!.trend.at(-2)!
      : null

  // Use regional as headline where available, fall back to national
  const latestTrend = regLatest ?? natLatest

  const chronicUseRatio =
    latestTrend && latestTrend.totalPatients > 0
      ? latestTrend.totalPrescriptions / latestTrend.totalPatients
      : null

  // YoY deltas (regional)
  const patientsPct =
    regLatest && regPrev && regPrev.totalPatients > 0
      ? ((regLatest.totalPatients - regPrev.totalPatients) /
          regPrev.totalPatients) *
        100
      : null
  const per1000Diff =
    regLatest && regPrev ? regLatest.per1000 - regPrev.per1000 : null
  const ratioDiff =
    chronicUseRatio != null && regPrev && regPrev.totalPatients > 0
      ? chronicUseRatio - regPrev.totalPrescriptions / regPrev.totalPatients
      : null

  // National-vs-regional deltas
  const natChronicRatio =
    natLatest && natLatest.totalPatients > 0
      ? natLatest.totalPrescriptions / natLatest.totalPatients
      : null

  const per1000DeltaVsNat =
    regLatest && natLatest
      ? ((regLatest.per1000 - natLatest.per1000) / natLatest.per1000) * 100
      : null
  const ratioDeltaVsNat =
    chronicUseRatio != null && natChronicRatio != null && natChronicRatio > 0
      ? ((chronicUseRatio - natChronicRatio) / natChronicRatio) * 100
      : null

  // Region name from the national regional popularity list
  const regionName =
    nationalInsights?.regionalPopularity.find(
      (r) => r.regionId === user.regionId
    )?.regionName ?? null

  const regions = nationalInsights?.regionalPopularity ?? []

  return (
    <UserContext.Provider value={user}>
      <div className="h-screen flex flex-col bg-gray-50">
        <AppNavbar />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar: My Medications */}
          <aside className="w-72 border-r border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
            <MedicationList
              medications={medications}
              loading={medsLoading}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
            />
          </aside>

          {/* Main dashboard */}
          <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-w-screen-2xl mx-auto w-full">
            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {insightsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <Card.Content className="p-4 flex flex-col gap-2">
                      <Skeleton className="h-3 w-1/3 rounded" />
                      <Skeleton className="h-8 w-1/2 rounded" />
                      <Skeleton className="h-3 w-2/3 rounded" />
                    </Card.Content>
                  </Card>
                ))
              ) : (
                <>
                  <KpiCard
                    label={`Total Patients${regionName ? ` · ${regionName}` : ''}`}
                    value={
                      regLatest ? regLatest.totalPatients.toLocaleString() : '—'
                    }
                    delta={
                      patientsPct != null
                        ? {
                            value: fmtDelta1(patientsPct, '%'),
                            subLabel:
                              regPrev != null
                                ? `(${regPrev.totalPatients.toLocaleString()})`
                                : undefined
                          }
                        : undefined
                    }
                    nationalDelta={(() => {
                      if (!natLatest || !regLatest) return null
                      const natAvgPerRegion = natLatest.totalPatients / 21
                      const pct =
                        ((regLatest.totalPatients - natAvgPerRegion) /
                          natAvgPerRegion) *
                        100
                      return {
                        value: fmtDelta1(pct, '%'),
                        pct,
                        avgLabel: Math.round(natAvgPerRegion).toLocaleString()
                      }
                    })()}
                    info={
                      <>
                        <p>
                          Number of unique patients who received at least one
                          dispensing for this drug in the most recent year of
                          available data
                          {regLatest ? ` (${regLatest.year})` : ''}.
                        </p>
                        <p className="mt-2">
                          National total:{' '}
                          {natLatest
                            ? natLatest.totalPatients.toLocaleString()
                            : '—'}{' '}
                          patients.
                        </p>
                        <p className="mt-2">
                          Total dispensings in {regionName ?? 'your region'}
                          {regLatest ? ` (${regLatest.year})` : ''}:{' '}
                          {regLatest
                            ? regLatest.totalPrescriptions.toLocaleString()
                            : '—'}
                          .
                        </p>
                      </>
                    }
                  />
                  <KpiCard
                    label={`Dispensings per 1,000 Inhabitants${regionName ? ` · ${regionName}` : ''}`}
                    value={regLatest ? regLatest.per1000.toFixed(1) : '—'}
                    delta={
                      per1000Diff != null
                        ? {
                            value: fmtDelta1(per1000Diff),
                            subLabel:
                              regPrev != null
                                ? `(${regPrev.per1000.toFixed(1)})`
                                : undefined
                          }
                        : undefined
                    }
                    nationalDelta={
                      per1000DeltaVsNat != null && natLatest
                        ? {
                            value: fmtDelta1(per1000DeltaVsNat, '%'),
                            pct: per1000DeltaVsNat,
                            avgLabel: natLatest.per1000.toFixed(1)
                          }
                        : null
                    }
                    info={`Dispensings per 1,000 inhabitants in ${regionName ?? 'your region'}. The national average is ${natLatest ? natLatest.per1000.toFixed(1) : '—'}.`}
                  />
                  <KpiCard
                    label={`Chronic Use Ratio${regionName ? ` · ${regionName}` : ''}`}
                    value={
                      chronicUseRatio != null
                        ? `${chronicUseRatio.toFixed(2)}x`
                        : '—'
                    }
                    delta={
                      ratioDiff != null && regPrev != null
                        ? {
                            value: `${fmtDelta1(ratioDiff)}x`,
                            subLabel: `(${(regPrev.totalPrescriptions / regPrev.totalPatients).toFixed(2)}x)`
                          }
                        : undefined
                    }
                    nationalDelta={
                      ratioDeltaVsNat != null && natChronicRatio != null
                        ? {
                            value: fmtDelta1(ratioDeltaVsNat, '%'),
                            pct: ratioDeltaVsNat,
                            avgLabel: `${natChronicRatio.toFixed(2)}x`
                          }
                        : null
                    }
                    info="Total dispensings divided by total patients. A value above 1 means patients dispensed the drug more than once on average, which is typical for chronic or recurring conditions."
                  />
                </>
              )}
            </div>

            {/* Charts — only shown when a drug is selected */}
            {!selectedMed ? (
              <Card>
                <Card.Content className="flex items-center justify-center h-64 text-gray-400 text-sm">
                  Select a medication from the sidebar to explore dispensing
                  data
                </Card.Content>
              </Card>
            ) : (
              <>
                <div className="flex flex-col lg:flex-row gap-3">
                  {/* Left column: trend chart + age band + gender gap */}
                  <div className="flex-1 min-w-0 flex flex-col gap-3">
                    <Card>
                      <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
                        <div>
                          <Card.Title>Dispensing Trend · 2006–2024</Card.Title>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                          {regionName && (
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-1.5 rounded-full bg-teal-500 inline-block" />
                              {regionName}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-1.5 rounded-full bg-blue-700 inline-block" />
                            National
                          </span>
                        </div>
                      </Card.Header>
                      <Card.Content className="p-0">
                        {insightsLoading ? (
                          <div className="flex flex-col gap-3 h-full">
                            <Skeleton className="h-4 w-1/3 rounded" />
                            <Skeleton className="flex-1 rounded" />
                          </div>
                        ) : (
                          <TrendChart
                            data={nationalInsights?.trend ?? []}
                            regionalData={regionalInsights?.trend}
                            regionName={regionName}
                          />
                        )}
                      </Card.Content>
                    </Card>

                    <Card>
                      <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
                        <div>
                          <Card.Title>
                            Age Band Distribution · {latestTrend?.year ?? '—'}
                          </Card.Title>
                        </div>
                        {regionName && (
                          <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-1.5 rounded-full bg-teal-500 inline-block" />
                              {regionName}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-1.5 rounded-full bg-blue-700 inline-block" />
                              National
                            </span>
                          </div>
                        )}
                      </Card.Header>
                      <Card.Content className="p-0">
                        {insightsLoading ? (
                          <div className="grid grid-cols-2 gap-4 p-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                              <Skeleton key={i} className="h-6 rounded" />
                            ))}
                          </div>
                        ) : (
                          <AgeBandChart
                            data={nationalInsights?.ageSplit ?? []}
                            regionalData={regionalInsights?.ageSplit}
                            latestYear={latestTrend?.year ?? null}
                            regionName={regionName}
                          />
                        )}
                      </Card.Content>
                    </Card>

                    <Card>
                      <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
                        <div>
                          <Card.Title>
                            Patient Gender Gap
                            {regionName ? ` · ${regionName}` : ''}
                          </Card.Title>
                          <Card.Description>
                            per 1,000 inhabitants · {latestTrend?.year ?? '—'}
                          </Card.Description>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-1.5 rounded-full bg-blue-500 inline-block" />
                            Men
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-1.5 rounded-full bg-rose-400 inline-block" />
                            Women
                          </span>
                        </div>
                      </Card.Header>
                      <Card.Content className="p-0">
                        {insightsLoading ? (
                          <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
                            <Skeleton className="h-4 w-1/3 rounded" />
                            <Skeleton className="h-48 rounded" />
                          </div>
                        ) : (
                          <GenderGapChart
                            data={nationalInsights?.genderSplit ?? []}
                            regionalData={regionalInsights?.genderSplit}
                            regionName={regionName}
                          />
                        )}
                      </Card.Content>
                    </Card>
                  </div>

                  {/* Right column: map at natural height, ranking fills remaining */}
                  <div className="flex flex-col gap-3 w-full lg:w-80 xl:w-96 lg:shrink-0">
                    <Card>
                      <Card.Header className="px-4 pt-4 pb-0 flex-row items-start justify-between">
                        <div>
                          <Card.Title>Dispensing Intensity Map</Card.Title>
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
                                  'linear-gradient(to right, #bfdbfe, #1d4ed8)'
                              }}
                            />
                            <span className="text-blue-700 whitespace-nowrap">
                              Less than yours
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
                              More than yours
                            </span>
                          </div>
                        </div>
                      </Card.Header>
                      <Card.Content
                        className="pt-3 px-0 pb-0 overflow-hidden"
                        style={{ height: '630px' }}
                      >
                        <MapView regions={regions} />
                      </Card.Content>
                    </Card>
                    <Card className="flex-1 flex flex-col min-h-0">
                      <Card.Header className="px-4 pt-4 pb-0 shrink-0">
                        <Card.Title>Regional Ranking</Card.Title>
                        <Card.Description>
                          Dispensings per 1,000 residents · descending
                        </Card.Description>
                      </Card.Header>
                      <Card.Content
                        className="p-0 overflow-hidden"
                        style={{ height: '560px' }}
                      >
                        <RegionalRanking regions={regions} />
                      </Card.Content>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </UserContext.Provider>
  )
}
