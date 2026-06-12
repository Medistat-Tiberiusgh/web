import { useState, useEffect } from 'react'
import type { User } from '../context/UserContext'
import type { UserMedication } from '../types'
import { gqlFetch } from '../lib/graphql'
import {
  MY_MEDICATIONS_QUERY,
  ADD_MEDICATION_MUTATION,
  REMOVE_MEDICATION_MUTATION
} from '../lib/queries'

// ── GraphQL calls ────────────────────────────────────────────────────────────
// Each talks to the API and hands back plain domain data — no React, no state.

async function fetchSavedMedications() {
  const data = await gqlFetch<{ me: { medications: UserMedication[] } }>(
    MY_MEDICATIONS_QUERY
  )
  return data.me.medications
}

async function saveMedication(atcCode: string, notes?: string) {
  const data = await gqlFetch<{ addMedication: UserMedication }>(
    ADD_MEDICATION_MUTATION,
    { atc: atcCode, notes }
  )
  return data.addMedication
}

function deleteMedication(atcCode: string) {
  return gqlFetch(REMOVE_MEDICATION_MUTATION, { atc: atcCode })
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useMedications(user: User | null) {
  const [medications, setMedications] = useState<UserMedication[]>([])
  const [error, setError] = useState<string | null>(null)

  // Reload whenever the logged-in identity changes — logging in updates the
  // user in place (no remount), so this is what reloads the list after OAuth.
  useEffect(() => {
    if (!user) {
      setMedications([])
      setError(null)
      return
    }

    let cancelled = false
    setError(null)

    fetchSavedMedications()
      .then((saved) => {
        if (!cancelled) setMedications(saved)
      })
      .catch((e) => {
        if (cancelled) return
        setMedications([])
        setError((e as Error).message)
      })

    return () => {
      cancelled = true
    }
  }, [user?.sub])

  async function addMedication(atcCode: string, notes?: string) {
    const saved = await saveMedication(atcCode, notes)
    setMedications((current) => [...current, saved])
  }

  async function removeMedication(atcCode: string) {
    await deleteMedication(atcCode)
    setMedications((current) =>
      current.filter((medication) => medication.drugData?.atcCode !== atcCode)
    )
  }

  return {
    medications,
    error,
    addMedication,
    removeMedication
  }
}
