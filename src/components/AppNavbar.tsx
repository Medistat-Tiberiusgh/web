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

// ── Shared search result list ─────────────────────────────────────────────────

interface SearchHandlers {
  activeDrug: Drug | null
  activeRegion: Region | null
  activeGender: string | null
  activeAgeBand: AgeBand | null
  onDrugChange: (d: Drug | null) => void
  onRegionChange: (r: Region | null) => void
  onGenderChange: (g: string | null) => void
  onAgeBandChange: (ab: AgeBand | null) => void
}

interface SearchResults {
  regionResults: Region[]
  drugResults: Drug[]
  genderResults: typeof GENDER_OPTIONS
  ageBandResults: AgeBand[]
  searching: boolean
  query: string
}

function SearchResultList({
  results,
  handlers,
  onClose,
  focusedIndex = -1,
}: {
  results: SearchResults
  handlers: SearchHandlers
  onClose: () => void
  focusedIndex?: number
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const { regionResults, drugResults, genderResults, ageBandResults, searching, query } = results
  const { activeDrug, activeRegion, activeGender, activeAgeBand } = handlers

  // Scroll focused item into view whenever focusedIndex changes
  useEffect(() => {
    if (focusedIndex < 0 || !listRef.current) return
    const el = listRef.current.querySelector('[data-focused="true"]') as HTMLElement | null
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

  // Pre-assign flat indices in render order so keyboard nav and highlights stay in sync
  let fi = 0
  const rBase = fi; fi += regionResults.length
  const dBase = fi; fi += drugResults.length
  const gBase = fi; fi += genderResults.length
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
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">Regions</div>
          {regionResults.map((region, i) => (
            <button key={region.id}
              data-focused={rBase + i === focusedIndex ? 'true' : undefined}
              className={itemClass(rBase + i, 'py-2.5')}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(() => handlers.onRegionChange(region))}
            >
              <svg className="w-3.5 h-3.5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-base text-gray-900 flex-1">{region.regionName}</span>
              {activeRegion?.id === region.id && <span className="text-[10px] text-teal-600 font-semibold">active</span>}
            </button>
          ))}
        </>
      )}

      {(drugResults.length > 0 || searching) && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">Medications</div>
          {searching && drugResults.length === 0 ? (
            <div className="px-4 py-3 text-base text-gray-400">Searching…</div>
          ) : drugResults.map((drug, i) => (
            <button key={drug.atcCode}
              data-focused={dBase + i === focusedIndex ? 'true' : undefined}
              className={itemClass(dBase + i, 'py-3 justify-between')}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(() => handlers.onDrugChange(drug))}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-base text-gray-900 truncate">{drug.name}</span>
                <span className="text-sm text-gray-400">{drug.atcCode}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {drug.narcoticClass && <span className="text-sm font-bold text-red-600">N{drug.narcoticClass}</span>}
                {activeDrug?.atcCode === drug.atcCode && <span className="text-[10px] text-indigo-500 font-semibold">active</span>}
              </div>
            </button>
          ))}
        </>
      )}

      {genderResults.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
            Gender
            {activeAgeBand && <span className="ml-2 text-amber-500 normal-case font-normal">· replaces age band filter</span>}
          </div>
          {genderResults.map((g, i) => (
            <button key={g.key}
              data-focused={gBase + i === focusedIndex ? 'true' : undefined}
              className={itemClass(gBase + i, 'py-3')}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(() => handlers.onGenderChange(g.key))}
            >
              <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-base text-gray-900 flex-1">{g.label}</span>
              {activeGender === g.key && <span className="text-[10px] text-rose-500 font-semibold">active</span>}
            </button>
          ))}
        </>
      )}

      {ageBandResults.length > 0 && (
        <>
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400 bg-gray-50 border-b border-gray-100">
            Age Band
            {activeGender && <span className="ml-2 text-rose-500 normal-case font-normal">· replaces gender filter</span>}
          </div>
          {ageBandResults.map((ab, i) => (
            <button key={ab.id}
              data-focused={aBase + i === focusedIndex ? 'true' : undefined}
              className={itemClass(aBase + i, 'py-3')}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => select(() => handlers.onAgeBandChange(ab))}
            >
              <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-base text-gray-900 flex-1">{ab.name} yrs</span>
              {activeAgeBand?.id === ab.id && <span className="text-[10px] text-amber-500 font-semibold">active</span>}
            </button>
          ))}
        </>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

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
  onSaveDrug,
}: Props) {
  const user = useUser()
  const { regions } = useRegions()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [drugResults, setDrugResults] = useState<Drug[]>([])
  const [searching, setSearching] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  // Separate query state for command palette so they don't interfere
  const [cmdQuery, setCmdQuery] = useState('')
  const [cmdDrugResults, setCmdDrugResults] = useState<Drug[]>([])
  const [cmdSearching, setCmdSearching] = useState(false)

  // Keyboard navigation state for inline and palette
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [cmdFocusedIndex, setCmdFocusedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const cmdInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cmdDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Search helpers ──────────────────────────────────────────────────────────

  function buildResults(q: string, drugs: Drug[], isSearching: boolean, abands: AgeBand[]) {
    return {
      regionResults: q.length >= 2
        ? regions.filter((r) => r.regionName.toLowerCase().includes(q.toLowerCase())).slice(0, 5)
        : [],
      drugResults: drugs,
      genderResults: q.length >= 1
        ? GENDER_OPTIONS.filter((g) => g.label.toLowerCase().startsWith(q.toLowerCase()) || g.key.startsWith(q.toLowerCase()))
        : [],
      ageBandResults: q.length >= 1 && abands.length > 0
        ? abands.filter((ab) => ab.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
        : [],
      searching: isSearching,
      query: q,
    }
  }

  const inlineResults = buildResults(query, drugResults, searching, availableAgeBands)
  const cmdResults = buildResults(cmdQuery, cmdDrugResults, cmdSearching, availableAgeBands)

  const searchHandlers: SearchHandlers = {
    activeDrug, activeRegion, activeGender, activeAgeBand,
    onDrugChange, onRegionChange, onGenderChange, onAgeBandChange,
  }

  // ── Drug search (inline) ────────────────────────────────────────────────────

  const searchDrugs = useCallback(async (q: string, setCb: typeof setDrugResults, setSearchingCb: typeof setSearching) => {
    setSearchingCb(true)
    try {
      const data = await gqlFetch<{ searchDrugs: Drug[] }>(SEARCH_DRUGS_QUERY, { query: q })
      setCb(data.searchDrugs)
    } catch {
      setCb([])
    } finally {
      setSearchingCb(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) { setDrugResults([]); return }
    debounceRef.current = setTimeout(() => searchDrugs(query, setDrugResults, setSearching), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, searchDrugs])

  useEffect(() => {
    if (cmdDebounceRef.current) clearTimeout(cmdDebounceRef.current)
    if (cmdQuery.length < 2) { setCmdDrugResults([]); return }
    cmdDebounceRef.current = setTimeout(() => searchDrugs(cmdQuery, setCmdDrugResults, setCmdSearching), 300)
    return () => { if (cmdDebounceRef.current) clearTimeout(cmdDebounceRef.current) }
  }, [cmdQuery, searchDrugs])

  // ── Flat action list for keyboard nav ──────────────────────────────────────

  function buildFlatActions(results: SearchResults, closeFn: () => void) {
    const actions: (() => void)[] = []
    results.regionResults.forEach((r) => actions.push(() => { onRegionChange(r); closeFn() }))
    results.drugResults.forEach((d) => actions.push(() => { onDrugChange(d); closeFn() }))
    results.genderResults.forEach((g) => actions.push(() => { onGenderChange(g.key); closeFn() }))
    results.ageBandResults.forEach((ab) => actions.push(() => { onAgeBandChange(ab); closeFn() }))
    return actions
  }

  function handleInlineKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return
    const actions = buildFlatActions(inlineResults, () => { setQuery(''); setDrugResults([]); setOpen(false); setFocusedIndex(-1) })
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

  function handleCmdKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const actions = buildFlatActions(cmdResults, () => { setCmdOpen(false); setCmdQuery(''); setCmdDrugResults([]); setCmdFocusedIndex(-1) })
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCmdFocusedIndex((i) => Math.min(i + 1, actions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCmdFocusedIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && cmdFocusedIndex >= 0) {
      e.preventDefault()
      actions[cmdFocusedIndex]?.()
      setCmdFocusedIndex(-1)
    }
  }

  // Reset focused index when query changes
  useEffect(() => { setFocusedIndex(-1) }, [query])
  useEffect(() => { setCmdFocusedIndex(-1) }, [cmdQuery])

  // ── Keyboard shortcuts ──────────────────────────────────────────────────────

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen((v) => !v)
        setCmdQuery('')
        setCmdDrugResults([])
        setCmdFocusedIndex(-1)
      }
      if (e.key === 'Escape') {
        setCmdOpen(false)
        setCmdFocusedIndex(-1)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (cmdOpen) {
      setTimeout(() => cmdInputRef.current?.focus(), 50)
    }
  }, [cmdOpen])

  // ── Outside click (inline dropdown) ────────────────────────────────────────

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // ── Dynamic placeholder ─────────────────────────────────────────────────────

  const placeholder = (() => {
    if (!activeDrug) return 'Search for a medication to get started…'
    if (!activeRegion && !activeGender && !activeAgeBand) return 'Add a region, gender, or age band…'
    if (!activeRegion) return 'Add a region to compare local data…'
    if (!activeGender && !activeAgeBand) return 'Filter by gender or age band…'
    return 'Type to replace any active filter…'
  })()

  const hasActiveFilters =
    !!activeDrug || !!activeRegion || !!activeGender || !!activeAgeBand || activeYear !== null

  const genderLabel = (key: string) => GENDER_OPTIONS.find((g) => g.key === key)?.label ?? key

  return (
    <>
      <nav className="border-b border-gray-200 bg-white shrink-0">
        {/* ── Row 1: Logo / Search / User ───────────────────────────── */}
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 px-8 py-3">
          <span className="text-3xl font-bold text-blue-700">Medistat</span>

          {/* Inline search */}
          <div ref={containerRef} className="relative w-full max-w-2xl justify-self-center">
            <div
              className="flex items-center gap-2 px-4 py-2.5 h-12 rounded-xl border border-gray-200 bg-gray-50 focus-within:border-blue-400 focus-within:bg-white cursor-text transition-colors"
              onClick={() => inputRef.current?.focus()}
            >
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(e.target.value.length >= 1) }}
                onKeyDown={handleInlineKeyDown}
                placeholder={placeholder}
                className="flex-1 bg-transparent outline-none text-base text-gray-700 placeholder-gray-400"
              />
              {query ? (
                <button
                  onClick={() => { setQuery(''); setDrugResults([]); setOpen(false) }}
                  className="shrink-0 w-5 h-5 rounded-full bg-gray-300 hover:bg-gray-400 text-white flex items-center justify-center text-sm leading-none"
                  aria-label="Clear search"
                >×</button>
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

            {/* Inline dropdown */}
            {open && (inlineResults.regionResults.length > 0 || inlineResults.drugResults.length > 0 || inlineResults.genderResults.length > 0 || inlineResults.ageBandResults.length > 0 || inlineResults.searching) && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden max-h-96 overflow-y-auto">
                <SearchResultList
                  results={inlineResults}
                  handlers={searchHandlers}
                  onClose={() => { setQuery(''); setDrugResults([]); setOpen(false); setFocusedIndex(-1) }}
                  focusedIndex={focusedIndex}
                />
              </div>
            )}
          </div>

          {/* User controls */}
          <div className="flex items-center justify-end gap-3">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {user?.username?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <span className="text-base font-semibold text-gray-900">{user?.username ?? 'Guest'}</span>
            <button title="Log out" onClick={onLogout} className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Row 2: Active filter chips ─────────────────────────────── */}
        {hasActiveFilters && (
          <div className="px-8 py-2.5 flex flex-wrap items-center justify-center gap-2 border-t border-gray-100">

            {activeDrug && (
              <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                <svg className="w-3 h-3 shrink-0 text-indigo-500" fill="currentColor" viewBox="0 0 512 512">
                  <path d="M467.766,44.211c-29.494-29.494-68.22-44.24-106.884-44.181c-38.666-0.06-77.392,14.688-106.886,44.182l-82.428,82.426l213.71,213.71l82.428-82.426C526.755,198.875,526.755,103.199,467.766,44.211z" />
                  <path d="M44.242,253.966C14.688,283.52,0,322.185,0,360.911c0,38.606,14.746,77.332,44.24,106.826c58.988,58.988,154.666,58.986,213.712-0.06l82.367-82.367l-213.71-213.711L44.242,253.966z" />
                </svg>
                <span className="max-w-48 truncate">{activeDrug.name}</span>
                {activeDrug.narcoticClass && <span className="text-red-600 font-bold text-xs shrink-0">N{activeDrug.narcoticClass}</span>}
                {!savedAtcCodes.has(activeDrug.atcCode) && (
                  <button
                    onClick={() => onSaveDrug(activeDrug)}
                    className="shrink-0 flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-900 border border-indigo-400 hover:border-indigo-700 hover:bg-indigo-200 rounded-full px-2 py-0.5 transition-colors"
                    title="Save to list"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Save
                  </button>
                )}
                <button onClick={() => onDrugChange(null)} className="text-indigo-400 hover:text-indigo-800 text-base leading-none ml-0.5" aria-label="Remove drug">×</button>
              </span>
            )}

            {activeRegion && (
              <span className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {activeRegion.regionName}
                <button onClick={() => onRegionChange(null)} className="text-teal-200 hover:text-white text-base leading-none ml-0.5" aria-label="Remove region">×</button>
              </span>
            )}

            {activeGender && (
              <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {genderLabel(activeGender)}
                <button onClick={() => onGenderChange(null)} className="text-rose-400 hover:text-rose-800 text-base leading-none ml-0.5" aria-label="Remove gender">×</button>
              </span>
            )}

            {activeAgeBand && (
              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {activeAgeBand.name} yrs
                <button onClick={() => onAgeBandChange(null)} className="text-amber-500 hover:text-amber-800 text-base leading-none ml-0.5" aria-label="Remove age band">×</button>
              </span>
            )}

            {/* Year pill with native select overlay */}
            <span className={`relative inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-colors
              ${activeYear !== null ? 'bg-violet-100 text-violet-800 hover:bg-violet-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              <svg className="w-3.5 h-3.5 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="pointer-events-none">{activeYear ?? 'Year'}</span>
              {activeYear === null && (
                <svg className="w-3 h-3 shrink-0 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {activeYear !== null && (
                <button onClick={(e) => { e.stopPropagation(); onYearChange(null) }} className="relative z-10 text-violet-400 hover:text-violet-800 text-base leading-none ml-0.5" aria-label="Remove year">×</button>
              )}
              <select
                value={activeYear ?? ''}
                onChange={(e) => e.target.value && onYearChange(Number(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Filter by year"
              >
                {activeYear === null && <option value="" disabled>Year</option>}
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </span>

            <button
              onClick={() => { onDrugChange(null); onRegionChange(null); onGenderChange(null); onAgeBandChange(null); onYearChange(null) }}
              className="text-xs text-gray-400 hover:text-gray-700 ml-1 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </nav>

      {/* ── Command palette overlay (⌘K) ──────────────────────────────── */}
      {cmdOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setCmdOpen(false) }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setCmdOpen(false)} />

          {/* Panel */}
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[70vh]">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                ref={cmdInputRef}
                type="text"
                value={cmdQuery}
                onChange={(e) => setCmdQuery(e.target.value)}
                onKeyDown={handleCmdKeyDown}
                placeholder="Search medications, regions, gender, age band…"
                className="flex-1 bg-transparent outline-none text-base text-gray-800 placeholder-gray-400"
              />
              {cmdQuery && (
                <button onClick={() => { setCmdQuery(''); setCmdDrugResults([]) }} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Results */}
            <div className="overflow-y-auto flex-1">
              {cmdQuery.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-gray-400">
                  Start typing to search medications, regions, and more…
                </div>
              ) : (
                <SearchResultList
                  results={cmdResults}
                  handlers={searchHandlers}
                  onClose={() => { setCmdOpen(false); setCmdQuery(''); setCmdDrugResults([]); setCmdFocusedIndex(-1) }}
                  focusedIndex={cmdFocusedIndex}
                />
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center gap-4 text-[10px] text-gray-400">
              <span><kbd className="font-mono bg-white border border-gray-200 rounded px-1">↵</kbd> select</span>
              <span><kbd className="font-mono bg-white border border-gray-200 rounded px-1">esc</kbd> close</span>
              <span className="ml-auto">⌘K to toggle</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
