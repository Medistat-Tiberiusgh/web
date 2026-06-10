import { useState, useRef, useEffect } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import {
  COLOR_BRAND,
  TEXT_HEADING,
  TEXT_BODY,
  TEXT_MUTED,
  TEXT_MUTED_HOVER,
  TEXT_BODY_HOVER,
  PLACEHOLDER_MUTED,
  SURFACE_CARD,
  SURFACE_MUTED,
  BORDER_DEFAULT
} from '../../theme'
import { useUser } from '../../context/UserContext'
import { useRegions } from '../../hooks/useRegions'
import { startGithubLogin } from '../../lib/oauth'
import FilterChips from './FilterChips'
import CommandPalette from './CommandPalette'
import SavedMedicationsButton, {
  type SavedMedications
} from './SavedMedicationsButton'
import SearchResultList from './SearchResultList'
import { buildSearchResults } from '../../lib/searchResults'
import type { SearchHandlers } from '../../lib/searchResults'
import { useDrugSearch } from '../../hooks/useDrugSearch'
import type { AgeBand, Drug, Region } from '../../types'

interface Props {
  onLogout: () => void
  activeDrug: Drug | null
  activeRegion: Region | null
  activeYear: number | null
  activeGender: string | null
  activeAgeBand: AgeBand | null
  availableAgeBands: AgeBand[]
  savedAtcCodes: Set<string>
  savedMedications: SavedMedications
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
  savedMedications,
  onDrugChange,
  onRegionChange,
  onYearChange,
  onGenderChange,
  onAgeBandChange,
  onSaveDrug
}: Props) {
  const user = useUser()
  const { regions } = useRegions()

  const { query, setQuery, drugResults, searching, reset } = useDrugSearch()
  const [open, setOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  function closeInline() {
    reset()
    setOpen(false)
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
      <nav className={`border-b shrink-0 ${BORDER_DEFAULT} ${SURFACE_CARD}`}>
        {/* Row 1: Logo / Search / User */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 px-8 py-3">
          <span className="text-3xl font-bold" style={{ color: COLOR_BRAND }}>
            Medistat
          </span>

          <CommandPrimitive
            ref={containerRef}
            shouldFilter={false}
            className="relative w-full max-w-2xl justify-self-center"
          >
            <div
              className={`flex items-center gap-2 px-4 py-2.5 h-12 rounded-xl border focus-within:border-blue-400 focus-within:bg-white cursor-text transition-colors ${BORDER_DEFAULT} ${SURFACE_MUTED}`}
              onClick={() => inputRef.current?.focus()}
            >
              <svg
                className={`w-4 h-4 shrink-0 ${TEXT_MUTED}`}
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
              <CommandPrimitive.Input
                ref={inputRef}
                value={query}
                onValueChange={(value) => {
                  setQuery(value)
                  setOpen(value.length >= 1)
                }}
                placeholder={placeholder}
                className={`flex-1 bg-transparent outline-none text-base ${TEXT_BODY} ${PLACEHOLDER_MUTED}`}
              />
              {query ? (
                <button
                  onClick={closeInline}
                  className="shrink-0 w-5 h-5 rounded-full bg-gray-300 hover:bg-gray-400 text-white flex items-center justify-center text-sm leading-none"
                  aria-label="Clear search"
                >
                  ×
                </button>
              ) : (
                <kbd
                  onClick={() => setCmdOpen(true)}
                  className={`hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-xs font-mono cursor-pointer hover:border-gray-300 transition-colors select-none ${BORDER_DEFAULT} ${SURFACE_CARD} ${TEXT_MUTED} ${TEXT_MUTED_HOVER}`}
                  title="Open command palette"
                >
                  <span className="text-xs">⌘</span>K
                </kbd>
              )}
            </div>

            {showDropdown && (
              <CommandPrimitive.List
                className={`absolute top-full mt-1 left-0 right-0 border rounded-lg shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto ${SURFACE_CARD} ${BORDER_DEFAULT}`}
              >
                <SearchResultList
                  results={inlineResults}
                  handlers={searchHandlers}
                  onClose={closeInline}
                />
              </CommandPrimitive.List>
            )}
          </CommandPrimitive>

          <div className="flex items-center justify-end gap-3">
            {user ? (
              <>
                <SavedMedicationsButton
                  savedMedications={savedMedications}
                  activeDrugAtcCode={activeDrug?.atcCode ?? null}
                  onSelect={onDrugChange}
                />
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user.username[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <span className={`text-base font-semibold ${TEXT_HEADING}`}>
                  {user.username}
                </span>
                <button
                  title="Log out"
                  onClick={onLogout}
                  className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${TEXT_MUTED} ${TEXT_BODY_HOVER}`}
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
              </>
            ) : (
              <button
                onClick={startGithubLogin}
                className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                Sign in
              </button>
            )}
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
