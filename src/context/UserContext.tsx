import { createContext, useContext } from 'react'

export interface User {
  sub: string
  username: string
  regionId: number | null
  genderId: number | null
  ageGroupId: number | null
  avatarUrl: string | null
}

export const UserContext = createContext<User | null>(null)

export function useUser() {
  return useContext(UserContext)
}
