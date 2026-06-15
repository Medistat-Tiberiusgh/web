import { useState, useRef, useEffect } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import {
  TEXT_BODY,
  TEXT_MUTED,
  TEXT_MUTED_HOVER,
  PLACEHOLDER_MUTED,
  SURFACE_CARD,
  SURFACE_MUTED,
  BORDER_DEFAULT
} from '../../theme'
import CommandPalette from './CommandPalette'
import SearchResultList from './SearchResultList'
import { buildSearchResults } from '../../lib/searchResults'
import type { SearchHandlers } from '../../lib/searchResults'
import { useDrugSearch } from '../../hooks/useDrugSearch'
import type { AgeBand, Region } from '../../types'

type Props = {
  searchHandlers: SearchHandlers
  availableAgeBands: AgeBand[]
  regions: Region[]
}

function searchPlaceholder(handlers: SearchHandlers): string {
  const { activeDrug, activeRegion, activeGender, activeAgeBand } = handlers
  if (!activeDrug) return 'Search for a medication to get started…'
  if (!activeRegion && !activeGender && !activeAgeBand)
    return 'Add a region, gender, or age band…'
  if (!activeRegion) return 'Add a region to compare local data…'
  if (!activeGender && !activeAgeBand) return 'Filter by gender or age band…'
  return 'Type to replace any active filter…'
}

export default function NavSearch({
  searchHandlers,
  availableAgeBands,
  regions
}: Props) {
  const { query, setQuery, drugResults, searching, reset } = useDrugSearch()
  const [open, setOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const showDropdown =
    open &&
    (inlineResults.regionResults.length > 0 ||
      inlineResults.drugResults.length > 0 ||
      inlineResults.genderResults.length > 0 ||
      inlineResults.ageBandResults.length > 0 ||
      inlineResults.searching)

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl justify-self-center"
    >
      <CommandPrimitive shouldFilter={false} className="w-full">
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
            placeholder={searchPlaceholder(searchHandlers)}
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

      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        searchHandlers={searchHandlers}
        availableAgeBands={availableAgeBands}
        regions={regions}
      />
    </div>
  )
}
