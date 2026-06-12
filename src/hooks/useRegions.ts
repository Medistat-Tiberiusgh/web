import type { Region } from '../types'
import { useGqlQuery } from '../lib/useGqlQuery'
import { REGIONS_QUERY } from '../lib/queries'

export function useRegions() {
  const { data: regions, error } = useGqlQuery<Region[]>(
    REGIONS_QUERY,
    {},
    { initialData: [] }
  )
  return { regions, error }
}
