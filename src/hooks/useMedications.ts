import { useState, useEffect, useCallback } from 'react'
import type { UserMedication } from '../types'
import { gqlFetch } from '../lib/graphql'
import {
  MY_MEDICATIONS_QUERY,
  MY_MEDICATIONS_WITH_INSIGHTS_QUERY,
  ADD_MEDICATION_MUTATION,
  UPDATE_MEDICATION_MUTATION,
  REMOVE_MEDICATION_MUTATION,
} from '../lib/queries'

export function useMedications() {
  const [medications, setMedications] = useState<UserMedication[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const selectedMedication = selectedIndex !== null ? medications[selectedIndex] : null
  const regions = selectedMedication?.insights?.regionalPopularity ?? []

  useEffect(() => {
    async function fetchMedications() {
      try {
        const data = await gqlFetch<{ myMedications: UserMedication[] }>(MY_MEDICATIONS_QUERY)
        setMedications(data.myMedications)
      } finally {
        setLoading(false)
      }
    }
    fetchMedications()
  }, [])

  const selectMedication = useCallback(async (index: number) => {
    setSelectedIndex(index)

    // If insights are already cached for this medication, nothing to do
    if (medications[index]?.insights) return

    setLoadingInsights(true)
    try {
      const data = await gqlFetch<{
        myMedications: Pick<UserMedication, 'drugData' | 'insights'>[]
      }>(MY_MEDICATIONS_WITH_INSIGHTS_QUERY)

      // Merge insights into existing medication state by atcCode
      setMedications((prev) =>
        prev.map((med) => {
          const withInsights = data.myMedications.find(
            (m) => m.drugData?.atcCode === med.drugData?.atcCode
          )
          return withInsights?.insights ? { ...med, insights: withInsights.insights } : med
        })
      )
    } finally {
      setLoadingInsights(false)
    }
  }, [medications])

  async function addMedication(atc: string, notes?: string) {
    const data = await gqlFetch<{ addMedication: UserMedication }>(ADD_MEDICATION_MUTATION, {
      atc,
      notes,
    })
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
    if (selectedMedication?.drugData?.atcCode === atc) setSelectedIndex(null)
  }

  return {
    medications,
    loading,
    loadingInsights,
    selectedIndex,
    selectedMedication,
    regions,
    selectMedication,
    addMedication,
    updateMedication,
    removeMedication,
  }
}
