import { useState, useEffect } from 'react'
import { gqlFetch } from '../lib/graphql'
import { DRUG_INFO_QUERY } from '../lib/queries'

export interface DrugInfo {
  atcCode: string
  indication: string | null
  howToUse: string | null
  otherUses: string | null
  precautions: string | null
  sideEffects: string | null
  otherInfo: string | null
  sourceUrl: string
  cachedAt: string
}

export function useDrugInfo(atcCode: string | null) {
  const [data, setData] = useState<DrugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!atcCode) {
      setData(null)
      return
    }

    // Only show skeleton when there's nothing to display yet
    if (!data) setLoading(true)
    setError(null)

    gqlFetch<{ drugInfo: DrugInfo | null }>(DRUG_INFO_QUERY, { atcCode })
      .then((res) => setData(res.drugInfo))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [atcCode])

  return { data, loading, error }
}
