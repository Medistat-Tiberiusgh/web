import { useMemo } from 'react'
import type { TrendPoint } from '../../types'

interface HasTrend {
  trend: TrendPoint[]
}

export function useDashboardKPIs(
  national: HasTrend | null,
  regional: HasTrend | null,
  activeYear: number | null
) {
  return useMemo(() => {
    const nationalTrend = national?.trend ?? []
    const regionalTrend = regional?.trend ?? []

    const nationalLatestPoint = activeYear
      ? (nationalTrend.find((t) => t.year === activeYear) ?? null)
      : (nationalTrend.at(-1) ?? null)
    const nationalPreviousPoint = activeYear
      ? (nationalTrend.find((t) => t.year === activeYear - 1) ?? null)
      : (nationalTrend.at(-2) ?? null)
    const regionalLatestPoint = activeYear
      ? (regionalTrend.find((t) => t.year === activeYear) ?? null)
      : (regionalTrend.at(-1) ?? null)
    const regionalPreviousPoint = activeYear
      ? (regionalTrend.find((t) => t.year === activeYear - 1) ?? null)
      : (regionalTrend.at(-2) ?? null)

    // Only use rows with real patient data (demographic-split rows have 0 patients)
    const nationalLatest = nationalLatestPoint?.totalPatients ? nationalLatestPoint : null
    const nationalPrevious = nationalPreviousPoint?.totalPatients ? nationalPreviousPoint : null
    const regionalLatest = regionalLatestPoint?.totalPatients ? regionalLatestPoint : null
    const regionalPrevious = regionalPreviousPoint?.totalPatients ? regionalPreviousPoint : null

    const latestTrend = regionalLatest ?? nationalLatest
    const previousTrend = regionalPrevious ?? nationalPrevious

    const chronicUseRatio =
      latestTrend && latestTrend.totalPatients > 0
        ? latestTrend.totalPrescriptions / latestTrend.totalPatients
        : null

    const patientsPct =
      latestTrend && previousTrend && previousTrend.totalPatients > 0
        ? ((latestTrend.totalPatients - previousTrend.totalPatients) /
            previousTrend.totalPatients) *
          100
        : null

    const per1000Diff =
      latestTrend && previousTrend ? latestTrend.per1000 - previousTrend.per1000 : null

    const ratioDiff =
      chronicUseRatio != null && previousTrend && previousTrend.totalPatients > 0
        ? chronicUseRatio -
          previousTrend.totalPrescriptions / previousTrend.totalPatients
        : null

    const nationalChronicRatio =
      nationalLatest && nationalLatest.totalPatients > 0
        ? nationalLatest.totalPrescriptions / nationalLatest.totalPatients
        : null

    const per1000DeltaVsNat =
      regionalLatest && nationalLatest && nationalLatest.per1000 > 0
        ? ((regionalLatest.per1000 - nationalLatest.per1000) / nationalLatest.per1000) * 100
        : null

    const ratioDeltaVsNat =
      regionalLatest != null &&
      chronicUseRatio != null &&
      nationalChronicRatio != null &&
      nationalChronicRatio > 0
        ? ((chronicUseRatio - nationalChronicRatio) / nationalChronicRatio) * 100
        : null

    return {
      latestTrend,
      previousTrend,
      nationalLatest,
      regionalLatest,
      chronicUseRatio,
      patientsPct,
      per1000Diff,
      ratioDiff,
      nationalChronicRatio,
      per1000DeltaVsNat,
      ratioDeltaVsNat
    }
  }, [national, regional, activeYear])
}
