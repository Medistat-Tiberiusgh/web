import { useState, useRef, useEffect, type ReactNode } from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import {
  TEXT_BODY,
  TEXT_MUTED,
  TEXT_MUTED_HOVER,
  TEXT_BODY_HOVER,
  PLACEHOLDER_MUTED,
  SURFACE_CARD,
  SURFACE_MUTED,
  SURFACE_MUTED_HOVER,
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
  chips?: ReactNode
  onClearFilters: () => void
}

export default function NavSearch({
  searchHandlers,
  availableAgeBands,
  regions,
  chips,
  onClearFilters
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
      // text-left keeps result rows left-aligned inside the centered hero
      className={`relative text-left ${
        chips ? 'w-fit min-w-2xl max-w-full' : 'w-full max-w-2xl'
      }`}
    >
      <CommandPrimitive shouldFilter={false} className="w-full">
        <div
          className={`flex flex-wrap items-center gap-2 px-4 py-2 min-h-12 rounded-xl border focus-within:border-blue-400 focus-within:bg-white cursor-text transition-colors ${BORDER_DEFAULT} ${SURFACE_MUTED}`}
          onClick={() => inputRef.current?.focus()}
        >
          {!chips && <SearchIcon />}
          {chips}
          <CommandPrimitive.Input
            ref={inputRef}
            value={query}
            onValueChange={(value) => {
              setQuery(value)
              setOpen(value.length >= 1)
            }}
            placeholder={chips ? '' : 'Search for a medication to get started…'}
            className={`flex-1 min-w-32 bg-transparent outline-none text-base ${TEXT_BODY} ${PLACEHOLDER_MUTED}`}
          />
          <TrailingControl
            isSearching={query.length > 0}
            hasChips={Boolean(chips)}
            onClearSearch={closeInline}
            onClearFilters={onClearFilters}
            onOpenCommandPalette={() => setCmdOpen(true)}
          />
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

function TrailingControl({
  isSearching,
  hasChips,
  onClearSearch,
  onClearFilters,
  onOpenCommandPalette
}: {
  isSearching: boolean
  hasChips: boolean
  onClearSearch: () => void
  onClearFilters: () => void
  onOpenCommandPalette: () => void
}) {
  if (isSearching) {
    return <ClearSearchButton onClick={onClearSearch} />
  }
  if (hasChips) {
    return <ClearFiltersButton onClick={onClearFilters} />
  }
  return <CommandPaletteHint onOpen={onOpenCommandPalette} />
}

function ClearSearchButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 w-5 h-5 rounded-full bg-gray-300 hover:bg-gray-400 text-white flex items-center justify-center text-sm leading-none"
      aria-label="Clear search"
    >
      ×
    </button>
  )
}

function ClearFiltersButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 flex items-center justify-center w-5 h-5 rounded-full transition-colors ${TEXT_MUTED} ${TEXT_BODY_HOVER} ${SURFACE_MUTED_HOVER}`}
      aria-label="Clear all filters"
      title="Clear all filters"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  )
}

function SearchIcon() {
  return (
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
  )
}

function CommandPaletteHint({ onOpen }: { onOpen: () => void }) {
  return (
    <kbd
      onClick={onOpen}
      className={`hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-xs font-mono cursor-pointer hover:border-gray-300 transition-colors select-none ${BORDER_DEFAULT} ${SURFACE_CARD} ${TEXT_MUTED} ${TEXT_MUTED_HOVER}`}
      title="Open command palette"
    >
      <span className="text-xs">⌘</span>K
    </kbd>
  )
}
