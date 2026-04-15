import { useState, useRef, useEffect, useCallback } from 'react'
import { useUser } from '../context/UserContext'
import { useRegions } from '../hooks/useRegions'
import { gqlFetch } from '../lib/graphql'
import { SEARCH_DRUGS_QUERY } from '../lib/queries'
import type { Drug, Region } from '../types'

const YEARS = Array.from({ length: 19 }, (_, i) => 2024 - i)

const GENDER_OPTIONS = [
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
]

type TagType = 'region' | 'drug' | 'gender' | 'ageBand'

interface Props {
  onLogout: () => void
  onDrugChange: (drug: Drug | null) => void
  onRegionChange: (region: Region | null) => void
  onYearChange: (year: number | null) => void
  onGenderChange: (gender: string | null) => void
  onAgeBandChange: (ageBand: string | null) => void
  availableAgeBands: string[]
}

export default function AppNavbar({
  onLogout,
  onDrugChange,
  onRegionChange,
  onYearChange,
  onGenderChange,
  onAgeBandChange,
  availableAgeBands,
}: Props) {
  const user = useUser()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedGender, setSelectedGender] = useState<string | null>(null)
  const [selectedAgeBand, setSelectedAgeBand] = useState<string | null>(null)
  const [tagOrder, setTagOrder] = useState<TagType[]>([])
  const [drugResults, setDrugResults] = useState<Drug[]>([])
  const [searching, setSearching] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { regions } = useRegions()

  const hasRegion = tagOrder.includes('region')
  const hasDrug = tagOrder.includes('drug')
  const hasGender = tagOrder.includes('gender')
  const hasAgeBand = tagOrder.includes('ageBand')
  const allFilled = hasRegion && hasDrug && hasGender && hasAgeBand && availableAgeBands.length > 0

  const regionResults =
    !hasRegion && query.length >= 2
      ? regions.filter((r) => r.regionName.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
      : []

  const genderResults =
    !hasGender && query.length >= 1
      ? GENDER_OPTIONS.filter(
          (g) =>
            g.label.toLowerCase().startsWith(query.toLowerCase()) ||
            g.key.startsWith(query.toLowerCase())
        )
      : []

  const ageBandResults =
    !hasAgeBand && query.length >= 1
      ? availableAgeBands
          .filter((ab) => ab.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 8)
      : []

  const searchDrugs = useCallback((q: string) => {
    setSearching(true)
    gqlFetch<{ searchDrugs: Drug[] }>(SEARCH_DRUGS_QUERY, { query: q })
      .then((data) => setDrugResults(data.searchDrugs))
      .catch(() => setDrugResults([]))
      .finally(() => setSearching(false))
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (hasDrug || query.length < 2) {
      setDrugResults([])
      return
    }
    debounceRef.current = setTimeout(() => searchDrugs(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, hasDrug, searchDrugs])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const hasResults =
    regionResults.length > 0 ||
    drugResults.length > 0 ||
    genderResults.length > 0 ||
    ageBandResults.length > 0 ||
    searching

  function handleQueryChange(val: string) {
    setQuery(val)
    if (!allFilled) setOpen(val.length >= 1)
  }

  function handleClear() {
    setQuery('')
    setDrugResults([])
    setOpen(false)
  }

  function selectDrug(drug: Drug) {
    setSelectedDrug(drug)
    onDrugChange(drug)
    setTagOrder((prev) => [...prev.filter((t) => t !== 'drug'), 'drug'])
    setQuery('')
    setDrugResults([])
    setOpen(false)
  }

  function selectRegion(region: Region) {
    setSelectedRegion(region)
    onRegionChange(region)
    setTagOrder((prev) => [...prev.filter((t) => t !== 'region'), 'region'])
    setQuery('')
    setDrugResults([])
    setOpen(false)
  }

  function selectGender(key: string) {
    setSelectedGender(key)
    onGenderChange(key)
    setTagOrder((prev) => [...prev.filter((t) => t !== 'gender'), 'gender'])
    setQuery('')
    setOpen(false)
  }

  function selectAgeBand(ab: string) {
    setSelectedAgeBand(ab)
    onAgeBandChange(ab)
    setTagOrder((prev) => [...prev.filter((t) => t !== 'ageBand'), 'ageBand'])
    setQuery('')
    setOpen(false)
  }

  function selectYear(y: number) {
    setSelectedYear(y)
    onYearChange(y)
  }

  function clearDrug() {
    setSelectedDrug(null)
    onDrugChange(null)
    setTagOrder((prev) => prev.filter((t) => t !== 'drug'))
  }

  function clearRegion() {
    setSelectedRegion(null)
    onRegionChange(null)
    setTagOrder((prev) => prev.filter((t) => t !== 'region'))
  }

  function clearGender() {
    setSelectedGender(null)
    onGenderChange(null)
    setTagOrder((prev) => prev.filter((t) => t !== 'gender'))
  }

  function clearAgeBand() {
    setSelectedAgeBand(null)
    onAgeBandChange(null)
    setTagOrder((prev) => prev.filter((t) => t !== 'ageBand'))
  }

  function clearYear() {
    setSelectedYear(null)
    onYearChange(null)
  }

  const placeholder = (() => {
    if (allFilled) return ''
    const missing: string[] = []
    if (!hasDrug) missing.push('medication')
    if (!hasRegion) missing.push('region')
    if (!hasGender) missing.push('gender')
    if (availableAgeBands.length > 0 && !hasAgeBand) missing.push('age band')
    if (missing.length === 0) return ''
    return `Search ${missing.slice(0, 3).join(', ')}…`
  })()

  const genderLabel = (key: string) =>
    GENDER_OPTIONS.find((g) => g.key === key)?.label ?? key

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

          {/* Tags */}
          {tagOrder.map((type) => {
            if (type === 'region' && selectedRegion) {
              return (
                <span key="region" className="inline-flex items-center gap-2 shrink-0 bg-teal-100 text-teal-800 text-base font-semibold px-4 py-2 rounded-full whitespace-nowrap">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {selectedRegion.regionName}
                  <button onClick={clearRegion} className="ml-0.5 text-teal-400 hover:text-teal-800 text-lg leading-none" aria-label="Remove region filter">×</button>
                </span>
              )
            }
            if (type === 'drug' && selectedDrug) {
              return (
                <span key="drug" className="inline-flex items-center gap-2 shrink-0 bg-blue-100 text-blue-800 text-base font-semibold px-4 py-2 rounded-full max-w-64 min-w-0">
                  <span className="truncate">{selectedDrug.name}</span>
                  {selectedDrug.narcoticClass && <span className="text-orange-600 font-bold shrink-0">·N</span>}
                  <button onClick={clearDrug} className="ml-0.5 shrink-0 text-blue-400 hover:text-blue-800 text-lg leading-none" aria-label="Remove drug filter">×</button>
                </span>
              )
            }
            if (type === 'gender' && selectedGender) {
              return (
                <span key="gender" className="inline-flex items-center gap-2 shrink-0 bg-rose-100 text-rose-800 text-base font-semibold px-4 py-2 rounded-full whitespace-nowrap">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {genderLabel(selectedGender)}
                  <button onClick={clearGender} className="ml-0.5 text-rose-400 hover:text-rose-800 text-lg leading-none" aria-label="Remove gender filter">×</button>
                </span>
              )
            }
            if (type === 'ageBand' && selectedAgeBand) {
              return (
                <span key="ageBand" className="inline-flex items-center gap-2 shrink-0 bg-amber-100 text-amber-800 text-base font-semibold px-4 py-2 rounded-full whitespace-nowrap">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {selectedAgeBand} yrs
                  <button onClick={clearAgeBand} className="ml-0.5 text-amber-500 hover:text-amber-800 text-lg leading-none" aria-label="Remove age band filter">×</button>
                </span>
              )
            }
            return null
          })}

          {/* Year — always a pill, native select overlaid when unselected */}
          {selectedYear !== null ? (
            <span className="inline-flex items-center gap-2 shrink-0 bg-violet-100 text-violet-800 text-base font-semibold px-4 py-2 rounded-full whitespace-nowrap">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {selectedYear}
              <button onClick={clearYear} className="ml-0.5 text-violet-400 hover:text-violet-800 text-lg leading-none" aria-label="Remove year filter">×</button>
            </span>
          ) : (
            <span className="relative inline-flex items-center gap-2 shrink-0 bg-gray-100 text-gray-500 text-base font-semibold px-4 py-2 rounded-full whitespace-nowrap hover:bg-gray-200 cursor-pointer transition-colors">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Year
              <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
              {/* Invisible native select covers the whole pill */}
              <select
                value=""
                onChange={(e) => e.target.value && selectYear(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Filter by year"
              >
                <option value="" disabled>Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </span>
          )}

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-w-32 bg-transparent outline-none text-base text-gray-700 placeholder-gray-400"
          />

          {/* Clear query button */}
          {query && (
            <button
              onClick={handleClear}
              className="shrink-0 w-6 h-6 rounded-full bg-gray-300 hover:bg-gray-400 text-white flex items-center justify-center text-sm leading-none"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {open && hasResults && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {/* Regions */}
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

            {/* Medications */}
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

            {/* Gender */}
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

            {/* Age bands */}
            {ageBandResults.length > 0 && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
                  Age Band
                </div>
                {ageBandResults.map((ab) => (
                  <button
                    key={ab}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectAgeBand(ab)}
                  >
                    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-base text-gray-900">{ab} yrs</span>
                  </button>
                ))}
              </>
            )}

            {/* No results */}
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
