import { useState, useEffect, useRef, useMemo } from 'react'
import { useUser } from '../context/UserContext'
import { useFilters } from './useFilters'
import { useDashboardInsights } from './useDashboardInsights'
import { useAgeSplit } from './useAgeSplit'
import { useDemographicGrid } from './useDemographicGrid'
import { useMedications } from './useMedications'
import { useRegions } from './useRegions'

function isMaleGender(g: string) {
  const l = g.toLowerCase()
  return l === 'men' || l === 'man' || l === 'male' || l === 'män' || l === 'm'
}

/**
 * Central data hook for the dashboard. Owns all fetching, derived values, and
 * KPI calculations so the Dashboard component only deals with layout.
 */
export function useDashboard() {
  const user = useUser()!
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)

  const filters = useFilters()
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
  } = filters

  // Sync the Gender Gap card height to the Drug Info card height
  const chartCardRef = useRef<HTMLDivElement>(null)
  const [chartCardHeight, setChartCardHeight] = useState<number | undefined>(
    undefined
  )
  useEffect(() => {
    const el = chartCardRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) =>
      setChartCardHeight(e.contentRect.height)
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [activeDrug?.atcCode])

  function handleRegionClick(regionId: number, regionName: string) {
    if (activeRegion?.id === regionId) setActiveRegion(null)
    else setActiveRegion({ id: regionId, regionName })
  }

  const {
    medications,
    loading: medsLoading,
    addMedication,
    removeMedication
  } = useMedications()
  const { regions } = useRegions()

  // Effective region: explicit filter → user's home region → none
  const effectiveRegionId = activeRegion?.id ?? user.regionId ?? null

  // Numeric IDs for API — gender and age band are mutually exclusive (useFilters enforces this)
  const genderId =
    activeGender === 'men' ? 1 : activeGender === 'women' ? 2 : null
  const ageBandId = activeAgeBand?.id ?? null

  const { national, regional, loading } = useDashboardInsights(
    activeDrug?.atcCode ?? null,
    effectiveRegionId,
    genderId,
    ageBandId
  )

  // Age split always fetches all bands so AgeBandSparklines can highlight
  // the selected band rather than collapsing to a single row.
  const { ageSplit: natAgeSplit } = useAgeSplit(
    activeDrug?.atcCode ?? null,
    null,
    genderId
  )
  const { ageSplit: regAgeSplit } = useAgeSplit(
    effectiveRegionId != null ? (activeDrug?.atcCode ?? null) : null,
    effectiveRegionId,
    genderId
  )

  // Demographic grid fetched separately to support year filtering without
  // limiting the full trend series used by TrendChart.
  const { grid: natGrid } = useDemographicGrid(
    activeDrug?.atcCode ?? null,
    null,
    activeYear
  )
  const { grid: regGrid } = useDemographicGrid(
    effectiveRegionId != null ? (activeDrug?.atcCode ?? null) : null,
    effectiveRegionId,
    activeYear
  )

  const regionName = useMemo(
    () => regions.find((r) => r.id === effectiveRegionId)?.regionName ?? null,
    [regions, effectiveRegionId]
  )

  // Always-complete list for the age band dropdown — no ageGroup filter applied
  const availableAgeBands = useMemo(() => {
    const seen = new Set<number>()
    return [...natAgeSplit]
      .sort((a, b) => a.ageGroupId - b.ageGroupId)
      .filter((pt) => !seen.has(pt.ageGroupId) && seen.add(pt.ageGroupId))
      .map((pt) => ({ name: pt.ageGroupName, id: pt.ageGroupId }))
  }, [natAgeSplit])

  const demographicLabel =
    activeGender === 'men'
      ? 'Men'
      : activeGender === 'women'
        ? 'Women'
        : activeAgeBand
          ? `${activeAgeBand.name} yrs`
          : null

  // ── Trend arrays ────────────────────────────────────────────────────────────

  const effectiveNatTrend = national?.trend ?? []
  const effectiveRegTrend = regional?.trend

  // ── KPI source rows ─────────────────────────────────────────────────────────

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

  // Only use rows with real patient data (demographic-split rows have 0 patients)
  const natLatest = natLatestPoint?.totalPatients ? natLatestPoint : null
  const natPrev = natPrevPoint?.totalPatients ? natPrevPoint : null
  const regLatest = regLatestPoint?.totalPatients ? regLatestPoint : null
  const regPrev = regPrevPoint?.totalPatients ? regPrevPoint : null

  const latestTrend = regLatest ?? natLatest
  const prevTrend = regPrev ?? natPrev

  // ── KPI derived values ───────────────────────────────────────────────────────

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

  // ── Chart data ───────────────────────────────────────────────────────────────

  const natGenderSplit = useMemo(() => {
    const split = national?.genderSplit ?? []
    if (!activeGender) return split
    return split.filter((pt) =>
      activeGender === 'men'
        ? isMaleGender(pt.gender)
        : !isMaleGender(pt.gender)
    )
  }, [national?.genderSplit, activeGender])

  const regGenderSplit = useMemo(() => {
    if (!regional?.genderSplit) return undefined
    if (!activeGender) return regional.genderSplit
    return regional.genderSplit.filter((pt) =>
      activeGender === 'men'
        ? isMaleGender(pt.gender)
        : !isMaleGender(pt.gender)
    )
  }, [regional?.genderSplit, activeGender])

  // Heatmap always shows all age bands — only apply gender filter
  const filteredNatGrid = useMemo(() => {
    if (!activeGender) return natGrid
    return natGrid.filter((cell) =>
      activeGender === 'men'
        ? isMaleGender(cell.gender)
        : !isMaleGender(cell.gender)
    )
  }, [natGrid, activeGender])

  const filteredRegGrid = useMemo(() => {
    if (!activeGender) return regGrid
    return regGrid.filter((cell) =>
      activeGender === 'men'
        ? isMaleGender(cell.gender)
        : !isMaleGender(cell.gender)
    )
  }, [regGrid, activeGender])

  // Inject the national average as a pseudo-region so MapView and
  // RegionalRanking can display it alongside real regions.
  const mapRegions = useMemo(() => {
    const base = national?.regionalPopularity ?? []
    if (natLatest?.per1000 != null)
      return [
        ...base,
        { regionId: 0, regionName: 'National', per1000: natLatest.per1000 }
      ]
    return base
  }, [national?.regionalPopularity, natLatest?.per1000])

  return {
    // Filters
    activeDrug,
    setActiveDrug,
    activeRegion,
    setActiveRegion,
    activeYear,
    setActiveYear,
    activeGender,
    setActiveGender,
    activeAgeBand,
    setActiveAgeBand,
    // Interaction
    hoveredRegionId,
    setHoveredRegionId,
    handleRegionClick,
    // Layout
    chartCardRef,
    chartCardHeight,
    // Medications sidebar
    medications,
    medsLoading,
    addMedication,
    removeMedication,
    // Derived filters
    regionName,
    availableAgeBands,
    demographicLabel,
    // Loading
    loading,
    // KPI values
    latestTrend,
    prevTrend,
    natLatest,
    regLatest,
    chronicUseRatio,
    patientsPct,
    per1000Diff,
    ratioDiff,
    per1000DeltaVsNat,
    ratioDeltaVsNat,
    natChronicRatio,
    // Chart data
    effectiveNatTrend,
    effectiveRegTrend,
    natAgeSplit,
    regAgeSplit,
    filteredNatGrid,
    filteredRegGrid,
    natGenderSplit,
    regGenderSplit,
    mapRegions,
    // User
    user
  }
}
