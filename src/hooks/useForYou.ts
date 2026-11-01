import { useGqlQuery } from '../lib/useGqlQuery'
import { FOR_YOU_QUERY } from '../lib/queries'
import { hasDemographics, type Demographics } from '../context/ProfileContext'
import type { Drug } from '../types'

export interface ForYouData {
  /** The group each "Stands out" ratio compares against; null means "all" */
  comparedWith: Demographics
  latestYear: number
  trendStartYear: number
  standsOut: { drug: Drug; ratio: number }[]
  mostDispensed: { drug: Drug; per1000: number }[]
  rising: {
    drug: Drug
    growth: number
    trend: { year: number; per1000: number }[]
  }[]
}

export function useForYou(demographics: Demographics) {
  const { data, loading, error } = useGqlQuery<{ forYou: ForYouData | null }>(
    FOR_YOU_QUERY,
    {
      region: demographics.regionId,
      gender: demographics.genderId,
      ageGroup: demographics.ageGroupId
    },
    { initialData: { forYou: null }, enabled: hasDemographics(demographics) }
  )
  return { forYou: data.forYou, loading, error }
}
