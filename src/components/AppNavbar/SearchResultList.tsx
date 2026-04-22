import { useRef, useEffect } from 'react'
import type { AgeBand } from '../../hooks/useFilters'
import type { Drug, Region } from '../../types'

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

export function buildFlatActions(
  results: SearchResults,
  handlers: SearchHandlers,
  closeFn: () => void
): (() => void)[] {
  const actions: (() => void)[] = []
  results.regionResults.forEach((r) =>
    actions.push(() => {
      handlers.onRegionChange(r)
      closeFn()
    })
  )
  results.drugResults.forEach((d) =>
    actions.push(() => {
      handlers.onDrugChange(d)
      closeFn()
    })
  )
  results.genderResults.forEach((g) =>
    actions.push(() => {
      handlers.onGenderChange(g.key)
      closeFn()
    })
  )
  results.ageBandResults.forEach((ab) =>
    actions.push(() => {
      handlers.onAgeBandChange(ab)
      closeFn()
    })
  )
  return actions
}

export default function SearchResultList({
  results,
  handlers,
  onClose,
  focusedIndex = -1
}: {
  results: SearchResults
  handlers: SearchHandlers
  onClose: () => void
  focusedIndex?: number
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const {
    regionResults,
    drugResults,
    genderResults,
    ageBandResults,
    searching,
    query
  } = results
  const { activeDrug, activeRegion, activeGender, activeAgeBand } = handlers

  useEffect(() => {
    if (focusedIndex < 0 || !listRef.current) return
    const el = listRef.current.querySelector(
      '[data-focused="true"]'
    ) as HTMLElement | null
    el?.scrollIntoView({ block: 'nearest' })
  }, [focusedIndex])

  function select(fn: () => void) {
    fn()
    onClose()
  }

  const hasResults =
    regionResults.length > 0 ||
    drugResults.length > 0 ||
    genderResults.length > 0 ||
    ageBandResults.length > 0 ||
    searching

  if (!hasResults) {
    return (
      <div className="px-4 py-3 text-base text-gray-400">
        No results for &ldquo;{query}&rdquo;
      </div>
    )
  }

  let fi = 0
  const rBase = fi
  fi += regionResults.length
  const dBase = fi
  fi += drugResults.length
  const gBase = fi
  fi += genderResults.length
  const aBase = fi

  function itemClass(flatIdx: number, extra = '') {
    return `w-full text-left px-4 flex items-center gap-3 transition-colors ${
      flatIdx === focusedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
    } ${extra}`
  }

  return (
    <div ref={listRef}>
      {regionResults.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
            Regions
          </div>
          {regionResults.map((region, i) => (
            <button
              key={region.id}
              data-focused={rBase + i === focusedIndex ? 'true' : undefined}
              className={itemClass(rBase + i, 'py-2.5')}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(() => handlers.onRegionChange(region))}
            >
              <svg
                className="w-3.5 h-3.5 text-teal-600 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-base text-gray-900 flex-1">
                {region.regionName}
              </span>
              {activeRegion?.id === region.id && (
                <span className="text-[10px] text-teal-600 font-semibold">
                  active
                </span>
              )}
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
            drugResults.map((drug, i) => (
              <button
                key={drug.atcCode}
                data-focused={dBase + i === focusedIndex ? 'true' : undefined}
                className={itemClass(dBase + i, 'py-3 justify-between')}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(() => handlers.onDrugChange(drug))}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-base text-gray-900 truncate">
                    {drug.name}
                  </span>
                  <span className="text-sm text-gray-400">{drug.atcCode}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {drug.narcoticClass && (
                    <span className="text-sm font-bold text-red-600">
                      N{drug.narcoticClass}
                    </span>
                  )}
                  {activeDrug?.atcCode === drug.atcCode && (
                    <span className="text-[10px] text-indigo-500 font-semibold">
                      active
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </>
      )}

      {genderResults.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
            Gender
            {activeAgeBand && (
              <span className="ml-2 text-amber-500 normal-case font-normal">
                · replaces age band filter
              </span>
            )}
          </div>
          {genderResults.map((g, i) => (
            <button
              key={g.key}
              data-focused={gBase + i === focusedIndex ? 'true' : undefined}
              className={itemClass(gBase + i, 'py-3')}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(() => handlers.onGenderChange(g.key))}
            >
              <svg
                className="w-4 h-4 text-rose-400 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-base text-gray-900 flex-1">{g.label}</span>
              {activeGender === g.key && (
                <span className="text-[10px] text-rose-500 font-semibold">
                  active
                </span>
              )}
            </button>
          ))}
        </>
      )}

      {ageBandResults.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
            Age Band
            {activeGender && (
              <span className="ml-2 text-rose-500 normal-case font-normal">
                · replaces gender filter
              </span>
            )}
          </div>
          {ageBandResults.map((ab, i) => (
            <button
              key={ab.id}
              data-focused={aBase + i === focusedIndex ? 'true' : undefined}
              className={itemClass(aBase + i, 'py-3')}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(() => handlers.onAgeBandChange(ab))}
            >
              <svg
                className="w-4 h-4 text-amber-500 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-base text-gray-900 flex-1">
                {ab.name} yrs
              </span>
              {activeAgeBand?.id === ab.id && (
                <span className="text-[10px] text-amber-500 font-semibold">
                  active
                </span>
              )}
            </button>
          ))}
        </>
      )}
    </div>
  )
}
