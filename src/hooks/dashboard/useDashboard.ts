import { useMemo } from 'react'
import { useUser } from '../../context/UserContext'
import { useFilters } from './useFilters'
import { useDashboardData } from './useDashboardData'
import { useDashboardKPIs } from './useDashboardKPIs'
import { useMedications } from '../useMedications'
import { useRegions } from '../useRegions'

/**
 * Central data hook for the dashboard. Owns all fetching, derived values, and
 * KPI calculations so the Dashboard component only deals with layout.
 */
export function useDashboard() {
  const user = useUser()

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
  const effectiveRegionId = activeRegion?.id ?? user?.regionId ?? null

  // Numeric IDs for API — gender and age band are mutually exclusive (useFilters enforces this)
  const genderId =
    activeGender === 'men' ? 1 : activeGender === 'women' ? 2 : null
  const ageBandId = activeAgeBand?.id ?? null

  // Single GraphQL request fetches every chart's data — field-level args mean
  // each section gets its own filter shape without needing separate queries.
  const { national, regional, loading } = useDashboardData({
    atcCode: activeDrug?.atcCode ?? null,
    region: effectiveRegionId,
    gender: genderId,
    ageGroup: ageBandId,
    year: activeYear
  })

  const regionName = useMemo(
    () => regions.find((r) => r.id === effectiveRegionId)?.regionName ?? null,
    [regions, effectiveRegionId]
  )

  // Always-complete list for the age band dropdown — ageSplit is never filtered by ageGroup
  const availableAgeBands = useMemo(() => {
    const seen = new Set<number>()
    return [...(national?.ageSplit ?? [])]
      .sort((a, b) => a.ageGroupId - b.ageGroupId)
      .filter((pt) => !seen.has(pt.ageGroupId) && seen.add(pt.ageGroupId))
      .map((pt) => ({ name: pt.ageGroupName, id: pt.ageGroupId }))
  }, [national?.ageSplit])

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

  // GenderGap chart always shows both genders — ignore the gender filter
  const natGenderSplit = national?.genderSplit ?? []
  const regGenderSplit = regional?.genderSplit

  // Heatmap always shows all age bands — only apply gender filter
  const filteredNatGrid = useMemo(() => {
    const grid = national?.demographicGrid ?? []
    if (genderId == null) return grid
    return grid.filter((cell) => cell.genderId === genderId)
  }, [national?.demographicGrid, genderId])

  const filteredRegGrid = useMemo(() => {
    const grid = regional?.demographicGrid ?? []
    if (genderId == null) return grid
    return grid.filter((cell) => cell.genderId === genderId)
  }, [regional?.demographicGrid, genderId])

  const natAgeSplit = national?.ageSplit ?? []
  const regAgeSplit = regional?.ageSplit ?? []
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
