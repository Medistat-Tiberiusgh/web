import { useState } from 'react'
import { Card, Skeleton } from '@heroui/react'
import AppNavbar from './components/AppNavbar'
import KpiCard from './components/KpiCard'
import TrendChart from './components/TrendChart'
import MapView from './components/MapView'
import RegionalRanking from './components/RegionalRanking'
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

  const latestTrend = insights?.trend.at(-1) ?? null
  const prevTrend = insights?.trend.at(-2) ?? null

  const chronicUseRatio =
    latestTrend && latestTrend.totalPatients > 0
      ? latestTrend.totalPrescriptions / latestTrend.totalPatients
      : null
  const nationalPer1000 = latestTrend ? latestTrend.per1000.toFixed(1) : null

  const patientsPct =
    latestTrend && prevTrend
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
          <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
            {/* KPI cards */}
            <div className="grid grid-cols-3 gap-4">
              {insightsLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <Card.Content className="p-5 flex flex-col gap-2">
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
                          prescription for this drug in the most recent year of
                          available data
                          {latestTrend ? ` (${latestTrend.year})` : ''}.
                        </p>
                        <p className="mt-2">
                          Total prescriptions that year:{' '}
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
                    info="Average number of dispensed prescriptions per 1,000 inhabitants, averaged across all Swedish regions. Used to compare drug use relative to population size."
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
                    info="Total prescriptions divided by total patients. A value above 1 means patients received more than one prescription on average, which is typical for chronic or recurring conditions."
                  />
                </>
              )}
            </div>

            {/* Charts — only shown when a drug is selected */}
            {!selectedMed ? (
              <Card>
                <Card.Content className="flex items-center justify-center h-64 text-gray-400 text-sm">
                  Select a medication from the sidebar to explore prescription
                  data
                </Card.Content>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-5 gap-4">
                  {/* Trend chart */}
                  <Card className="col-span-3">
                    <Card.Content className="p-5 h-72">
                      {insightsLoading ? (
                        <div className="flex flex-col gap-3 h-full">
                          <Skeleton className="h-4 w-1/3 rounded" />
                          <Skeleton className="flex-1 rounded" />
                        </div>
                      ) : (
                        <TrendChart
                          data={insights?.trend ?? []}
                          drugName={selectedMed.drugData.name}
                        />
                      )}
                    </Card.Content>
                  </Card>

                  {/* Map */}
                  <Card className="col-span-2">
                    <Card.Content className="p-0 h-72 overflow-hidden">
                      <MapView regions={regions} />
                    </Card.Content>
                  </Card>
                </div>

                {/* Regional ranking */}
                <Card>
                  <Card.Content className="p-0">
                    <RegionalRanking regions={regions} />
                  </Card.Content>
                </Card>
              </>
            )}
          </main>
        </div>
      </div>
    </UserContext.Provider>
  )
}
