import { useGqlQuery } from '../lib/useGqlQuery'
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
  const { data, loading, error } = useGqlQuery<{ drugInfo: DrugInfo | null }>(
    DRUG_INFO_QUERY,
    { atcCode },
    { initialData: { drugInfo: null }, enabled: !!atcCode }
  )
  return { data: data.drugInfo, loading, error }
}
