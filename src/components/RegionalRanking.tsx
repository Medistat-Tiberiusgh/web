import { useState, useEffect, useRef } from 'react'
import { Chip } from '@heroui/react'
import type { RegionalStat } from '../types'
import { useUser } from '../context/UserContext'

interface Props {
  regions: RegionalStat[]
  selectedRegionId?: number | null
  hoveredRegionId?: number | null
  onHoverRegion?: (id: number | null) => void
  onRegionClick?: (regionId: number, regionName: string) => void
}

export default function RegionalRanking({ regions, selectedRegionId, hoveredRegionId, onHoverRegion, onRegionClick }: Props) {
  const user = useUser()
  const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null)
  const selectedRowRef = useRef<HTMLLIElement | null>(null)

  // Scroll the selected region into view when it changes
  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedRegionId])

  const ranked = regions
    .filter((r) => r.regionId !== 0)
    .sort((a, b) => b.per1000 - a.per1000)

  const maxValue = Math.max(...ranked.map((r) => r.per1000), 1)

  const natStat = regions.find((r) => r.regionId === 0)
  const natAvg = natStat?.per1000 ?? (
    ranked.length > 0 ? ranked.reduce((s, r) => s + r.per1000, 0) / ranked.length : null
  )
  const natPct = natAvg !== null ? (natAvg / maxValue) * 100 : null

  return (
    <div className="flex flex-col h-full">
      <ul className="flex-1 overflow-y-auto px-3 py-1 flex flex-col">
        {ranked.map((region, i) => {
          const isHome = user?.regionId != null && region.regionId === user.regionId
          const isSelected = selectedRegionId === region.regionId
          const isHoveredFromMap = hoveredRegionId === region.regionId
          const fillPct = (region.per1000 / maxValue) * 100
          const showLabel = hoveredMarkerId === region.regionId

          return (
            <li
              key={region.regionId}
              ref={isSelected ? selectedRowRef : null}
              className={`rounded-md px-2 py-1.5 cursor-pointer transition-colors
                ${isSelected ? 'bg-teal-100' : isHoveredFromMap ? 'bg-gray-50' : isHome ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-50'}`}
              onClick={() => onRegionClick?.(region.regionId, region.regionName)}
              onMouseEnter={() => onHoverRegion?.(region.regionId)}
              onMouseLeave={() => onHoverRegion?.(null)}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] text-gray-300 tabular-nums shrink-0 w-6">
                  #{i + 1}
                </span>
                <span className={`text-xs flex-1 truncate ${isHome || isSelected ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                  {region.regionName}
                </span>
                {isHome && <Chip size="sm" variant="soft" color="accent">You</Chip>}
                <span className={`text-xs font-semibold tabular-nums ${isHome ? 'text-teal-600' : 'text-gray-500'}`}>
                  {region.per1000.toFixed(1)}
                </span>
              </div>

              {/* Bar — full width, symmetric with the row above */}
              <div className="relative">
                <div className="relative h-1.5 rounded-full bg-gray-200">
                  <div
                    className={`absolute left-0 top-0 h-1.5 rounded-full ${isHome ? 'bg-teal-500' : 'bg-blue-600/60'}`}
                    style={{ width: `${fillPct}%` }}
                  />
                  {natPct !== null && (
                    <div
                      className="absolute w-0.5 h-3 -top-0.75 bg-gray-500 rounded-full z-10 pointer-events-none"
                      style={{ left: `${natPct}%` }}
                    />
                  )}
                </div>

                {/* Hit area around marker */}
                {natPct !== null && natAvg !== null && (
                  <div
                    className="absolute top-0 h-full"
                    style={{ left: `calc(${natPct}% - 10px)`, width: 20 }}
                    onMouseEnter={() => setHoveredMarkerId(region.regionId)}
                    onMouseLeave={() => setHoveredMarkerId(null)}
                  >
                    {showLabel && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none">
                        <div className="bg-gray-700 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap">
                          Avg {natAvg.toFixed(1)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {natAvg !== null && (
        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-1.5">
          <div className="w-0.5 h-3 bg-gray-500 rounded-full shrink-0" />
          <span className="text-[10px] text-gray-400">
            National avg: {natAvg.toFixed(1)} per 1,000
          </span>
        </div>
      )}
    </div>
  )
}
