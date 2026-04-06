import { useState, useEffect } from 'react'
import type { Drug } from '../types'
import { gqlFetch } from '../lib/graphql'
import { DRUGS_QUERY } from '../lib/queries'

export function useDrugs() {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    gqlFetch<{ drugs: Drug[] }>(DRUGS_QUERY)
      .then((data) => setDrugs(data.drugs))
      .finally(() => setLoading(false))
  }, [])

  return { drugs, loading }
}
