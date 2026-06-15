import type { Region } from '../types'
import { useGqlQuery } from '../lib/useGqlQuery'
import { REGIONS_QUERY } from '../lib/queries'

export function useRegions() {
  const { data } = useGqlQuery<{ regions: Region[] }>(
    REGIONS_QUERY,
    {},
    { initialData: { regions: [] } }
  )
  return { regions: data.regions }
}
