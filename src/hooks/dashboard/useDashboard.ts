import { useMemo } from 'react'
import { AGE_BANDS } from '../../types'
import { useUser } from '../../context/UserContext'
import { useFilters } from './useFilters'
import { useDashboardData } from './useDashboardData'
import { useDashboardKPIs } from './useDashboardKPIs'
import { useMedications } from '../useMedications'
import { useRegions } from '../useRegions'
import { useYears } from '../useYears'
import { useProfile } from '../useProfile'

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
    error: medicationsError,
    addMedication,
    removeMedication
  } = useMedications(user)
  const { regions } = useRegions()
  const { years, earliestYear, latestYear } = useYears()

  const profile = useProfile()
  // Effective region: explicit filter → user's home region → none
  const effectiveRegionId = activeRegion?.id ?? profile.regionId ?? null

  // Numeric IDs for API — gender and age band are mutually exclusive (useFilters enforces this)
  const genderId =
    activeGender === 'men' ? 1 : activeGender === 'women' ? 2 : null
  const ageBandId = activeAgeBand?.id ?? null

  // Single GraphQL request fetches every chart's data — field-level args mean
  // each section gets its own filter shape without needing separate queries.
  const { national, regional, error } = useDashboardData({
    atcCode: activeDrug?.atcCode ?? null,
    region: effectiveRegionId,
    gender: genderId,
    ageGroup: ageBandId,
    year: activeYear
  })

  // We never clear `national`, so once the first fetch lands this stays true —
  // later filter/drug changes swap data without flashing back to a loader.
  const hasData = national !== null

  const regionName = useMemo(
    () => regions.find((r) => r.id === effectiveRegionId)?.regionName ?? null,
    [regions, effectiveRegionId]
  )

  // Bands are a fixed national standard, so we hardcode them rather than fetch
  // them — fewer moving parts, and the dropdown works before any drug is loaded.
  const availableAgeBands = AGE_BANDS

  const demographicLabel =
    activeGender === 'men'
      ? 'Men'
      : activeGender === 'women'
        ? 'Women'
        : activeAgeBand
          ? `${activeAgeBand.name} yrs`
          : null

  // ── Trend arrays ────────────────────────────────────────────────────────────

  const effectiveNationalTrend = national?.trend ?? []
  const effectiveRegionalTrend = regional?.trend

  // ── KPI values (delegated to useDashboardKPIs) ───────────────────────────────

  const kpis = useDashboardKPIs(national, regional, activeYear)

  // ── Chart data ───────────────────────────────────────────────────────────────

  // GenderGap chart always shows both genders — ignore the gender filter
  const nationalGenderSplit = national?.genderSplit ?? []
  const regionalGenderSplit = regional?.genderSplit

  // DemographicHeatmap chart always shows both genders — ignore the gender filter
  const nationalGrid = national?.demographicGrid ?? []
  const regionalGrid = regional?.demographicGrid ?? []

  const nationalAgeSplit = national?.ageSplit ?? []
  const regionalAgeSplit = regional?.ageSplit ?? []
  const mapRegions = national?.regionalPopularity ?? []
  const nationalAverage = kpis.nationalLatest?.per1000 ?? null

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
    medicationsError,
    addMedication,
    removeMedication,
    // Derived filters
    regions,
    years,
    earliestYear,
    latestYear,
    regionName,
    availableAgeBands,
    demographicLabel,
    // Loading
    hasData,
    error,
    // KPI values
    ...kpis,
    // Chart data
    effectiveNationalTrend,
    effectiveRegionalTrend,
    nationalAgeSplit,
    regionalAgeSplit,
    nationalGrid,
    regionalGrid,
    nationalGenderSplit,
    regionalGenderSplit,
    mapRegions,
    nationalAverage,
    // User
    user
  }
}

export type Db = ReturnType<typeof useDashboard>
