import { useState, useRef, useEffect, useCallback } from 'react'
import { gqlFetch } from '../../lib/graphql'
import { SEARCH_DRUGS_QUERY } from '../../lib/queries'
import SearchResultList, {
  buildSearchResults,
  buildFlatActions
} from './SearchResultList'
import type { SearchHandlers } from './SearchResultList'
import type { AgeBand } from '../../hooks/useFilters'
import type { Drug, Region } from '../../types'

interface Props {
  open: boolean
  onClose: () => void
  searchHandlers: SearchHandlers
  availableAgeBands: AgeBand[]
  regions: Region[]
}

export default function CommandPalette({
  open,
  onClose,
  searchHandlers,
  availableAgeBands,
  regions
}: Props) {
  const [query, setQuery] = useState('')
  const [drugResults, setDrugResults] = useState<Drug[]>([])
  const [searching, setSearching] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else {
      setQuery('')
      setDrugResults([])
      setFocusedIndex(-1)
    }
  }, [open])

  const results = buildSearchResults(
    query,
    drugResults,
    searching,
    availableAgeBands,
    regions
  )

  function handleClose() {
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const actions = buildFlatActions(results, searchHandlers, handleClose)
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

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[70vh]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <svg
            className="w-5 h-5 text-gray-400 shrink-0"
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
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search medications, regions, gender, age band…"
            className="flex-1 bg-transparent outline-none text-base text-gray-800 placeholder-gray-400"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setDrugResults([])
              }}
              className="text-gray-400 hover:text-gray-600"
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
          )}
        </div>

        <div className="overflow-y-auto flex-1">
          {query.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">
              Start typing to search medications, regions, and more…
            </div>
          ) : (
            <SearchResultList
              results={results}
              handlers={searchHandlers}
              onClose={handleClose}
              focusedIndex={focusedIndex}
            />
          )}
        </div>

        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-4 text-[10px] text-gray-400">
          <span>
            <kbd className="font-mono bg-white border border-gray-200 rounded px-1">
              ↵
            </kbd>{' '}
            select
          </span>
          <span>
            <kbd className="font-mono bg-white border border-gray-200 rounded px-1">
              esc
            </kbd>{' '}
            close
          </span>
          <span className="ml-auto">⌘K to toggle</span>
        </div>
      </div>
    </div>
  )
}
