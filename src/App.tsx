import { useState, useEffect, useMemo, useRef } from 'react'
import { fmtPer1000, fmtPer1000Delta } from './lib/format'
import { Card, Skeleton } from '@heroui/react'
import AppNavbar from './components/AppNavbar'
import KpiCard from './components/KpiCard'
import TrendChart from './components/TrendChart'
import MapView from './components/MapView'
import RegionalRanking from './components/RegionalRanking'
import GenderGapChart from './components/GenderGapChart'
import AgeBandSparklines from './components/AgeBandSparklines'
import MedicationList from './components/MedicationList'
import DrugInfoCard from './components/DrugInfoCard'
import ChartFilterLabel from './components/ChartFilterLabel'
import DemographicHeatmap from './components/DemographicHeatmap'
import LoginPage from './components/LoginPage'
import { useFilters } from './hooks/useFilters'
import { useDashboardInsights } from './hooks/useDashboardInsights'
import { useDemographicGrid } from './hooks/useDemographicGrid'
import { useMedications } from './hooks/useMedications'
import { useRegions } from './hooks/useRegions'
import { UserContext, useUser } from './context/UserContext'
import { getToken, saveToken, clearToken, decodeToken } from './lib/auth'
import type { User } from './context/UserContext'
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtDelta1(n: number, suffix = '', dp = 1) {
  // Detect sign from the original value to avoid the JS -0 trap:
  // parseFloat("-0.0") === -0, and -0 >= 0 is true, which flips the sign.
  const threshold = 5 * Math.pow(10, -(dp + 1)) // 0.05 for dp=1, 0.005 for dp=2
  const sign = n <= -threshold ? '-' : '+'
  return `${sign}${Math.abs(n).toFixed(dp)}${suffix}`
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const user = useUser()!
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)

  const {
    activeDrug,
    setActiveDrug,
    activeRegion,
    setActiveRegion,
    activeYear,
    setActiveYear,
    activeGender,
    setActiveGender,
    activeAgeBand,
    setActiveAgeBand
  } = useFilters()

  const chartCardRef = useRef<HTMLDivElement>(null)
  const [chartCardHeight, setChartCardHeight] = useState<number | undefined>(undefined)
  useEffect(() => {
    const el = chartCardRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setChartCardHeight(e.contentRect.height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [activeDrug?.atcCode])

  function handleRegionClick(regionId: number, regionName: string) {
    if (activeRegion?.id === regionId) {
      setActiveRegion(null)
    } else {
      setActiveRegion({ id: regionId, regionName })
    }
  }

  const { medications, loading: medsLoading, addMedication, removeMedication } = useMedications()
  const { regions } = useRegions()

  // The effective region comes from an explicit filter first, then the user's
  // home region — so charts always show personalised data by default.
  const effectiveRegionId = activeRegion?.id ?? user.regionId ?? null

  // Derive numeric IDs for the API — server uses integer codes for gender/age.
  // Gender and age band are mutually exclusive (enforced by useFilters).
  const genderId = activeGender === 'men' ? 1 : activeGender === 'women' ? 2 : null
  const ageBandId = activeAgeBand?.id ?? null

  const { national, regional, loading } = useDashboardInsights(
    activeDrug?.atcCode ?? null,
    effectiveRegionId,
    genderId,
    ageBandId,
  )

  // Demographic grid fetched separately so it can respect the year filter
  // without limiting the trend series used by TrendChart.
  const { grid: natGrid } = useDemographicGrid(
    activeDrug?.atcCode ?? null,
    null,
    activeYear,
  )
  const { grid: regGrid } = useDemographicGrid(
    effectiveRegionId != null ? (activeDrug?.atcCode ?? null) : null,
    effectiveRegionId,
    activeYear,
  )

  // Region name resolved from the static regions list — available immediately,
  // no need to wait for drug insights to load.
  const regionName = useMemo(
    () => regions.find((r) => r.id === effectiveRegionId)?.regionName ?? null,
    [regions, effectiveRegionId]
  )

  // Available age bands for the search dropdown, sorted by group ID.
  // ageSplit always returns all bands regardless of demographic filters,
  // so this list stays complete even when a gender filter is active.
  const availableAgeBands = useMemo(() => {
    if (!national?.ageSplit) return []
    const seen = new Set<number>()
    return [...national.ageSplit]
      .sort((a, b) => a.ageGroupId - b.ageGroupId)
      .filter((pt) => !seen.has(pt.ageGroupId) && seen.add(pt.ageGroupId))
      .map((pt) => ({ name: pt.ageGroupName, id: pt.ageGroupId }))
  }, [national?.ageSplit])

  // A human-readable label for the active demographic filter, used in chart titles.
  const demographicLabel = activeGender === 'men'
    ? 'Men'
    : activeGender === 'women'
      ? 'Women'
      : activeAgeBand
        ? `${activeAgeBand.name} yrs`
        : null

  // Trend arrays — the API already applies demographic filters server-side,
  // so national?.trend is the correct filtered series to use directly.
  const effectiveNatTrend = national?.trend ?? []
  const effectiveRegTrend = regional?.trend

  // ---------------------------------------------------------------------------
  // KPI source rows — when a year filter is active, look up that specific year.
  // ---------------------------------------------------------------------------

  const natTrend = national?.trend ?? []
  const regTrend = regional?.trend ?? []

  const natLatestPoint = activeYear
    ? (natTrend.find((t) => t.year === activeYear) ?? null)
    : (natTrend.at(-1) ?? null)
  const natPrevPoint = activeYear
    ? (natTrend.find((t) => t.year === activeYear - 1) ?? null)
    : (natTrend.at(-2) ?? null)
  const regLatestPoint = activeYear
    ? (regTrend.find((t) => t.year === activeYear) ?? null)
    : (regTrend.at(-1) ?? null)
  const regPrevPoint = activeYear
    ? (regTrend.find((t) => t.year === activeYear - 1) ?? null)
    : (regTrend.at(-2) ?? null)

  // Only use a row if it has real patient data (split data has 0 patients).
  const natLatest = natLatestPoint?.totalPatients ? natLatestPoint : null
  const natPrev = natPrevPoint?.totalPatients ? natPrevPoint : null
  const regLatest = regLatestPoint?.totalPatients ? regLatestPoint : null
  const regPrev = regPrevPoint?.totalPatients ? regPrevPoint : null

  // Regional is the headline; fall back to national when no regional data.
  const latestTrend = regLatest ?? natLatest
  const prevTrend = regPrev ?? natPrev

  // ---------------------------------------------------------------------------
  // Derived KPI values
  // ---------------------------------------------------------------------------

  const chronicUseRatio =
    latestTrend && latestTrend.totalPatients > 0
      ? latestTrend.totalPrescriptions / latestTrend.totalPatients
      : null

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

  const natChronicRatio =
    natLatest && natLatest.totalPatients > 0
      ? natLatest.totalPrescriptions / natLatest.totalPatients
      : null

  const per1000DeltaVsNat =
    regLatest && natLatest && natLatest.per1000 > 0
      ? ((regLatest.per1000 - natLatest.per1000) / natLatest.per1000) * 100
      : null

  const ratioDeltaVsNat =
    regLatest != null &&
    chronicUseRatio != null &&
    natChronicRatio != null &&
    natChronicRatio > 0
      ? ((chronicUseRatio - natChronicRatio) / natChronicRatio) * 100
      : null

  // ── Demographic filter helpers ──────────────────────────────────────────────

  function isMaleGender(g: string) {
    const l = g.toLowerCase()
    return l === 'men' || l === 'man' || l === 'male' || l === 'män' || l === 'm'
  }

  // Filter genderSplit to only the active gender when one is set.
  // The API always returns both genders for this field regardless of the filter.
  const natGenderSplit = useMemo(() => {
    const split = national?.genderSplit ?? []
    if (!activeGender) return split
    return split.filter(pt => activeGender === 'men' ? isMaleGender(pt.gender) : !isMaleGender(pt.gender))
  }, [national?.genderSplit, activeGender])

  const regGenderSplit = useMemo(() => {
    if (!regional?.genderSplit) return undefined
    if (!activeGender) return regional.genderSplit
    return regional.genderSplit.filter(pt => activeGender === 'men' ? isMaleGender(pt.gender) : !isMaleGender(pt.gender))
  }, [regional?.genderSplit, activeGender])

  // Filter ageSplit to only the active age band when one is set.
  // The API always returns all age bands for this field regardless of the filter.
  const natAgeSplit = useMemo(() => {
    const split = national?.ageSplit ?? []
    if (!activeAgeBand) return split
    return split.filter(pt => pt.ageGroupId === activeAgeBand.id)
  }, [national?.ageSplit, activeAgeBand])

  const regAgeSplit = useMemo(() => {
    if (!regional?.ageSplit) return undefined
    if (!activeAgeBand) return regional.ageSplit
    return regional.ageSplit.filter(pt => pt.ageGroupId === activeAgeBand.id)
  }, [regional?.ageSplit, activeAgeBand])

  // Filter demographic grid to only the active age band when one is set.
  const filteredNatGrid = useMemo(() => {
    let grid = natGrid
    if (activeAgeBand) grid = grid.filter(cell => cell.ageGroupId === activeAgeBand.id)
    if (activeGender) grid = grid.filter(cell => activeGender === 'men' ? isMaleGender(cell.gender) : !isMaleGender(cell.gender))
    return grid
  }, [natGrid, activeAgeBand, activeGender])

  const filteredRegGrid = useMemo(() => {
    let grid = regGrid
    if (activeAgeBand) grid = grid.filter(cell => cell.ageGroupId === activeAgeBand.id)
    if (activeGender) grid = grid.filter(cell => activeGender === 'men' ? isMaleGender(cell.gender) : !isMaleGender(cell.gender))
    return grid
  }, [regGrid, activeAgeBand, activeGender])

  // Inject the real national per-1,000 (region=0 row) so RegionalRanking and
  // MapView can display the correct national average. The API excludes region=0
  // from regionalPopularity, so we add it here from the national trend data.
  const mapRegions = useMemo(() => {
    const base = national?.regionalPopularity ?? []
    if (natLatest?.per1000 != null) {
      return [...base, { regionId: 0, regionName: 'National', per1000: natLatest.per1000 }]
    }
    return base
  }, [national?.regionalPopularity, natLatest?.per1000])

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppNavbar
        onLogout={onLogout}
        activeDrug={activeDrug}
        activeRegion={activeRegion}
        activeYear={activeYear}
        activeGender={activeGender}
        activeAgeBand={activeAgeBand}
        availableAgeBands={availableAgeBands}
        savedAtcCodes={new Set(medications.map((m) => m.drugData.atcCode))}
        onDrugChange={setActiveDrug}
        onRegionChange={setActiveRegion}
        onYearChange={setActiveYear}
        onGenderChange={setActiveGender}
        onAgeBandChange={setActiveAgeBand}
        onSaveDrug={(drug) => addMedication(drug.atcCode)}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
          <MedicationList
            medications={medications}
            loading={medsLoading}
            activeDrugAtcCode={activeDrug?.atcCode ?? null}
            onSelect={setActiveDrug}
            onRemove={removeMedication}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-w-screen-2xl mx-auto w-full">
          {/* KPI cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {loading ? (
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
                    latestTrend
                      ? latestTrend.totalPatients.toLocaleString()
                      : '—'
                  }
                  delta={
                    patientsPct != null
                      ? {
                          value: fmtDelta1(patientsPct, '%'),
                          subLabel: prevTrend
                            ? `(${prevTrend.totalPatients.toLocaleString()})`
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
                        {latestTrend ? ` in ${latestTrend.year}` : ''}.
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
                          Total dispensings in {regionName ?? 'your region'} (
                          {regLatest.year}):{' '}
                          {regLatest.totalPrescriptions.toLocaleString()}.
                        </p>
                      )}
                    </>
                  }
                />

                <KpiCard
                  label={`Dispensings per 1,000 ${demographicLabel ?? 'Inhabitants'}${regionName ? ` · ${regionName}` : ''}`}
                  value={latestTrend ? fmtPer1000(latestTrend.per1000) : '—'}
                  delta={
                    per1000Diff != null
                      ? {
                          value: fmtPer1000Delta(per1000Diff),
                          subLabel: prevTrend ? `(${fmtPer1000(prevTrend.per1000)})` : undefined
                        }
                      : undefined
                  }
                  nationalDelta={
                    per1000DeltaVsNat != null && natLatest
                      ? {
                          value: fmtDelta1(per1000DeltaVsNat, '%'),
                          pct: per1000DeltaVsNat,
                          avgLabel: fmtPer1000(natLatest.per1000)
                        }
                      : null
                  }
                  info={
                    demographicLabel
                      ? `Dispensings per 1,000 ${demographicLabel}. The API filters the data for this demographic.`
                      : `Dispensings per 1,000 inhabitants in ${regionName ?? 'your region'}. National average: ${natLatest ? fmtPer1000(natLatest.per1000) : '—'}.`
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
                          value: fmtDelta1(ratioDiff, 'x', 2),
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
                  info="Total dispensings divided by total patients. A value above 1 means patients dispensed the drug more than once on average, typical for chronic conditions."
                />
              </>
            )}
          </div>

          {/* Charts — only shown when a drug is selected */}
          {!activeDrug ? (
            <Card>
              <Card.Content className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Select a medication from the sidebar or search bar to explore
                dispensing data
              </Card.Content>
            </Card>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row gap-3">
                {/* Left column */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                  <Card>
                    <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
                      <div>
                        <Card.Title>
                          Dispensing Trend · 2006–2024
                          <ChartFilterLabel gender={activeGender} ageBand={activeAgeBand} />
                        </Card.Title>
                        <Card.Description>per 1,000 inhabitants</Card.Description>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                        {regionName && (
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-1.5 rounded-full bg-teal-600 inline-block" />
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
                      {loading ? (
                        <Skeleton className="h-48 m-4 rounded" />
                      ) : (
                        <TrendChart
                          data={effectiveNatTrend}
                          regionalData={effectiveRegTrend}
                          regionName={regionName}
                          selectedYear={activeYear}
                          onYearChange={setActiveYear}
                        />
                      )}
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
                      <div>
                        <Card.Title>
                          Age Band Trends
                          <ChartFilterLabel year={activeYear} gender={activeGender} ageBand={activeAgeBand} />
                        </Card.Title>
                        <Card.Description>
                          per 1,000 people · bars = {activeYear ?? latestTrend?.year ?? '—'} · lines = 2006–{activeYear ?? latestTrend?.year ?? '2024'} trend
                        </Card.Description>
                      </div>
                      {regionName && (
                        <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-1.5 rounded-full bg-teal-600 inline-block" />
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
                      {loading ? (
                        <div className="flex flex-col gap-2 p-4">
                          {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className="h-7 rounded" />
                          ))}
                        </div>
                      ) : (
                        <AgeBandSparklines
                          data={natAgeSplit}
                          regionalData={regAgeSplit}
                          latestYear={activeYear ?? latestTrend?.year ?? null}
                          selectedYear={activeYear}
                          regionName={regionName}
                          filterAgeBand={activeAgeBand?.name ?? null}
                        />
                      )}
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Header className="px-4 pt-4 pb-0">
                      <Card.Title>
                        Heatmap · Age &amp; Gender
                        <ChartFilterLabel year={activeYear} regionName={regionName} />
                      </Card.Title>
                      <Card.Description>per 1,000 people</Card.Description>
                    </Card.Header>
                    <Card.Content className="p-0">
                      {loading ? (
                        <div className="grid grid-cols-3 gap-1 p-4">
                          {Array.from({ length: 54 }).map((_, i) => (
                            <Skeleton key={i} className="h-5 rounded" />
                          ))}
                        </div>
                      ) : (
                        <DemographicHeatmap
                          data={filteredNatGrid}
                          regionalData={filteredRegGrid.length > 0 ? filteredRegGrid : undefined}
                          regionName={regionName}
                          filterGender={activeGender}
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
                          <ChartFilterLabel year={activeYear} gender={activeGender} ageBand={activeAgeBand} />
                        </Card.Title>
                        <Card.Description>per 1,000 inhabitants</Card.Description>
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
                            {user.regionId != null
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
                            {user.regionId != null
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
                        regions={mapRegions}
                        selectedRegionId={activeRegion?.id ?? null}
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
                        <ChartFilterLabel year={activeYear} gender={activeGender} ageBand={activeAgeBand} />
                      </Card.Title>
                      <Card.Description>Dispensings per 1,000 residents · descending</Card.Description>
                    </Card.Header>
                    <Card.Content className="p-0 overflow-hidden">
                      <RegionalRanking
                        regions={mapRegions}
                        selectedRegionId={activeRegion?.id ?? null}
                        hoveredRegionId={hoveredRegionId}
                        onHoverRegion={setHoveredRegionId}
                        onRegionClick={handleRegionClick}
                      />
                    </Card.Content>
                  </Card>
                </div>
              </div>

              {/* Full-width bottom row: chart fixed-width, drug info fills the rest */}
              <div className="flex gap-3 items-start">
                <div ref={chartCardRef} style={{ width: '640px' }} className="shrink-0">
                  <Card>
                    <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
                      <div>
                        <Card.Title>
                          Patient Gender Gap
                          <ChartFilterLabel regionName={regionName} ageBand={activeAgeBand} />
                        </Card.Title>
                        <Card.Description>per 1,000 inhabitants · all years</Card.Description>
                      </div>
                    </Card.Header>
                    <Card.Content className="p-0">
                      {loading ? (
                        <Skeleton className="h-48 m-4 rounded" />
                      ) : (
                        <GenderGapChart
                          data={natGenderSplit}
                          regionalData={regGenderSplit}
                          regionName={regionName}
                          filterGender={activeGender}
                          selectedYear={activeYear}
                        />
                      )}
                    </Card.Content>
                  </Card>
                </div>

                <div className="flex-1" style={{ height: chartCardHeight }}>
                  <DrugInfoCard
                    atcCode={activeDrug.atcCode}
                    drugName={activeDrug.name}
                    narcoticClass={activeDrug.narcoticClass}
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

// ---------------------------------------------------------------------------
// App — auth shell only
// ---------------------------------------------------------------------------

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

  if (!user) return <LoginPage />

  return (
    <UserContext.Provider value={user}>
      <Dashboard onLogout={handleLogout} />
    </UserContext.Provider>
  )
}
