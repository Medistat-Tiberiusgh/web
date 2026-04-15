import { useState, useEffect, useRef } from 'react'
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
  const hasDataRef = useRef(false)

  useEffect(() => {
    if (!atcCode) {
      setData(null)
      hasDataRef.current = false
      return
    }

    if (!hasDataRef.current) setLoading(true)
    setError(null)

    const controller = new AbortController()

    gqlFetch<{ drugInfo: DrugInfo | null }>(DRUG_INFO_QUERY, { atcCode }, controller.signal)
      .then((res) => {
        hasDataRef.current = true
        setData(res.drugInfo)
      })
      .catch((e: Error) => {
        if (e.name !== 'AbortError') setError(e.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [atcCode])

  return { data, loading, error }
}
