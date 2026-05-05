import type { Ref } from 'react'
import type { RegionalStat } from '../../../types'
import { fmtPer1000 } from '../../../lib/format'

interface Props {
  region: RegionalStat
  rank: number
  fillPct: number
  natPct: number | null
  natAvg: number | null
  isHome: boolean
  isSelected: boolean
  isHoveredFromMap: boolean
  showMarkerLabel: boolean
  rowRef: Ref<HTMLLIElement>
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onMarkerEnter: () => void
  onMarkerLeave: () => void
}

function rowBgClass(
  isSelected: boolean,
  isHoveredFromMap: boolean,
  isHome: boolean
): string {
  if (isSelected) return 'bg-teal-100'
  if (isHoveredFromMap) return 'bg-gray-50'
  if (isHome) return 'bg-gray-50 hover:bg-gray-100'
  return 'hover:bg-gray-50'
}

export default function RegionalRankingRow({
  region,
  rank,
  fillPct,
  natPct,
  natAvg,
  isHome,
  isSelected,
  isHoveredFromMap,
  showMarkerLabel,
  rowRef,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMarkerEnter,
  onMarkerLeave
}: Props) {
  return (
    <li
      ref={rowRef}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`rounded-md px-2 py-1.5 cursor-pointer transition-colors ${rowBgClass(isSelected, isHoveredFromMap, isHome)}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] text-gray-300 tabular-nums shrink-0 w-6">
          #{rank}
        </span>
        <span
          className={`text-xs flex-1 truncate ${
            isHome || isSelected
              ? 'font-semibold text-gray-900'
              : 'text-gray-700'
          }`}
        >
          {region.regionName}
        </span>
        {isHome && (
          <span className="text-[10px] font-semibold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded-full shrink-0">
            You
          </span>
        )}
        <span
          className={`text-xs font-semibold tabular-nums ${
            isHome ? 'text-teal-600' : 'text-gray-500'
          }`}
        >
          {fmtPer1000(region.per1000)}
        </span>
      </div>

      <div className="relative">
        <div className="relative h-1.5 rounded-full bg-gray-200">
          <div
            className={`absolute left-0 top-0 h-1.5 rounded-full ${
              isHome ? 'bg-teal-600' : 'bg-blue-700'
            }`}
            style={{ width: `${fillPct}%` }}
          />
          {natPct !== null && (
            <div
              className="absolute w-0.5 h-3 -top-0.75 bg-gray-500 rounded-full z-10 pointer-events-none"
              style={{ left: `${natPct}%` }}
            />
          )}
        </div>

        {natPct !== null && natAvg !== null && (
          <div
            className="absolute top-0 h-full"
            style={{ left: `calc(${natPct}% - 10px)`, width: 20 }}
            onMouseEnter={onMarkerEnter}
            onMouseLeave={onMarkerLeave}
          >
            {showMarkerLabel && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none">
                <div className="bg-gray-700 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">
                  Avg {fmtPer1000(natAvg)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  )
}
