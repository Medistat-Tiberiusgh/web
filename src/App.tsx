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

export default function App() {
  const [user] = useState<User>(mockUser)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const { medications, loading: medsLoading } = useMedications()

  const selectedMed = selectedIndex !== null ? medications[selectedIndex] : null
  const { insights, loading: insightsLoading } = useDrugInsights(
    selectedMed?.drugData?.atcCode ?? null,
    null,
    null
  )

  const latestTrend =
    (insights?.trend.at(-1)?.totalPatients ?? 0) > 0
      ? insights!.trend.at(-1)!
      : null
  const prevTrend =
    (insights?.trend.at(-2)?.totalPatients ?? 0) > 0
      ? insights!.trend.at(-2)!
      : null

  const chronicUseRatio =
    latestTrend && latestTrend.totalPatients > 0
      ? latestTrend.totalPrescriptions / latestTrend.totalPatients
      : null
  const nationalPer1000 = latestTrend ? latestTrend.per1000.toFixed(1) : null

  const patientsPct =
    latestTrend && prevTrend && prevTrend.totalPatients > 0
      ? ((latestTrend.totalPatients - prevTrend.totalPatients) /
          prevTrend.totalPatients) *
        100
      : null
  const per1000Diff =
    latestTrend && prevTrend ? latestTrend.per1000 - prevTrend.per1000 : null
  const ratioDiff =
    chronicUseRatio != null && prevTrend && prevTrend.totalPatients > 0
      ? chronicUseRatio - prevTrend.totalPrescriptions / prevTrend.totalPatients
      : null

  const regions = insights?.regionalPopularity ?? []

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
                    label="Total Patients"
                    value={
                      latestTrend
                        ? latestTrend.totalPatients.toLocaleString()
                        : '—'
                    }
                    delta={
                      patientsPct != null
                        ? {
                            value: `${patientsPct >= 0 ? '+' : ''}${patientsPct.toFixed(1)}%`,
                            positive: patientsPct >= 0
                          }
                        : undefined
                    }
                    info={
                      <>
                        <p>
                          Number of unique patients who received at least one
                          dispensing for this drug in the most recent year of
                          available data
                          {latestTrend ? ` (${latestTrend.year})` : ''}.
                        </p>
                        <p className="mt-2">
                          Total dispensings
                          {latestTrend ? ` (${latestTrend.year})` : ''}:{' '}
                          {latestTrend
                            ? latestTrend.totalPrescriptions.toLocaleString()
                            : '—'}
                          .
                        </p>
                      </>
                    }
                  />
                  <KpiCard
                    label="Per 1,000 Inhabitants"
                    value={nationalPer1000 ?? '—'}
                    delta={
                      per1000Diff != null
                        ? {
                            value: `${per1000Diff >= 0 ? '+' : ''}${per1000Diff.toFixed(1)}`,
                            positive: per1000Diff >= 0
                          }
                        : undefined
                    }
                    info="Number of dispensings per 1,000 inhabitants across all Swedish regions."
                  />
                  <KpiCard
                    label="Chronic Use Ratio"
                    value={
                      chronicUseRatio != null
                        ? `${chronicUseRatio.toFixed(2)}x`
                        : '—'
                    }
                    delta={
                      ratioDiff != null
                        ? {
                            value: `${ratioDiff >= 0 ? '+' : ''}${ratioDiff.toFixed(2)}x`,
                            positive: ratioDiff >= 0
                          }
                        : undefined
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
                          <Card.Title>
                            Year-by-Year Dispensing Changes
                          </Card.Title>
                          <Card.Description>
                            {selectedMed.drugData.name} · national totals
                            2006–2024
                          </Card.Description>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                          <span className="flex items-center gap-1.5">
                            <span className="w-5 h-0.5 bg-blue-700 inline-block rounded" />
                            Dispensings
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-5 h-0.5 bg-gray-400 inline-block rounded"
                              style={{ borderTop: '2px dashed' }}
                            />
                            Patients
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
                          <TrendChart data={insights?.trend ?? []} />
                        )}
                      </Card.Content>
                    </Card>

                    <Card>
                      <Card.Header className="px-4 pt-4 pb-0">
                        <Card.Title>Age Band Distribution</Card.Title>
                        <Card.Description>
                          Dispensings per 1,000 inhabitants ·{' '}
                          {latestTrend?.year ?? '—'}
                        </Card.Description>
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
                            data={insights?.ageSplit ?? []}
                            latestYear={latestTrend?.year ?? null}
                            columns={2}
                          />
                        )}
                      </Card.Content>
                    </Card>

                    <Card>
                      <Card.Header className="px-4 pt-4 pb-0">
                        <Card.Title>Patient Gender Gap</Card.Title>
                        <Card.Description>
                          Dispensings per 1,000 inhabitants · by gender
                        </Card.Description>
                      </Card.Header>
                      <Card.Content className="px-4 pb-4 pt-2">
                        {insightsLoading ? (
                          <div className="flex flex-col gap-2">
                            <Skeleton className="h-4 w-1/3 rounded" />
                            <Skeleton className="h-48 rounded" />
                          </div>
                        ) : (
                          <GenderGapChart data={insights?.genderSplit ?? []} />
                        )}
                      </Card.Content>
                    </Card>
                  </div>

                  {/* Right column: map at natural height, ranking fills remaining */}
                  <div className="flex flex-col gap-3 w-full lg:w-72 lg:shrink-0">
                    <Card>
                      <Card.Header className="px-4 pt-4 pb-0">
                        <Card.Title>Dispensing Intensity Map</Card.Title>
                        <Card.Description>
                          per 1,000 inhabitants
                        </Card.Description>
                      </Card.Header>
                      <Card.Content
                        className="p-0 overflow-hidden"
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
                      <Card.Content className="p-0 flex-1 min-h-0 overflow-y-auto">
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
