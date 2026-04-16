import { useState } from 'react'
import type { Drug, Region } from '../types'

export interface AgeBand {
  name: string
  id: number
}

export interface Filters {
  activeDrug: Drug | null
  activeRegion: Region | null
  activeYear: number | null
  activeGender: string | null
  activeAgeBand: AgeBand | null
  setActiveDrug: (drug: Drug | null) => void
  setActiveRegion: (region: Region | null) => void
  setActiveYear: (year: number | null) => void
  setActiveGender: (gender: string | null) => void
  setActiveAgeBand: (ageBand: AgeBand | null) => void
}

/**
 * Owns all active filter selections for the dashboard.
 * Both the search bar and the medication sidebar write to these —
 * they share a single source of truth instead of each holding their own copy.
 *
 * Gender and age band are mutually exclusive: activating one clears the other,
 * because the API applies them to the same trend query and they conflict.
 */
export function useFilters(): Filters {
  const [activeDrug, setActiveDrug] = useState<Drug | null>(null)
  const [activeRegion, setActiveRegion] = useState<Region | null>(null)
  const [activeYear, setActiveYear] = useState<number | null>(null)
  const [activeGender, setActiveGenderRaw] = useState<string | null>(null)
  const [activeAgeBand, setActiveAgeBandRaw] = useState<AgeBand | null>(null)

  function setActiveGender(gender: string | null) {
    setActiveGenderRaw(gender)
    if (gender !== null) setActiveAgeBandRaw(null)
  }

  function setActiveAgeBand(ageBand: AgeBand | null) {
    setActiveAgeBandRaw(ageBand)
    if (ageBand !== null) setActiveGenderRaw(null)
  }

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
