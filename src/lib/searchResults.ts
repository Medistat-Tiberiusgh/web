import type { AgeBand, Drug, Region } from '../types'

export const GENDER_OPTIONS = [
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' }
]

export interface SearchHandlers {
  activeDrug: Drug | null
  activeRegion: Region | null
  activeGender: string | null
  activeAgeBand: AgeBand | null
  onDrugChange: (d: Drug | null) => void
  onRegionChange: (r: Region | null) => void
  onGenderChange: (g: string | null) => void
  onAgeBandChange: (ab: AgeBand | null) => void
}

export interface SearchResults {
  regionResults: Region[]
  drugResults: Drug[]
  genderResults: typeof GENDER_OPTIONS
  ageBandResults: AgeBand[]
  searching: boolean
  query: string
}

/**
 * Filters the four searchable dimensions for the current query. Drugs arrive
 * pre-filtered from the server (see useDrugSearch); regions, gender, and age
 * bands are matched here against the in-memory lists.
 */
export function buildSearchResults(
  q: string,
  drugs: Drug[],
  isSearching: boolean,
  abands: AgeBand[],
  regions: Region[]
): SearchResults {
  return {
    regionResults:
      q.length >= 2
        ? regions
            .filter((r) => r.regionName.toLowerCase().includes(q.toLowerCase()))
            .slice(0, 5)
        : [],
    drugResults: drugs,
    genderResults:
      q.length >= 1
        ? GENDER_OPTIONS.filter(
            (g) =>
              g.label.toLowerCase().startsWith(q.toLowerCase()) ||
              g.key.startsWith(q.toLowerCase())
          )
        : [],
    ageBandResults:
      q.length >= 1 && abands.length > 0
        ? abands
            .filter((ab) => ab.name.toLowerCase().includes(q.toLowerCase()))
            .slice(0, 8)
        : [],
    searching: isSearching,
    query: q
  }
}
