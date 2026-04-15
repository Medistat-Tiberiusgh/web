import { useState, useEffect } from 'react'
import { Card, Skeleton } from '@heroui/react'
import AppNavbar from './components/AppNavbar'
import KpiCard from './components/KpiCard'
import TrendChart from './components/TrendChart'
import MapView from './components/MapView'
import RegionalRanking from './components/RegionalRanking'
import GenderGapChart from './components/GenderGapChart'
import AgeBandChart from './components/AgeBandChart'
import MedicationList from './components/MedicationList'
import DrugInfoCard from './components/DrugInfoCard'
import LoginPage from './components/LoginPage'
import { useMedications } from './hooks/useMedications'
import { useDrugInsights } from './hooks/useDrugInsights'
import { UserContext, useUser } from './context/UserContext'
import { getToken, saveToken, clearToken, decodeToken } from './lib/auth'
import type { User } from './context/UserContext'
import type { Drug, Region, DrugInsights, TrendPoint } from './types'

// Formats a number to 1 decimal place with sign, avoiding "-0.0"
function fmtDelta1(n: number, suffix = '') {
  const v = parseFloat(n.toFixed(1))
  return `${v >= 0 ? '+' : ''}${v.toFixed(1)}${suffix}`
}

function isMaleLike(g: string): boolean {
  const l = g.toLowerCase()
  return l === 'men' || l === 'man' || l === 'male' || l === 'män' || l === 'm'
}

/** Derive a per1000-only trend from gender or age-band split data.
 *  Split data can be sub-annual (monthly/quarterly), so we aggregate to one
 *  point per calendar year by averaging all entries within that year. */
function deriveFilteredTrend(
  insights: DrugInsights | null,
  filterGender: string | null,
  filterAgeBand: string | null
): TrendPoint[] | null {
  if (!insights) return null

  function aggregateByYear(entries: { year: number; per1000: number }[]): TrendPoint[] {
    const map = new Map<number, { sum: number; count: number }>()
    for (const e of entries) {
      const existing = map.get(e.year) ?? { sum: 0, count: 0 }
      map.set(e.year, { sum: existing.sum + e.per1000, count: existing.count + 1 })
    }
    return Array.from(map.entries())
      .map(([year, { sum, count }]) => ({
        year,
        per1000: sum / count,
        totalPrescriptions: 0,
        totalPatients: 0,
      }))
      .sort((a, b) => a.year - b.year)
  }

  if (filterGender) {
    const wantMale = isMaleLike(filterGender)
    return aggregateByYear(
      insights.genderSplit.filter((pt) => isMaleLike(pt.gender) === wantMale)
    )
  }

  if (filterAgeBand) {
    return aggregateByYear(
      insights.ageSplit.filter((pt) => pt.ageGroupName === filterAgeBand)
    )
  }

  return null
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const user = useUser()!
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [filterDrug, setFilterDrug] = useState<Drug | null>(null)
  const [filterRegion, setFilterRegion] = useState<Region | null>(null)
  const [filterYear, setFilterYear] = useState<number | null>(null)
  const [filterGender, setFilterGender] = useState<string | null>(null)
  const [filterAgeBand, setFilterAgeBand] = useState<string | null>(null)

  const { medications, loading: medsLoading } = useMedications()

  const selectedMed = selectedIndex !== null ? medications[selectedIndex] : null

  // FilterBar selections take precedence over sidebar selection
  const effectiveDrug = filterDrug ?? selectedMed?.drugData ?? null
  const effectiveAtcCode = effectiveDrug?.atcCode ?? null
  // FilterBar region takes precedence over user's home region
  const effectiveRegionId = filterRegion?.id ?? user.regionId ?? null

  // Always fetch all years so the trend chart shows the full history.
  // The year filter is applied client-side to scope KPIs and demographic charts.
  const { insights: nationalInsights, loading: insightsLoading } =
    useDrugInsights(effectiveAtcCode, null, null)
  const { insights: regionalInsights } = useDrugInsights(
    effectiveRegionId != null ? effectiveAtcCode : null,
    null,
    effectiveRegionId
  )

  // Demographic-filtered trend (per1000 only; used for TrendChart when gender/age filter is active)
  const filteredNatTrend = deriveFilteredTrend(nationalInsights, filterGender, filterAgeBand)
  const filteredRegTrend = deriveFilteredTrend(regionalInsights, filterGender, filterAgeBand)
  const effectiveNatTrend = filteredNatTrend ?? nationalInsights?.trend ?? []
  const effectiveRegTrend = filteredRegTrend ?? regionalInsights?.trend

  // Active demographic label for chart headers
  const demographicLabel = filterGender
    ? (isMaleLike(filterGender) ? 'Men' : 'Women')
    : filterAgeBand
    ? `${filterAgeBand} yrs`
    : null

  // National trend points (always aggregate — patient counts aren't in split data).
  // When a year filter is active, look up that year specifically; otherwise use the latest.
  const natTrend = nationalInsights?.trend ?? []
  const regTrend = regionalInsights?.trend ?? []
  const natLatestPoint = filterYear
    ? natTrend.find((t) => t.year === filterYear) ?? null
    : natTrend.at(-1) ?? null
  const natPrevPoint = filterYear
    ? natTrend.find((t) => t.year === filterYear - 1) ?? null
    : natTrend.at(-2) ?? null
  const regLatestPoint = filterYear
    ? regTrend.find((t) => t.year === filterYear) ?? null
    : regTrend.at(-1) ?? null
  const regPrevPoint = filterYear
    ? regTrend.find((t) => t.year === filterYear - 1) ?? null
    : regTrend.at(-2) ?? null

  const natLatest = natLatestPoint && natLatestPoint.totalPatients > 0 ? natLatestPoint : null
  const natPrev = natPrevPoint && natPrevPoint.totalPatients > 0 ? natPrevPoint : null
  const regLatest = regLatestPoint && regLatestPoint.totalPatients > 0 ? regLatestPoint : null
  const regPrev = regPrevPoint && regPrevPoint.totalPatients > 0 ? regPrevPoint : null

  // When a demographic filter is active, use filtered per1000 for the rate KPI
  const filteredPer1000Latest = demographicLabel ? (effectiveNatTrend.at(-1)?.per1000 ?? null) : null
  const filteredPer1000Prev = demographicLabel ? (effectiveNatTrend.at(-2)?.per1000 ?? null) : null
  const filteredRegPer1000Latest = demographicLabel ? (effectiveRegTrend?.at(-1)?.per1000 ?? null) : null
  const filteredRegPer1000Prev = demographicLabel ? (effectiveRegTrend?.at(-2)?.per1000 ?? null) : null

  // Use regional as headline where available, fall back to national
  const latestTrend = regLatest ?? natLatest
  const prevTrend = regPrev ?? natPrev

  const chronicUseRatio =
    latestTrend && latestTrend.totalPatients > 0
      ? latestTrend.totalPrescriptions / latestTrend.totalPatients
      : null

  // YoY deltas — regional when available, national otherwise
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

  // National-vs-regional deltas (only meaningful when we have regional data)
  const natChronicRatio =
    natLatest && natLatest.totalPatients > 0
      ? natLatest.totalPrescriptions / natLatest.totalPatients
      : null

  const per1000DeltaVsNat =
    regLatest && natLatest
      ? ((regLatest.per1000 - natLatest.per1000) / natLatest.per1000) * 100
      : null
  const ratioDeltaVsNat =
    regLatest != null && chronicUseRatio != null && natChronicRatio != null && natChronicRatio > 0
      ? ((chronicUseRatio - natChronicRatio) / natChronicRatio) * 100
      : null

  // Region name from the national regional popularity list
  const regionName =
    user.regionId != null
      ? (nationalInsights?.regionalPopularity.find(
          (r) => r.regionId === user.regionId
        )?.regionName ?? null)
      : null

  const regions = nationalInsights?.regionalPopularity ?? []

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppNavbar
        onLogout={onLogout}
        onDrugChange={setFilterDrug}
        onRegionChange={setFilterRegion}
        onYearChange={setFilterYear}
        onGenderChange={setFilterGender}
        onAgeBandChange={setFilterAgeBand}
        availableAgeBands={(() => {
          if (!nationalInsights?.ageSplit) return []
          const seen = new Set<string>()
          const result: string[] = []
          for (const pt of [...nationalInsights.ageSplit].sort((a, b) => a.ageGroupId - b.ageGroupId)) {
            if (!seen.has(pt.ageGroupName)) {
              seen.add(pt.ageGroupName)
              result.push(pt.ageGroupName)
            }
          }
          return result
        })()}
      />

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
                    latestTrend ? latestTrend.totalPatients.toLocaleString() : '—'
                  }
                  delta={
                    patientsPct != null
                      ? {
                          value: fmtDelta1(patientsPct, '%'),
                          subLabel:
                            prevTrend != null
                              ? `(${prevTrend.totalPatients.toLocaleString()})`
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
                        {latestTrend ? ` (${latestTrend.year})` : ''}.
                      </p>
                      <p className="mt-2">
                        National total:{' '}
                        {natLatest
                          ? natLatest.totalPatients.toLocaleString()
                          : '—'}{' '}
                        patients.
                      </p>
                      {regLatest && (
                        <p className="mt-2">
                          Total dispensings in {regionName ?? 'your region'}
                          {` (${regLatest.year})`}:{' '}
                          {regLatest.totalPrescriptions.toLocaleString()}.
                        </p>
                      )}
                    </>
                  }
                />
                <KpiCard
                  label={`Dispensings per 1,000 ${demographicLabel ?? 'Inhabitants'}${regionName ? ` · ${regionName}` : ''}`}
                  value={
                    filteredPer1000Latest != null
                      ? filteredPer1000Latest.toFixed(1)
                      : latestTrend
                      ? latestTrend.per1000.toFixed(1)
                      : '—'
                  }
                  delta={(() => {
                    // Use filtered per1000 delta when demographic filter is active
                    if (filteredPer1000Latest != null && filteredPer1000Prev != null) {
                      const diff = filteredPer1000Latest - filteredPer1000Prev
                      return { value: fmtDelta1(diff), subLabel: `(${filteredPer1000Prev.toFixed(1)})` }
                    }
                    if (per1000Diff != null) {
                      return {
                        value: fmtDelta1(per1000Diff),
                        subLabel: prevTrend != null ? `(${prevTrend.per1000.toFixed(1)})` : undefined,
                      }
                    }
                    return undefined
                  })()}
                  nationalDelta={(() => {
                    // Regional vs national comparison using filtered values when active
                    if (filteredRegPer1000Latest != null && filteredPer1000Latest != null) {
                      const pct = filteredPer1000Latest > 0
                        ? ((filteredRegPer1000Latest - filteredPer1000Latest) / filteredPer1000Latest) * 100
                        : null
                      return pct != null
                        ? { value: fmtDelta1(pct, '%'), pct, avgLabel: filteredPer1000Latest.toFixed(1) }
                        : null
                    }
                    if (per1000DeltaVsNat != null && natLatest) {
                      return {
                        value: fmtDelta1(per1000DeltaVsNat, '%'),
                        pct: per1000DeltaVsNat,
                        avgLabel: natLatest.per1000.toFixed(1),
                      }
                    }
                    return null
                  })()}
                  info={
                    demographicLabel
                      ? `Dispensings per 1,000 ${demographicLabel}. Trend chart above uses this demographic-filtered rate.`
                      : `Dispensings per 1,000 inhabitants in ${regionName ?? 'your region'}. The national average is ${natLatest ? natLatest.per1000.toFixed(1) : '—'}.`
                  }
                />
                <KpiCard
                  label={`Chronic Use Ratio${regionName ? ` · ${regionName}` : ''}`}
                  value={
                    chronicUseRatio != null
                      ? `${chronicUseRatio.toFixed(2)}x`
                      : '—'
                  }
                  delta={
                    ratioDiff != null && prevTrend != null
                      ? {
                          value: `${fmtDelta1(ratioDiff)}x`,
                          subLabel: `(${(prevTrend.totalPrescriptions / prevTrend.totalPatients).toFixed(2)}x)`
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
          {!effectiveDrug ? (
            <Card>
              <Card.Content className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Select a medication from the sidebar or search bar to explore dispensing data
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
                          Dispensing Trend · 2006–2024{demographicLabel ? ` · ${demographicLabel}` : ''}
                        </Card.Title>
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
                          data={effectiveNatTrend}
                          regionalData={effectiveRegTrend}
                          regionName={regionName}
                        />
                      )}
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
                      <div>
                        <Card.Title>
                          Age Band Distribution · {filterYear ?? latestTrend?.year ?? '—'}{demographicLabel ? ` · ${demographicLabel}` : ''}
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
                          latestYear={filterYear ?? latestTrend?.year ?? null}
                          regionName={regionName}
                          filterAgeBand={filterAgeBand}
                        />
                      )}
                    </Card.Content>
                  </Card>

                  <div className="grid grid-cols-[2fr_3fr] gap-3 items-stretch">
                    <DrugInfoCard
                      atcCode={effectiveDrug.atcCode}
                      drugName={effectiveDrug.name}
                      narcoticClass={effectiveDrug.narcoticClass}
                    />
                    <Card>
                      <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
                        <div>
                          <Card.Title>
                            Patient Gender Gap
                            {regionName ? ` · ${regionName}` : ''}
                            {demographicLabel ? ` · ${demographicLabel}` : ''}
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
                            filterGender={filterGender}
                          />
                        )}
                      </Card.Content>
                    </Card>
                  </div>
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
                            {user.regionId != null ? 'Less than yours' : 'Below average'}
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
                            {user.regionId != null ? 'More than yours' : 'Above average'}
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
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const token = getToken()
    return token ? decodeToken(token) : null
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      saveToken(token)
      setUser(decodeToken(token))
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function handleLogout() {
    clearToken()
    setUser(null)
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <UserContext.Provider value={user}>
      <Dashboard onLogout={handleLogout} />
    </UserContext.Provider>
  )
}
