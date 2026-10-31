import { createContext, useContext } from 'react'

export interface Demographics {
  regionId: number | null
  genderId: number | null
  ageGroupId: number | null
}

export interface Profile extends Demographics {
  providers: string[]
}

interface ProfileContextValue extends Profile {
  saveDemographics: (demographics: Demographics) => Promise<void>
}

export const EMPTY_PROFILE: Profile = {
  providers: [],
  regionId: null,
  genderId: null,
  ageGroupId: null
}

export const ProfileContext = createContext<ProfileContextValue>({
  ...EMPTY_PROFILE,
  saveDemographics: async () => {}
})

export function useProfile() {
  return useContext(ProfileContext)
}
