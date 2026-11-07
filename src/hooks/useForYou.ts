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

// Built with a fixed key order, since useGqlQuery compares variables as JSON.
function groupVariable(group: Demographics) {
  return {
    regionId: group.regionId,
    genderId: group.genderId,
    ageGroupId: group.ageGroupId
  }
}

/** The For you highlights for `group` — the saved profile or an explored one. */
export function useForYou(group: Demographics) {
  const { data, loading, error } = useGqlQuery<{
    me: { forYou: ForYouData | null }
  }>(
    FOR_YOU_QUERY,
    { group: groupVariable(group) },
    {
      initialData: { me: { forYou: null } },
      enabled: hasDemographics(group)
    }
  )
  return { forYou: data.me.forYou, loading, error }
}

/** Rising and declining drugs for `group` over the last `years` (3, 5 or 10). */
export function useForYouChanges(group: Demographics, years: number) {
  const { data, loading, error } = useGqlQuery<{
    me: { forYou: { changes: ChangesData } | null }
  }>(
    FOR_YOU_CHANGES_QUERY,
    { group: groupVariable(group), years },
    {
      initialData: { me: { forYou: null } },
      enabled: hasDemographics(group)
    }
  )
  return { changes: data.me.forYou?.changes ?? null, loading, error }
}
