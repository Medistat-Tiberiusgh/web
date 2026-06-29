import { useGqlQuery } from '../lib/useGqlQuery'
import { useUser } from '../context/UserContext'
import { PROFILE_QUERY } from '../lib/queries'

interface Profile {
  providers: string[]
  regionId: number | null
  genderId: number | null
  ageGroupId: number | null
}

export function useProfile(): Profile {
  const user = useUser()
  const { data } = useGqlQuery<{ me: Profile }>(
    PROFILE_QUERY,
    {},
    {
      initialData: {
        me: { providers: [], regionId: null, genderId: null, ageGroupId: null }
      },
      enabled: !!user
    }
  )
  return data.me
}
