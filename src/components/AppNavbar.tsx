import { useState, useRef, useEffect, useCallback } from 'react'
import { useUser } from '../context/UserContext'
import { useRegions } from '../hooks/useRegions'
import { gqlFetch } from '../lib/graphql'
import { SEARCH_DRUGS_QUERY } from '../lib/queries'
import type { AgeBand } from '../hooks/useFilters'
import type { Drug, Region } from '../types'

const YEARS = Array.from({ length: 19 }, (_, i) => 2024 - i)

const GENDER_OPTIONS = [
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
]

interface Props {
  onLogout: () => void
  // Controlled values — owned by Dashboard, not by this component
  activeDrug: Drug | null
  activeRegion: Region | null
  activeYear: number | null
  activeGender: string | null
  activeAgeBand: AgeBand | null
  availableAgeBands: AgeBand[]
  // Callbacks to request state changes
  onDrugChange: (drug: Drug | null) => void
  onRegionChange: (region: Region | null) => void
  onYearChange: (year: number | null) => void
  onGenderChange: (gender: string | null) => void
  onAgeBandChange: (ageBand: AgeBand | null) => void
}

export default function AppNavbar({
  onLogout,
  activeDrug,
  activeRegion,
  activeYear,
  activeGender,
  activeAgeBand,
  availableAgeBands,
  onDrugChange,
  onRegionChange,
  onYearChange,
  onGenderChange,
  onAgeBandChange,
}: Props) {
  const user = useUser()
  const { regions } = useRegions()

  // Pure UI state — not shared with Dashboard
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [drugResults, setDrugResults] = useState<Drug[]>([])
  const [searching, setSearching] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Search results derived from query + current active state
  const regionResults =
    !activeRegion && query.length >= 2
      ? regions.filter((r) => r.regionName.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
      : []

  const genderResults =
    !activeGender && query.length >= 1
      ? GENDER_OPTIONS.filter(
          (g) =>
            g.label.toLowerCase().startsWith(query.toLowerCase()) ||
            g.key.startsWith(query.toLowerCase())
        )
      : []

  const ageBandResults =
    !activeAgeBand && query.length >= 1
      ? availableAgeBands
          .filter((ab) => ab.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 8)
      : []

  const hasResults =
    regionResults.length > 0 ||
    drugResults.length > 0 ||
    genderResults.length > 0 ||
    ageBandResults.length > 0 ||
    searching

  const allFilled =
    !!activeRegion &&
    !!activeDrug &&
    !!activeGender &&
    !!activeAgeBand &&
    availableAgeBands.length > 0

  // Debounced drug search — only fires when no drug is active yet
  const searchDrugs = useCallback(async (q: string) => {
    setSearching(true)
    try {
      const data = await gqlFetch<{ searchDrugs: Drug[] }>(SEARCH_DRUGS_QUERY, { query: q })
      setDrugResults(data.searchDrugs)
    } catch {
      setDrugResults([])
    } finally {
      setSearching(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (activeDrug || query.length < 2) {
      setDrugResults([])
      return
    }
    debounceRef.current = setTimeout(() => searchDrugs(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, activeDrug, searchDrugs])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  function handleQueryChange(val: string) {
    setQuery(val)
    if (!allFilled) setOpen(val.length >= 1)
  }

  function handleClearQuery() {
    setQuery('')
    setDrugResults([])
    setOpen(false)
  }

  function selectDrug(drug: Drug) {
    onDrugChange(drug)
    setQuery('')
    setDrugResults([])
    setOpen(false)
  }

  function selectRegion(region: Region) {
    onRegionChange(region)
    setQuery('')
    setOpen(false)
  }

  function selectGender(key: string) {
    onGenderChange(key)
    setQuery('')
    setOpen(false)
  }

  function selectAgeBand(ab: AgeBand) {
    onAgeBandChange(ab)
    setQuery('')
    setOpen(false)
  }

  const genderLabel = (key: string) => GENDER_OPTIONS.find((g) => g.key === key)?.label ?? key

  const placeholder = (() => {
    if (allFilled) return ''
    const missing: string[] = []
    if (!activeDrug) missing.push('medication')
    if (!activeRegion) missing.push('region')
    if (!activeGender) missing.push('gender')
    if (availableAgeBands.length > 0 && !activeAgeBand) missing.push('age band')
    return missing.length > 0 ? `Search ${missing.slice(0, 3).join(', ')}…` : ''
  })()

  return (
    <nav className="border-b border-gray-200 bg-white grid grid-cols-[auto_1fr_auto] items-center gap-6 px-8 py-3 shrink-0">
      <span className="text-3xl font-bold text-blue-700">Medistat</span>

      <div ref={containerRef} className="relative w-full max-w-2xl justify-self-center">
        {/* Expandable tag-input bar */}
        <div
          className="flex flex-wrap items-center gap-2 px-4 py-2.5 min-h-12 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white cursor-text transition-colors"
          onClick={() => inputRef.current?.focus()}
        >
          {/* Search icon */}
          <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>

          {/* Tags — rendered in fixed order based on what's active */}
          {activeRegion && (
            <span className="inline-flex items-center gap-2 shrink-0 bg-teal-100 text-teal-800 text-base font-semibold px-4 py-2 rounded-full whitespace-nowrap">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {activeRegion.regionName}
              <button onClick={() => onRegionChange(null)} className="ml-0.5 text-teal-400 hover:text-teal-800 text-lg leading-none" aria-label="Remove region filter">×</button>
            </span>
          )}

          {activeDrug && (
            <span className="inline-flex items-center gap-2 shrink-0 bg-blue-100 text-blue-800 text-base font-semibold px-4 py-2 rounded-full max-w-64 min-w-0">
              <span className="truncate">{activeDrug.name}</span>
              {activeDrug.narcoticClass && <span className="text-orange-600 font-bold shrink-0">·N</span>}
              <button onClick={() => onDrugChange(null)} className="ml-0.5 shrink-0 text-blue-400 hover:text-blue-800 text-lg leading-none" aria-label="Remove drug filter">×</button>
            </span>
          )}

          {activeGender && (
            <span className="inline-flex items-center gap-2 shrink-0 bg-rose-100 text-rose-800 text-base font-semibold px-4 py-2 rounded-full whitespace-nowrap">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {genderLabel(activeGender)}
              <button onClick={() => onGenderChange(null)} className="ml-0.5 text-rose-400 hover:text-rose-800 text-lg leading-none" aria-label="Remove gender filter">×</button>
            </span>
          )}

          {activeAgeBand && (
            <span className="inline-flex items-center gap-2 shrink-0 bg-amber-100 text-amber-800 text-base font-semibold px-4 py-2 rounded-full whitespace-nowrap">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {activeAgeBand.name} yrs
              <button onClick={() => onAgeBandChange(null)} className="ml-0.5 text-amber-500 hover:text-amber-800 text-lg leading-none" aria-label="Remove age band filter">×</button>
            </span>
          )}

          {/* Year — always a pill with an overlaid native select for both active and inactive states */}
          <span className={`relative inline-flex items-center gap-2 shrink-0 text-base font-semibold px-4 py-2 rounded-full whitespace-nowrap cursor-pointer transition-colors
            ${activeYear !== null ? 'bg-violet-100 text-violet-800 hover:bg-violet-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            <svg className="w-4 h-4 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="pointer-events-none">{activeYear ?? 'Year'}</span>
            {activeYear === null && (
              <svg className="w-3.5 h-3.5 shrink-0 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
            {activeYear !== null && (
              <button
                onClick={(e) => { e.stopPropagation(); onYearChange(null) }}
                className="relative z-10 ml-0.5 text-violet-400 hover:text-violet-800 text-lg leading-none"
                aria-label="Remove year filter"
              >×</button>
            )}
            <select
              value={activeYear ?? ''}
              onChange={(e) => e.target.value && onYearChange(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Filter by year"
            >
              {activeYear === null && <option value="" disabled>Year</option>}
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </span>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-w-32 bg-transparent outline-none text-base text-gray-700 placeholder-gray-400"
          />

          {query && (
            <button
              onClick={handleClearQuery}
              className="shrink-0 w-6 h-6 rounded-full bg-gray-300 hover:bg-gray-400 text-white flex items-center justify-center text-sm leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && hasResults && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {regionResults.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
                  Regions
                </div>
                {regionResults.map((region) => (
                  <button
                    key={region.id}
                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectRegion(region)}
                  >
                    <svg className="w-3.5 h-3.5 text-teal-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-base text-gray-900">{region.regionName}</span>
                  </button>
                ))}
              </>
            )}

            {(drugResults.length > 0 || searching) && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
                  Medications
                </div>
                {searching && drugResults.length === 0 ? (
                  <div className="px-4 py-3 text-base text-gray-400">Searching…</div>
                ) : (
                  drugResults.map((drug) => (
                    <button
                      key={drug.atcCode}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between gap-4"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectDrug(drug)}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-base text-gray-900 truncate">{drug.name}</span>
                        <span className="text-sm text-gray-400">{drug.atcCode}</span>
                      </div>
                      {drug.narcoticClass && (
                        <span className="text-sm font-semibold text-orange-600 shrink-0">
                          Class {drug.narcoticClass}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </>
            )}

            {genderResults.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
                  Gender
                </div>
                {genderResults.map((g) => (
                  <button
                    key={g.key}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectGender(g.key)}
                  >
                    <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-base text-gray-900">{g.label}</span>
                  </button>
                ))}
              </>
            )}

            {ageBandResults.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
                  Age Band
                </div>
                {ageBandResults.map((ab) => (
                  <button
                    key={ab.id}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectAgeBand(ab)}
                  >
                    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-base text-gray-900">{ab.name} yrs</span>
                  </button>
                ))}
              </>
            )}

            {!searching &&
              regionResults.length === 0 &&
              drugResults.length === 0 &&
              genderResults.length === 0 &&
              ageBandResults.length === 0 && (
                <div className="px-4 py-3 text-base text-gray-400">
                  No results for &ldquo;{query}&rdquo;
                </div>
              )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <span className="text-base font-semibold text-gray-900">{user?.username ?? 'Guest'}</span>
        <button
          title="Log out"
          onClick={onLogout}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
