import { useState, useEffect } from 'react'
import type { Medication, Region } from '../types'
import { mockMedications } from '../mock/medications'

export function useMedications() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loadingList, setLoadingList] = useState(true)

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [regions, setRegions] = useState<Region[]>([])
  const [loadingRegions, setLoadingRegions] = useState(false)

  useEffect(() => {
    async function fetchMedications() {
      // TODO: replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 300))
      setMedications(mockMedications)
      setLoadingList(false)
    }
    fetchMedications()
  }, [])

  async function selectMedication(index: number) {
    setSelectedIndex(index)
    setLoadingRegions(true)

    // TODO: replace with real API call, e.g.:
    // const data = await fetchInsights(medications[index].drugData.atcCode)
    // setRegions(data.insights.regionalPopularity)

    await new Promise((resolve) => setTimeout(resolve, 300))
    setRegions(medications[index].insights.regionalPopularity)
    setLoadingRegions(false)
  }

  return {
    medications,
    loadingList,
    selectedIndex,
    regions,
    loadingRegions,
    selectMedication
  }
}
