import { useState } from 'react'
import type { RegionalStat } from '../../../types'
import {
  COLOR_DIVIDER,
  COLOR_MAP_BELOW_LOW,
  COLOR_MAP_BELOW_HIGH,
  COLOR_MAP_ABOVE_LOW,
  COLOR_MAP_ABOVE_HIGH,
  COLOR_LEGEND_BELOW,
  FONT_LEGEND_SCALE
} from '../../../theme'
import RegionMap from './RegionMap'
import Ranking from './Ranking'

// Diverging color scale for the map fill — lives with the map (left), not the
// ranking, so it reads as the map's key.
function MapScaleLegend() {
  return (
    <div
      className="flex flex-col items-start gap-1 px-3 pt-2 shrink-0"
      style={{ fontSize: FONT_LEGEND_SCALE }}
    >
      <div className="flex items-center gap-1.5">
        <div
          className="h-1.5 w-16 rounded-full shrink-0"
          style={{
            background: `linear-gradient(to right, ${COLOR_MAP_BELOW_LOW}, ${COLOR_MAP_BELOW_HIGH})`
          }}
        />
        <span
          className="whitespace-nowrap"
          style={{ color: COLOR_LEGEND_BELOW }}
        >
          Below average
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div
          className="h-1.5 w-16 rounded-full shrink-0"
          style={{
            background: `linear-gradient(to right, ${COLOR_MAP_ABOVE_LOW}, ${COLOR_MAP_ABOVE_HIGH})`
          }}
        />
        <span
          className="whitespace-nowrap"
          style={{ color: COLOR_MAP_ABOVE_HIGH }}
        >
          Above average
        </span>
      </div>
    </div>
  )
}

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
      <div className="basis-1/3 min-w-0 h-full flex flex-col">
        <MapScaleLegend />
        <div className="flex-1 min-h-0">
          <RegionMap
            regions={regions}
            nationalAverage={nationalAverage}
            selectedRegionId={selectedRegionId}
            hoveredRegionId={hoveredRegionId}
            onHoverRegion={setHoveredRegionId}
            onRegionClick={onRegionClick}
          />
        </div>
      </div>
      <div
        className="basis-2/3 min-w-0 h-full"
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
