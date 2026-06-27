import { GENDER_OPTIONS } from '../../lib/searchResults'
import type { AgeBand, Drug, Region } from '../../types'
import {
  TEXT_MUTED,
  TEXT_DANGER,
  TEXT_DRUG,
  CHIP_DRUG,
  CHIP_DRUG_CLOSE,
  CHIP_REGION,
  CHIP_REGION_CLOSE,
  CHIP_GENDER,
  CHIP_GENDER_CLOSE,
  CHIP_AGE,
  CHIP_AGE_CLOSE,
  CHIP_YEAR,
  CHIP_YEAR_CLOSE,
  CHIP_INACTIVE
} from '../../theme'

interface Props {
  activeDrug: Drug | null
  activeRegion: Region | null
  activeYear: number | null
  activeGender: string | null
  activeAgeBand: AgeBand | null
  years: number[]
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
  years,
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
    <div className="flex flex-wrap items-center gap-2">
      {activeDrug && (
        <span
          className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full ${CHIP_DRUG}`}
        >
          <svg
            className={`w-3 h-3 shrink-0 ${TEXT_DRUG}`}
            fill="currentColor"
            viewBox="0 0 512 512"
          >
            <path d="M467.766,44.211c-29.494-29.494-68.22-44.24-106.884-44.181c-38.666-0.06-77.392,14.688-106.886,44.182l-82.428,82.426l213.71,213.71l82.428-82.426C526.755,198.875,526.755,103.199,467.766,44.211z" />
            <path d="M44.242,253.966C14.688,283.52,0,322.185,0,360.911c0,38.606,14.746,77.332,44.24,106.826c58.988,58.988,154.666,58.986,213.712-0.06l82.367-82.367l-213.71-213.711L44.242,253.966z" />
          </svg>
          <span className="max-w-48 truncate">{activeDrug.name}</span>
          {activeDrug.narcoticClass && (
            <span className={`font-bold text-xs shrink-0 ${TEXT_DANGER}`}>
              N{activeDrug.narcoticClass}
            </span>
          )}
          {!savedAtcCodes.has(activeDrug.atcCode) && (
            <button
              onClick={() => onSaveDrug(activeDrug)}
              className="shrink-0 flex items-center text-indigo-600 hover:text-indigo-900 border border-indigo-400 hover:border-indigo-700 hover:bg-indigo-200 rounded-full p-1 transition-colors"
              title="Save to list"
              aria-label="Save to list"
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
            </button>
          )}
          <button
            onClick={() => onDrugChange(null)}
            className={`text-base leading-none ml-0.5 ${CHIP_DRUG_CLOSE}`}
            aria-label="Remove drug"
          >
            ×
          </button>
        </span>
      )}

      {activeRegion && (
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${CHIP_REGION}`}
        >
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
            className={`text-base leading-none ml-0.5 ${CHIP_REGION_CLOSE}`}
            aria-label="Remove region"
          >
            ×
          </button>
        </span>
      )}

      {activeGender && (
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${CHIP_GENDER}`}
        >
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
            className={`text-base leading-none ml-0.5 ${CHIP_GENDER_CLOSE}`}
            aria-label="Remove gender"
          >
            ×
          </button>
        </span>
      )}

      {activeAgeBand && (
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full ${CHIP_AGE}`}
        >
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
            className={`text-base leading-none ml-0.5 ${CHIP_AGE_CLOSE}`}
            aria-label="Remove age band"
          >
            ×
          </button>
        </span>
      )}

      <span
        className={`relative inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-colors
        ${activeYear !== null ? CHIP_YEAR : CHIP_INACTIVE}`}
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
            className={`w-3 h-3 shrink-0 pointer-events-none ${TEXT_MUTED}`}
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
            className={`relative z-10 text-base leading-none ml-0.5 ${CHIP_YEAR_CLOSE}`}
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
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </span>
    </div>
  )
}
