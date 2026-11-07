import { useGqlQuery } from '../lib/useGqlQuery'
import { FOR_YOU_QUERY, FOR_YOU_CHANGES_QUERY } from '../lib/queries'
import { hasDemographics, type Demographics } from '../context/ProfileContext'
import type { Drug } from '../types'

export interface ComparisonItem {
  drug: Drug
  per1000: number
  baselinePer1000: number
  ratio: number
}

export interface MostDispensedItem {
  drug: Drug
  per1000: number
  baselinePer1000: number | null
}

export interface GrowthItem {
  drug: Drug
  /** Latest rate divided by the rate in startYear */
  growth: number
  trend: { year: number; per1000: number }[]
}

export interface ForYouData {
  /** The group every comparison is made against; null means "all" */
  comparedWith: Demographics
  latestYear: number
  moreCommon: ComparisonItem[]
  lessCommon: ComparisonItem[]
  mostDispensed: MostDispensedItem[]
}

export interface ChangesData {
  startYear: number
  rising: GrowthItem[]
  declining: GrowthItem[]
}

// The server reads the signed-in user's saved demographics itself; the ones
// passed here only decide whether there is anything to ask for.
export function useForYou(demographics: Demographics) {
  const { data, loading, error } = useGqlQuery<{
    me: { forYou: ForYouData | null }
  }>(
    FOR_YOU_QUERY,
    {},
    {
      initialData: { me: { forYou: null } },
      enabled: hasDemographics(demographics)
    }
  )
  return { forYou: data.me.forYou, loading, error }
}

/** Rising and declining drugs over the last `years` (3, 5 or 10). */
export function useForYouChanges(demographics: Demographics, years: number) {
  const { data, loading, error } = useGqlQuery<{
    me: { forYou: { changes: ChangesData } | null }
  }>(
    FOR_YOU_CHANGES_QUERY,
    { years },
    {
      initialData: { me: { forYou: null } },
      enabled: hasDemographics(demographics)
    }
  )
  return { changes: data.me.forYou?.changes ?? null, loading, error }
}
