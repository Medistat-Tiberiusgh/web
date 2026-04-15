import { useState, useEffect } from 'react'
import type { Region } from '../types'
import { gqlFetch } from '../lib/graphql'
import { REGIONS_QUERY } from '../lib/queries'

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([])

  useEffect(() => {
    gqlFetch<{ regions: Region[] }>(REGIONS_QUERY)
      .then((data) => setRegions(data.regions))
  }, [])

  return { regions }
}
