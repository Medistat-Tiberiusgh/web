import { GENDER_OPTIONS } from './SearchResultList'
import type { AgeBand } from '../../hooks/useFilters'
import type { Drug, Region } from '../../types'

const YEARS = Array.from({ length: 19 }, (_, i) => 2024 - i)

interface Props {
  activeDrug: Drug | null
  activeRegion: Region | null
  activeYear: number | null
  activeGender: string | null
  activeAgeBand: AgeBand | null
  savedAtcCodes: Set<string>
  onDrugChange: (drug: Drug | null) => void
  onRegionChange: (region: Region | null) => void
  onYearChange: (year: number | null) => void
  onGenderChange: (gender: string | null) => void
  onAgeBandChange: (ageBand: AgeBand | null) => void
  onSaveDrug: (drug: Drug) => void
}

export default function FilterChips({
  activeDrug,
  activeRegion,
  activeYear,
  activeGender,
  activeAgeBand,
  savedAtcCodes,
  onDrugChange,
  onRegionChange,
  onYearChange,
  onGenderChange,
  onAgeBandChange,
  onSaveDrug
}: Props) {
  const genderLabel = (key: string) =>
    GENDER_OPTIONS.find((g) => g.key === key)?.label ?? key

  return (
    <div className="px-8 py-2.5 flex flex-wrap items-center justify-center gap-2 border-t border-gray-100">
      {activeDrug && (
        <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1.5 rounded-full">
          <svg
            className="w-3 h-3 shrink-0 text-indigo-500"
            fill="currentColor"
            viewBox="0 0 512 512"
          >
            <path d="M467.766,44.211c-29.494-29.494-68.22-44.24-106.884-44.181c-38.666-0.06-77.392,14.688-106.886,44.182l-82.428,82.426l213.71,213.71l82.428-82.426C526.755,198.875,526.755,103.199,467.766,44.211z" />
            <path d="M44.242,253.966C14.688,283.52,0,322.185,0,360.911c0,38.606,14.746,77.332,44.24,106.826c58.988,58.988,154.666,58.986,213.712-0.06l82.367-82.367l-213.71-213.711L44.242,253.966z" />
          </svg>
          <span className="max-w-48 truncate">{activeDrug.name}</span>
          {activeDrug.narcoticClass && (
            <span className="text-red-600 font-bold text-xs shrink-0">
              N{activeDrug.narcoticClass}
            </span>
          )}
          {!savedAtcCodes.has(activeDrug.atcCode) && (
            <button
              onClick={() => onSaveDrug(activeDrug)}
              className="shrink-0 flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-900 border border-indigo-400 hover:border-indigo-700 hover:bg-indigo-200 rounded-full px-2 py-0.5 transition-colors"
              title="Save to list"
            >
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Save
            </button>
          )}
          <button
            onClick={() => onDrugChange(null)}
            className="text-indigo-400 hover:text-indigo-800 text-base leading-none ml-0.5"
            aria-label="Remove drug"
          >
            ×
          </button>
        </span>
      )}

      {activeRegion && (
        <span className="inline-flex items-center gap-1.5 bg-teal-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
          <svg
            className="w-3.5 h-3.5 shrink-0"
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
          {activeRegion.regionName}
          <button
            onClick={() => onRegionChange(null)}
            className="text-teal-200 hover:text-white text-base leading-none ml-0.5"
            aria-label="Remove region"
          >
            ×
          </button>
        </span>
      )}

      {activeGender && (
        <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-sm font-semibold px-3 py-1.5 rounded-full">
          <svg
            className="w-3.5 h-3.5 shrink-0"
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
          {genderLabel(activeGender)}
          <button
            onClick={() => onGenderChange(null)}
            className="text-rose-400 hover:text-rose-800 text-base leading-none ml-0.5"
            aria-label="Remove gender"
          >
            ×
          </button>
        </span>
      )}

      {activeAgeBand && (
        <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1.5 rounded-full">
          <svg
            className="w-3.5 h-3.5 shrink-0"
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
          {activeAgeBand.name} yrs
          <button
            onClick={() => onAgeBandChange(null)}
            className="text-amber-500 hover:text-amber-800 text-base leading-none ml-0.5"
            aria-label="Remove age band"
          >
            ×
          </button>
        </span>
      )}

      <span
        className={`relative inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-colors
        ${activeYear !== null ? 'bg-violet-100 text-violet-800 hover:bg-violet-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
      >
        <svg
          className="w-3.5 h-3.5 shrink-0 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="pointer-events-none">{activeYear ?? 'Year'}</span>
        {activeYear === null && (
          <svg
            className="w-3 h-3 shrink-0 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
        {activeYear !== null && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onYearChange(null)
            }}
            className="relative z-10 text-violet-400 hover:text-violet-800 text-base leading-none ml-0.5"
            aria-label="Remove year"
          >
            ×
          </button>
        )}
        <select
          value={activeYear ?? ''}
          onChange={(e) =>
            e.target.value && onYearChange(Number(e.target.value))
          }
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Filter by year"
        >
          {activeYear === null && (
            <option value="" disabled>
              Year
            </option>
          )}
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </span>

      <button
        onClick={() => {
          onDrugChange(null)
          onRegionChange(null)
          onGenderChange(null)
          onAgeBandChange(null)
          onYearChange(null)
        }}
        className="text-xs text-gray-400 hover:text-gray-700 ml-1 transition-colors"
      >
        Clear all
      </button>
    </div>
  )
}
