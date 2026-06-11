import { useEffect } from 'react'
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList
} from '@/components/ui/command'
import SearchResultList from './SearchResultList'
import { buildSearchResults } from '../../lib/searchResults'
import type { SearchHandlers } from '../../lib/searchResults'
import { useDrugSearch } from '../../hooks/useDrugSearch'
import type { AgeBand, Region } from '../../types'
import {
  TEXT_MUTED,
  SURFACE_CARD,
  SURFACE_MUTED,
  BORDER_DEFAULT,
  BORDER_SUBTLE
} from '../../theme'

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
  const { query, setQuery, drugResults, searching, reset } = useDrugSearch()

  // Start each opening from a clean slate.
  useEffect(() => {
    if (!open) reset()
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const results = buildSearchResults(
    query,
    drugResults,
    searching,
    availableAgeBands,
    regions
  )

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose()
      }}
      title="Search"
      description="Search medications, regions, gender, and age bands"
    >
      <Command shouldFilter={false}>
        <CommandInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search medications, regions, gender, age band…"
        />
        <CommandList>
          {query.length === 0 ? (
            <div className={`px-4 py-6 text-center text-sm ${TEXT_MUTED}`}>
              Start typing to search medications, regions, and more…
            </div>
          ) : (
            <SearchResultList
              results={results}
              handlers={searchHandlers}
              onClose={onClose}
            />
          )}
        </CommandList>

        <div
          className={`px-4 py-2 border-t flex items-center gap-4 text-xs ${BORDER_SUBTLE} ${SURFACE_MUTED} ${TEXT_MUTED}`}
        >
          <span>
            <kbd
              className={`font-mono rounded px-1 border ${SURFACE_CARD} ${BORDER_DEFAULT}`}
            >
              ↵
            </kbd>{' '}
            select
          </span>
          <span>
            <kbd
              className={`font-mono rounded px-1 border ${SURFACE_CARD} ${BORDER_DEFAULT}`}
            >
              esc
            </kbd>{' '}
            close
          </span>
          <span className="ml-auto">⌘K to toggle</span>
        </div>
      </Command>
    </CommandDialog>
  )
}
