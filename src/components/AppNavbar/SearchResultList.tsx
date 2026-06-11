import { Command as CommandPrimitive } from 'cmdk'
import type { SearchHandlers, SearchResults } from '../../lib/searchResults'
import {
  TEXT_HEADING,
  TEXT_MUTED,
  TEXT_DANGER,
  TEXT_REGION,
  TEXT_DRUG,
  TEXT_GENDER,
  TEXT_AGE,
  SURFACE_MUTED,
  SURFACE_SELECTED,
  BORDER_SUBTLE
} from '../../theme'

const HEADING_CLASS = `px-3 py-1.5 text-xs font-semibold uppercase tracking-wider border-b ${TEXT_MUTED} ${SURFACE_MUTED} ${BORDER_SUBTLE}`

function itemClass(extra = '') {
  return `flex items-center gap-3 px-4 cursor-pointer transition-colors ${SURFACE_SELECTED} ${extra}`
}

export default function SearchResultList({
  results,
  handlers,
  onClose
}: {
  results: SearchResults
  handlers: SearchHandlers
  onClose: () => void
}) {
  const {
    regionResults,
    drugResults,
    genderResults,
    ageBandResults,
    searching,
    query
  } = results
  const { activeDrug, activeRegion, activeGender, activeAgeBand } = handlers

  // Keep the pointer-down from blurring the inline search input before the
  // item's onSelect fires.
  function keepFocus(e: React.MouseEvent) {
    e.preventDefault()
  }

  const hasResults =
    regionResults.length > 0 ||
    drugResults.length > 0 ||
    genderResults.length > 0 ||
    ageBandResults.length > 0 ||
    searching

  if (!hasResults) {
    return (
      <div className={`px-4 py-3 text-base ${TEXT_MUTED}`}>
        No results for &ldquo;{query}&rdquo;
      </div>
    )
  }

  return (
    <>
      {regionResults.length > 0 && (
        <>
          <div className={HEADING_CLASS}>Regions</div>
          {regionResults.map((region) => (
            <CommandPrimitive.Item
              key={region.id}
              value={`region-${region.id}`}
              className={itemClass('py-2.5')}
              onMouseDown={keepFocus}
              onSelect={() => {
                handlers.onRegionChange(region)
                onClose()
              }}
            >
              <svg
                className={`w-3.5 h-3.5 shrink-0 ${TEXT_REGION}`}
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
              <span className={`text-base flex-1 ${TEXT_HEADING}`}>
                {region.regionName}
              </span>
              {activeRegion?.id === region.id && (
                <span className={`text-xs font-semibold ${TEXT_REGION}`}>
                  active
                </span>
              )}
            </CommandPrimitive.Item>
          ))}
        </>
      )}

      {(drugResults.length > 0 || searching) && (
        <>
          <div className={HEADING_CLASS}>Medications</div>
          {searching && drugResults.length === 0 ? (
            <div className={`px-4 py-3 text-base ${TEXT_MUTED}`}>Searching…</div>
          ) : (
            drugResults.map((drug) => (
              <CommandPrimitive.Item
                key={drug.atcCode}
                value={`drug-${drug.atcCode}`}
                className={itemClass('py-3 justify-between')}
                onMouseDown={keepFocus}
                onSelect={() => {
                  handlers.onDrugChange(drug)
                  onClose()
                }}
              >
                <div className="flex flex-col min-w-0">
                  <span className={`text-base truncate ${TEXT_HEADING}`}>
                    {drug.name}
                  </span>
                  <span className={`text-sm ${TEXT_MUTED}`}>{drug.atcCode}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {drug.narcoticClass && (
                    <span className={`text-sm font-bold ${TEXT_DANGER}`}>
                      N{drug.narcoticClass}
                    </span>
                  )}
                  {activeDrug?.atcCode === drug.atcCode && (
                    <span className={`text-xs font-semibold ${TEXT_DRUG}`}>
                      active
                    </span>
                  )}
                </div>
              </CommandPrimitive.Item>
            ))
          )}
        </>
      )}

      {genderResults.length > 0 && (
        <>
          <div className={HEADING_CLASS}>
            Gender
            {activeAgeBand && (
              <span className={`ml-2 normal-case font-normal ${TEXT_AGE}`}>
                · replaces age band filter
              </span>
            )}
          </div>
          {genderResults.map((g) => (
            <CommandPrimitive.Item
              key={g.key}
              value={`gender-${g.key}`}
              className={itemClass('py-3')}
              onMouseDown={keepFocus}
              onSelect={() => {
                handlers.onGenderChange(g.key)
                onClose()
              }}
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
              <span className={`text-base flex-1 ${TEXT_HEADING}`}>{g.label}</span>
              {activeGender === g.key && (
                <span className={`text-xs font-semibold ${TEXT_GENDER}`}>
                  active
                </span>
              )}
            </CommandPrimitive.Item>
          ))}
        </>
      )}

      {ageBandResults.length > 0 && (
        <>
          <div className={HEADING_CLASS}>
            Age Band
            {activeGender && (
              <span className={`ml-2 normal-case font-normal ${TEXT_GENDER}`}>
                · replaces gender filter
              </span>
            )}
          </div>
          {ageBandResults.map((ab) => (
            <CommandPrimitive.Item
              key={ab.id}
              value={`age-${ab.id}`}
              className={itemClass('py-3')}
              onMouseDown={keepFocus}
              onSelect={() => {
                handlers.onAgeBandChange(ab)
                onClose()
              }}
            >
              <svg
                className={`w-4 h-4 shrink-0 ${TEXT_AGE}`}
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
              <span className={`text-base flex-1 ${TEXT_HEADING}`}>
                {ab.name} yrs
              </span>
              {activeAgeBand?.id === ab.id && (
                <span className={`text-xs font-semibold ${TEXT_AGE}`}>
                  active
                </span>
              )}
            </CommandPrimitive.Item>
          ))}
        </>
      )}
    </>
  )
}
