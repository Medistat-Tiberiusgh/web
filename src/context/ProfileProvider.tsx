import { useEffect, useState, type ReactNode } from 'react'
import { useUser, type User } from './UserContext'
import {
  ProfileContext,
  EMPTY_PROFILE,
  type Demographics,
  type Profile
} from './ProfileContext'
import { gqlFetch } from '../lib/graphql'
import { PROFILE_QUERY, UPDATE_PROFILE_MUTATION } from '../lib/queries'

// ── GraphQL calls ────────────────────────────────────────────────────────────

async function fetchProfile() {
  const data = await gqlFetch<{ me: Profile }>(PROFILE_QUERY)
  return data.me
}

async function updateProfile(demographics: Demographics) {
  const data = await gqlFetch<{ updateProfile: Demographics }>(
    UPDATE_PROFILE_MUTATION,
    { input: demographics }
  )
  return data.updateProfile
}

// ── Provider ─────────────────────────────────────────────────────────────────

interface LoadedProfile {
  user: User
  profile: Profile
}

export default function ProfileProvider({ children }: { children: ReactNode }) {
  const user = useUser()
  const [loaded, setLoaded] = useState<LoadedProfile | null>(null)

  // Keyed on the user object, not just its id: linking a provider signs in
  // again as the same user, and the provider list must reload then too.
  useEffect(() => {
    if (!user) return

    let cancelled = false

    fetchProfile()
      .then((profile) => {
        if (!cancelled) setLoaded({ user, profile })
      })
      .catch(() => {
        if (!cancelled) setLoaded(null)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const profile = loaded?.user === user ? loaded.profile : EMPTY_PROFILE

  async function saveDemographics(demographics: Demographics) {
    const saved = await updateProfile(demographics)
    setLoaded(
      (current) =>
        current && { ...current, profile: { ...current.profile, ...saved } }
    )
  }

  return (
    <ProfileContext.Provider value={{ ...profile, saveDemographics }}>
      {children}
    </ProfileContext.Provider>
  )
}
