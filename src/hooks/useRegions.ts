import { useState, useEffect } from 'react'
import type { Region } from '../types'
import { gqlFetch } from '../lib/graphql'
import { REGIONS_QUERY } from '../lib/queries'

export function useRegions() {
  const [regions, setRegions] = useState<Region[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const data = await gqlFetch<{ regions: Region[] }>(REGIONS_QUERY)
        setRegions(data.regions)
      } catch (e) {
        setError((e as Error).message)
      }
    }
    load()
  }, [])

  return { regions, error }
}
