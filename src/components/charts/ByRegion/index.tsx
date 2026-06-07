import { useState } from 'react'
import type { RegionalStat } from '../../../types'
import { COLOR_DIVIDER } from '../../../theme'
import RegionMap from './RegionMap'
import Ranking from './Ranking'

interface Props {
  regions: RegionalStat[]
  nationalAverage: number | null
  selectedRegionId: number | null
  onRegionClick: (regionId: number, regionName: string) => void
}

// Map and ranking are two views of the same regions. The hovered region is
// shared so pointing at one view highlights the other.
export default function ByRegion({
  regions,
  nationalAverage,
  selectedRegionId,
  onRegionClick
}: Props) {
  const [hoveredRegionId, setHoveredRegionId] = useState<number | null>(null)

  return (
    <div className="flex h-full w-full">
      <div className="basis-2/5 min-w-0 h-full">
        <RegionMap
          regions={regions}
          nationalAverage={nationalAverage}
          selectedRegionId={selectedRegionId}
          hoveredRegionId={hoveredRegionId}
          onHoverRegion={setHoveredRegionId}
          onRegionClick={onRegionClick}
        />
      </div>
      <div
        className="basis-3/5 min-w-0 h-full"
        style={{ borderLeft: `1px solid ${COLOR_DIVIDER}` }}
      >
        <Ranking
          regions={regions}
          nationalAverage={nationalAverage}
          selectedRegionId={selectedRegionId}
          hoveredRegionId={hoveredRegionId}
          onHoverRegion={setHoveredRegionId}
          onRegionClick={onRegionClick}
        />
      </div>
    </div>
  )
}
