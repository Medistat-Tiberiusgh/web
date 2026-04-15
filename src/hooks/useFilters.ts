import { useState } from 'react'
import type { Drug, Region } from '../types'

export interface Filters {
  activeDrug: Drug | null
  activeRegion: Region | null
  activeYear: number | null
  activeGender: string | null
  activeAgeBand: string | null
  setActiveDrug: (drug: Drug | null) => void
  setActiveRegion: (region: Region | null) => void
  setActiveYear: (year: number | null) => void
  setActiveGender: (gender: string | null) => void
  setActiveAgeBand: (ageBand: string | null) => void
}

/**
 * Owns all active filter selections for the dashboard.
 * Both the search bar and the medication sidebar write to these —
 * they share a single source of truth instead of each holding their own copy.
 */
export function useFilters(): Filters {
  const [activeDrug, setActiveDrug] = useState<Drug | null>(null)
  const [activeRegion, setActiveRegion] = useState<Region | null>(null)
  const [activeYear, setActiveYear] = useState<number | null>(null)
  const [activeGender, setActiveGender] = useState<string | null>(null)
  const [activeAgeBand, setActiveAgeBand] = useState<string | null>(null)

  return {
    activeDrug,
    activeRegion,
    activeYear,
    activeGender,
    activeAgeBand,
    setActiveDrug,
    setActiveRegion,
    setActiveYear,
    setActiveGender,
    setActiveAgeBand,
  }
}
