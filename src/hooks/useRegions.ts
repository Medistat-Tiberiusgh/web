import type { Region } from '../types'
import { useGqlQuery } from '../lib/useGqlQuery'
import { REGIONS_QUERY } from '../lib/queries'

export function useRegions() {
  const { data: regions } = useGqlQuery<Region[]>(
    REGIONS_QUERY,
    {},
    { initialData: [] }
  )
  return { regions }
}
