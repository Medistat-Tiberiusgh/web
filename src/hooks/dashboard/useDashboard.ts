import { useMemo } from 'react'
import { useUser } from '../../context/UserContext'
import { useFilters } from './useFilters'
import { useDashboardInsights } from './useDashboardInsights'
import { useAgeSplit } from './useAgeSplit'
import { useDemographicGrid } from './useDemographicGrid'
import { useDashboardKPIs } from './useDashboardKPIs'
import { useMedications } from '../useMedications'
import { useRegions } from '../useRegions'

/**
 * Central data hook for the dashboard. Owns all fetching, derived values, and
 * KPI calculations so the Dashboard component only deals with layout.
 */
export function useDashboard() {
  const user = useUser()!

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

  // ── KPI values (delegated to useDashboardKPIs) ───────────────────────────────

  const kpis = useDashboardKPIs(national, regional, activeYear)

  // ── Chart data ───────────────────────────────────────────────────────────────

  const natGenderSplit = useMemo(() => {
    const split = national?.genderSplit ?? []
    if (genderId == null) return split
    return split.filter((pt) => pt.genderId === genderId)
  }, [national?.genderSplit, genderId])

  const regGenderSplit = useMemo(() => {
    if (!regional?.genderSplit) return undefined
    if (genderId == null) return regional.genderSplit
    return regional.genderSplit.filter((pt) => pt.genderId === genderId)
  }, [regional?.genderSplit, genderId])

  // Heatmap always shows all age bands — only apply gender filter
  const filteredNatGrid = useMemo(() => {
    if (genderId == null) return natGrid
    return natGrid.filter((cell) => cell.genderId === genderId)
  }, [natGrid, genderId])

  const filteredRegGrid = useMemo(() => {
    if (genderId == null) return regGrid
    return regGrid.filter((cell) => cell.genderId === genderId)
  }, [regGrid, genderId])

  const mapRegions = national?.regionalPopularity ?? []
  const nationalAverage = kpis.natLatest?.per1000 ?? null

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
    ...kpis,
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
    nationalAverage,
    // User
    user
  }
}
