import { useState, useRef, useEffect, useCallback } from 'react'
import { SearchField } from '@heroui/react'
import type { Drug, Region } from '../types'
import { gqlFetch } from '../lib/graphql'
import { SEARCH_DRUGS_QUERY } from '../lib/queries'
import { useRegions } from '../hooks/useRegions'

const YEARS = Array.from({ length: 19 }, (_, i) => 2024 - i)

interface Props {
  onDrugChange: (drug: Drug | null) => void
  onRegionChange: (region: Region | null) => void
  onYearChange: (year: number | null) => void
}

export default function FilterBar({ onDrugChange, onRegionChange, onYearChange }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [year, setYear] = useState<number | null>(null)
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [drugResults, setDrugResults] = useState<Drug[]>([])
  const [searching, setSearching] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { regions } = useRegions()

  const regionResults =
    query.length >= 2
      ? regions
          .filter((r) => r.regionName.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)
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
    if (query.length < 2) {
      setDrugResults([])
      return
    }
    debounceRef.current = setTimeout(() => searchDrugs(query), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, searchDrugs])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const hasResults = regionResults.length > 0 || drugResults.length > 0 || searching

  function handleQueryChange(val: string) {
    setQuery(val)
    setOpen(val.length >= 2)
  }

  function handleClear() {
    setQuery('')
    setDrugResults([])
    setOpen(false)
  }

  function selectDrug(drug: Drug) {
    setSelectedDrug(drug)
    onDrugChange(drug)
    setQuery('')
    setDrugResults([])
    setOpen(false)
  }

  function selectRegion(region: Region) {
    setSelectedRegion(region)
    onRegionChange(region)
    setQuery('')
    setDrugResults([])
    setOpen(false)
  }

  function clearDrug() {
    setSelectedDrug(null)
    onDrugChange(null)
  }

  function clearRegion() {
    setSelectedRegion(null)
    onRegionChange(null)
  }

  function handleYearChange(y: number | null) {
    setYear(y)
    onYearChange(y)
  }

  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center gap-3 px-6 shrink-0">
      {/* Tags + search */}
      <div ref={containerRef} className="relative flex items-center gap-2 flex-1 max-w-xl">
        {/* Region tag */}
        {selectedRegion && (
          <span className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-xs font-semibold px-2 py-1 rounded-full shrink-0 whitespace-nowrap">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {selectedRegion.regionName}
            <button
              onClick={clearRegion}
              className="ml-0.5 text-teal-500 hover:text-teal-800 leading-none"
              aria-label="Remove region filter"
            >
              ×
            </button>
          </span>
        )}

        {/* Drug tag — shows name, not ATC */}
        {selectedDrug && (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full shrink-0 whitespace-nowrap">
            {selectedDrug.name}
            {selectedDrug.narcoticClass && (
              <span className="text-orange-600 font-bold">·N</span>
            )}
            <button
              onClick={clearDrug}
              className="ml-0.5 text-blue-500 hover:text-blue-800 leading-none"
              aria-label="Remove drug filter"
            >
              ×
            </button>
          </span>
        )}

        <SearchField
          aria-label="Search region or medication"
          value={query}
          onChange={handleQueryChange}
          onClear={handleClear}
          className="flex-1"
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input
              placeholder={
                selectedDrug
                  ? selectedDrug.name
                  : selectedRegion
                  ? 'Add a medication…'
                  : 'Search region or medication…'
              }
            />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        {/* Dropdown */}
        {open && hasResults && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
            {/* Region section */}
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
                    <span className="text-sm text-gray-900">{region.regionName}</span>
                  </button>
                ))}
              </>
            )}

            {/* Drug section */}
            {(drugResults.length > 0 || searching) && (
              <>
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
                  Medications
                </div>
                {searching && drugResults.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">Searching…</div>
                ) : (
                  drugResults.map((drug) => (
                    <button
                      key={drug.atcCode}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center justify-between gap-4"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectDrug(drug)}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm text-gray-900 truncate">{drug.name}</span>
                        <span className="text-xs text-gray-400">{drug.atcCode}</span>
                      </div>
                      {drug.narcoticClass && (
                        <span className="text-xs font-semibold text-orange-600 shrink-0">
                          Class {drug.narcoticClass}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </>
            )}

            {/* No results */}
            {!searching && regionResults.length === 0 && drugResults.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-400">
                No results for &ldquo;{query}&rdquo;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-gray-400 text-xs font-medium">Year</span>
        <select
          value={year ?? ''}
          onChange={(e) => handleYearChange(e.target.value ? Number(e.target.value) : null)}
          className="border border-gray-200 rounded-lg px-2.5 py-1 text-sm text-gray-700 bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white"
        >
          <option value="">All years</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Dataset range indicator */}
      <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 ml-auto">
        <span>Dataset: 2006 — 2024</span>
        <div className="w-20 h-1 bg-blue-600 rounded-full" />
      </div>
    </div>
  )
}
