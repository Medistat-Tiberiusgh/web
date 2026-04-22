import { useState, useEffect } from 'react'
import type { UserMedication } from '../types'
import { gqlFetch } from '../lib/graphql'
import {
  MY_MEDICATIONS_QUERY,
  ADD_MEDICATION_MUTATION,
  UPDATE_MEDICATION_MUTATION,
  REMOVE_MEDICATION_MUTATION
} from '../lib/queries'

export function useMedications() {
  const [medications, setMedications] = useState<UserMedication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await gqlFetch<{ me: { medications: UserMedication[] } }>(
          MY_MEDICATIONS_QUERY
        )
        setMedications(data.me.medications)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function addMedication(atc: string, notes?: string) {
    const data = await gqlFetch<{ addMedication: UserMedication }>(
      ADD_MEDICATION_MUTATION,
      { atc, notes }
    )
    setMedications((prev) => [...prev, data.addMedication])
  }

  async function updateMedication(atc: string, notes: string) {
    const data = await gqlFetch<{ updateMedication: UserMedication }>(
      UPDATE_MEDICATION_MUTATION,
      { atc, notes }
    )
    setMedications((prev) =>
      prev.map((m) => (m.drugData?.atcCode === atc ? data.updateMedication : m))
    )
  }

  async function removeMedication(atc: string) {
    await gqlFetch(REMOVE_MEDICATION_MUTATION, { atc })
    setMedications((prev) => prev.filter((m) => m.drugData?.atcCode !== atc))
  }

  return {
    medications,
    loading,
    addMedication,
    updateMedication,
    removeMedication
  }
}
