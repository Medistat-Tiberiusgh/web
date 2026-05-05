import { useState, useEffect, useRef } from 'react'
import type { RegionalStat } from '../../../types'
import { useUser } from '../../../context/UserContext'
import { fmtPer1000 } from '../../../lib/format'
import RegionalRankingRow from './RegionalRankingRow'

interface Props {
  regions: RegionalStat[]
  nationalAverage: number | null
  selectedRegionId?: number | null
  hoveredRegionId?: number | null
  onHoverRegion?: (id: number | null) => void
  onRegionClick?: (regionId: number, regionName: string) => void
}

export default function RegionalRanking({
  regions,
  nationalAverage,
  selectedRegionId,
  hoveredRegionId,
  onHoverRegion,
  onRegionClick
}: Props) {
  const user = useUser()
  const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null)
  const selectedRowRef = useRef<HTMLLIElement | null>(null)

  useEffect(() => {
    selectedRowRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth'
    })
  }, [selectedRegionId])

  const ranked = [...regions].sort((a, b) => b.per1000 - a.per1000)
  const maxValue = Math.max(...ranked.map((r) => r.per1000), 1)
  const natPct =
    nationalAverage !== null ? (nationalAverage / maxValue) * 100 : null

  return (
    <div className="flex flex-col h-full">
      <ul className="flex-1 overflow-y-auto px-3 py-1 flex flex-col">
        {ranked.map((region, i) => {
          const isSelected = selectedRegionId === region.regionId
          return (
            <RegionalRankingRow
              key={region.regionId}
              region={region}
              rank={i + 1}
              fillPct={(region.per1000 / maxValue) * 100}
              natPct={natPct}
              natAvg={nationalAverage}
              isHome={
                user?.regionId != null && region.regionId === user.regionId
              }
              isSelected={isSelected}
              isHoveredFromMap={hoveredRegionId === region.regionId}
              showMarkerLabel={hoveredMarkerId === region.regionId}
              rowRef={isSelected ? selectedRowRef : null}
              onClick={() =>
                onRegionClick?.(region.regionId, region.regionName)
              }
              onMouseEnter={() => onHoverRegion?.(region.regionId)}
              onMouseLeave={() => onHoverRegion?.(null)}
              onMarkerEnter={() => setHoveredMarkerId(region.regionId)}
              onMarkerLeave={() => setHoveredMarkerId(null)}
            />
          )
        })}
      </ul>

      {nationalAverage !== null && (
        <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-1.5">
          <div className="w-0.5 h-3 bg-gray-500 rounded-full shrink-0" />
          <span className="text-[10px] text-gray-400">
            National avg: {fmtPer1000(nationalAverage)} per 1,000
          </span>
        </div>
      )}
    </div>
  )
}
