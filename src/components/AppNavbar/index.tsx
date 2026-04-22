import { useState, useRef, useEffect, useCallback } from 'react'
import { COLOR_BRAND } from '../../theme'
import { useUser } from '../../context/UserContext'
import { useRegions } from '../../hooks/useRegions'
import { gqlFetch } from '../../lib/graphql'
import { SEARCH_DRUGS_QUERY } from '../../lib/queries'
import FilterChips from './FilterChips'
import CommandPalette from './CommandPalette'
import SearchResultList, {
  buildSearchResults,
  buildFlatActions
} from './SearchResultList'
import type { SearchHandlers } from './SearchResultList'
import type { AgeBand } from '../../hooks/useFilters'
import type { Drug, Region } from '../../types'

interface Props {
  onLogout: () => void
  activeDrug: Drug | null
  activeRegion: Region | null
  activeYear: number | null
  activeGender: string | null
  activeAgeBand: AgeBand | null
  availableAgeBands: AgeBand[]
  savedAtcCodes: Set<string>
  onDrugChange: (drug: Drug | null) => void
  onRegionChange: (region: Region | null) => void
  onYearChange: (year: number | null) => void
  onGenderChange: (gender: string | null) => void
  onAgeBandChange: (ageBand: AgeBand | null) => void
  onSaveDrug: (drug: Drug) => void
}

export default function AppNavbar({
  onLogout,
  activeDrug,
  activeRegion,
  activeYear,
  activeGender,
  activeAgeBand,
  availableAgeBands,
  savedAtcCodes,
  onDrugChange,
  onRegionChange,
  onYearChange,
  onGenderChange,
  onAgeBandChange,
  onSaveDrug
}: Props) {
  const user = useUser()
  const { regions } = useRegions()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [drugResults, setDrugResults] = useState<Drug[]>([])
  const [searching, setSearching] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [cmdOpen, setCmdOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchHandlers: SearchHandlers = {
    activeDrug,
    activeRegion,
    activeGender,
    activeAgeBand,
    onDrugChange,
    onRegionChange,
    onGenderChange,
    onAgeBandChange
  }

  const searchDrugs = useCallback(async (q: string) => {
    setSearching(true)
    try {
      const data = await gqlFetch<{ searchDrugs: Drug[] }>(SEARCH_DRUGS_QUERY, {
        query: q
      })
      setDrugResults(data.searchDrugs)
    } catch {
      setDrugResults([])
    } finally {
      setSearching(false)
    }
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
    setFocusedIndex(-1)
  }, [query])

  // Close inline dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Global ⌘K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen((v) => !v)
      }
      if (e.key === 'Escape') setCmdOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const inlineResults = buildSearchResults(
    query,
    drugResults,
    searching,
    availableAgeBands,
    regions
  )

  function handleInlineKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return
    const closeFn = () => {
      setQuery('')
      setDrugResults([])
      setOpen(false)
      setFocusedIndex(-1)
    }
    const actions = buildFlatActions(inlineResults, searchHandlers, closeFn)
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setFocusedIndex((i) => Math.min(i + 1, actions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault()
      actions[focusedIndex]?.()
      setFocusedIndex(-1)
    }
  }

  const placeholder = (() => {
    if (!activeDrug) return 'Search for a medication to get started…'
    if (!activeRegion && !activeGender && !activeAgeBand)
      return 'Add a region, gender, or age band…'
    if (!activeRegion) return 'Add a region to compare local data…'
    if (!activeGender && !activeAgeBand) return 'Filter by gender or age band…'
    return 'Type to replace any active filter…'
  })()

  const hasActiveFilters =
    !!activeDrug ||
    !!activeRegion ||
    !!activeGender ||
    !!activeAgeBand ||
    activeYear !== null

  const showDropdown =
    open &&
    (inlineResults.regionResults.length > 0 ||
      inlineResults.drugResults.length > 0 ||
      inlineResults.genderResults.length > 0 ||
      inlineResults.ageBandResults.length > 0 ||
      inlineResults.searching)

  return (
    <>
      <nav className="border-b border-gray-200 bg-white shrink-0">
        {/* Row 1: Logo / Search / User */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 px-8 py-3">
          <span className="text-3xl font-bold" style={{ color: COLOR_BRAND }}>
            Medistat
          </span>

          <div
            ref={containerRef}
            className="relative w-full max-w-2xl justify-self-center"
          >
            <div
              className="flex items-center gap-2 px-4 py-2.5 h-12 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white cursor-text transition-colors"
              onClick={() => inputRef.current?.focus()}
            >
              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setOpen(e.target.value.length >= 1)
                }}
                onKeyDown={handleInlineKeyDown}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-base text-gray-700 placeholder-gray-400"
              />
              {query ? (
                <button
                  onClick={() => {
                    setQuery('')
                    setDrugResults([])
                    setOpen(false)
                  }}
                  className="shrink-0 w-5 h-5 rounded-full bg-gray-300 hover:bg-gray-400 text-white flex items-center justify-center text-sm leading-none"
                  aria-label="Clear search"
                >
                  ×
                </button>
              ) : (
                <kbd
                  onClick={() => setCmdOpen(true)}
                  className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-gray-200 bg-white text-[10px] text-gray-400 font-mono cursor-pointer hover:border-gray-300 hover:text-gray-600 transition-colors select-none"
                  title="Open command palette"
                >
                  <span className="text-[11px]">⌘</span>K
                </kbd>
              )}
            </div>

            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto">
                <SearchResultList
                  results={inlineResults}
                  handlers={searchHandlers}
                  onClose={() => {
                    setQuery('')
                    setDrugResults([])
                    setOpen(false)
                    setFocusedIndex(-1)
                  }}
                  focusedIndex={focusedIndex}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <span className="text-base font-semibold text-gray-900">
              {user?.username ?? 'Guest'}
            </span>
            <button
              title="Log out"
              onClick={onLogout}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Row 2: Active filter chips */}
        {hasActiveFilters && (
          <FilterChips
            activeDrug={activeDrug}
            activeRegion={activeRegion}
            activeYear={activeYear}
            activeGender={activeGender}
            activeAgeBand={activeAgeBand}
            savedAtcCodes={savedAtcCodes}
            onDrugChange={onDrugChange}
            onRegionChange={onRegionChange}
            onYearChange={onYearChange}
            onGenderChange={onGenderChange}
            onAgeBandChange={onAgeBandChange}
            onSaveDrug={onSaveDrug}
          />
        )}
      </nav>

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        searchHandlers={searchHandlers}
        availableAgeBands={availableAgeBands}
        regions={regions}
      />
    </>
  )
}
