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
        ? chronicUseRatio -
          prevTrend.totalPrescriptions / prevTrend.totalPatients
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

    return {
      latestTrend,
      prevTrend,
      natLatest,
      regLatest,
      chronicUseRatio,
      patientsPct,
      per1000Diff,
      ratioDiff,
      natChronicRatio,
      per1000DeltaVsNat,
      ratioDeltaVsNat
    }
  }, [national, regional, activeYear])
}
