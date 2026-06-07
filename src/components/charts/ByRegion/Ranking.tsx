import { useState } from 'react'
import type { RegionalStat } from '../../../types'
import { fmtPer1000 } from '../../../lib/format'
import {
  COLOR_NATIONAL,
  COLOR_ROW_SELECTED,
  COLOR_ROW_HOVER,
  COLOR_DIVIDER,
  COLOR_RANK,
  COLOR_ROW_NAME_SELECTED,
  COLOR_ROW_NAME,
  COLOR_ROW_VALUE,
  COLOR_BAR_TRACK,
  COLOR_MARKER_LABEL_BG,
  COLOR_MARKER_LABEL_TEXT,
  COLOR_ROW_FOOTER,
  FONT_ROW,
  FONT_TICK,
  FONT_LABEL
} from '../../../theme'

interface Props {
  regions: RegionalStat[]
  nationalAverage: number | null
  selectedRegionId: number | null
  hoveredRegionId: number | null
  onHoverRegion: (regionId: number | null) => void
  onRegionClick: (regionId: number, regionName: string) => void
}

interface RowProps {
  region: RegionalStat
  rank: number
  fillPercent: number
  nationalPercent: number | null
  nationalAverage: number | null
  isSelected: boolean
  isHoveredFromMap: boolean
  showMarkerLabel: boolean
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onMarkerEnter: () => void
  onMarkerLeave: () => void
}

function rowBackground(
  isSelected: boolean,
  isHoveredFromMap: boolean
): string | undefined {
  if (isSelected) return COLOR_ROW_SELECTED
  if (isHoveredFromMap) return COLOR_ROW_HOVER
  return undefined
}

interface AverageMarkerProps {
  percent: number
  average: number
  showLabel: boolean
  onEnter: () => void
  onLeave: () => void
}

// National-average reference overlaid on a row's bar: a tick line plus a
// hover hit-area that reveals the value.
function AverageMarker({
  percent,
  average,
  showLabel,
  onEnter,
  onLeave
}: AverageMarkerProps) {
  return (
    <>
      <div
        className="absolute w-0.5 h-3 -top-0.75 rounded-full z-10 pointer-events-none"
        style={{ left: `${percent}%`, backgroundColor: COLOR_ROW_VALUE }}
      />
      <div
        className="absolute top-0 h-full"
        style={{ left: `calc(${percent}% - 10px)`, width: 20 }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {showLabel && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 pointer-events-none">
            <div
              className="px-1.5 py-0.5 rounded whitespace-nowrap"
              style={{
                backgroundColor: COLOR_MARKER_LABEL_BG,
                color: COLOR_MARKER_LABEL_TEXT,
                fontSize: FONT_LABEL
              }}
            >
              Avg {fmtPer1000(average)}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function RankingRow({
  region,
  rank,
  fillPercent,
  nationalPercent,
  nationalAverage,
  isSelected,
  isHoveredFromMap,
  showMarkerLabel,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMarkerEnter,
  onMarkerLeave
}: RowProps) {
  return (
    <li
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="flex-1 min-h-0 flex flex-col justify-center rounded-md px-2 cursor-pointer transition-colors"
      style={{ backgroundColor: rowBackground(isSelected, isHoveredFromMap) }}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        <span
          className="tabular-nums shrink-0 w-6"
          style={{ color: COLOR_RANK, fontSize: FONT_TICK }}
        >
          #{rank}
        </span>
        <span
          className="flex-1 truncate"
          style={{
            color: isSelected ? COLOR_ROW_NAME_SELECTED : COLOR_ROW_NAME,
            fontSize: FONT_ROW,
            fontWeight: isSelected ? 600 : 400
          }}
        >
          {region.regionName}
        </span>
        <span
          className="tabular-nums"
          style={{ color: COLOR_ROW_VALUE, fontSize: FONT_ROW, fontWeight: 600 }}
        >
          {fmtPer1000(region.per1000)}
        </span>
      </div>

      <div className="relative">
        <div
          className="relative h-1.5 rounded-full"
          style={{ backgroundColor: COLOR_BAR_TRACK }}
        >
          <div
            className="absolute left-0 top-0 h-1.5 rounded-full"
            style={{ width: `${fillPercent}%`, backgroundColor: COLOR_NATIONAL }}
          />
        </div>

        {nationalPercent !== null && nationalAverage !== null && (
          <AverageMarker
            percent={nationalPercent}
            average={nationalAverage}
            showLabel={showMarkerLabel}
            onEnter={onMarkerEnter}
            onLeave={onMarkerLeave}
          />
        )}
      </div>
    </li>
  )
}

export default function Ranking({
  regions,
  nationalAverage,
  selectedRegionId,
  hoveredRegionId,
  onHoverRegion,
  onRegionClick
}: Props) {
  const [hoveredMarkerId, setHoveredMarkerId] = useState<number | null>(null)

  const ranked = [...regions].sort((a, b) => b.per1000 - a.per1000)
  const maxValue = Math.max(...ranked.map((region) => region.per1000), 1)
  const nationalPercent =
    nationalAverage !== null ? (nationalAverage / maxValue) * 100 : null

  return (
    <div className="flex flex-col h-full">
      <ul className="flex-1 min-h-0 overflow-hidden px-3 py-1 flex flex-col">
        {ranked.map((region, index) => {
          const isSelected = selectedRegionId === region.regionId
          const isHoveredFromMap = hoveredRegionId === region.regionId
          return (
            <RankingRow
              key={region.regionId}
              region={region}
              rank={index + 1}
              fillPercent={(region.per1000 / maxValue) * 100}
              nationalPercent={nationalPercent}
              nationalAverage={nationalAverage}
              isSelected={isSelected}
              isHoveredFromMap={isHoveredFromMap}
              showMarkerLabel={hoveredMarkerId === region.regionId}
              onClick={() => onRegionClick(region.regionId, region.regionName)}
              onMouseEnter={() => onHoverRegion(region.regionId)}
              onMouseLeave={() => onHoverRegion(null)}
              onMarkerEnter={() => setHoveredMarkerId(region.regionId)}
              onMarkerLeave={() => setHoveredMarkerId(null)}
            />
          )
        })}
      </ul>

      {nationalAverage !== null && (
        <div
          className="px-4 py-2 flex items-center gap-1.5 shrink-0"
          style={{ borderTop: `1px solid ${COLOR_DIVIDER}` }}
        >
          <div
            className="w-0.5 h-3 rounded-full shrink-0"
            style={{ backgroundColor: COLOR_ROW_VALUE }}
          />
          <span style={{ color: COLOR_ROW_FOOTER, fontSize: FONT_TICK }}>
            National avg: {fmtPer1000(nationalAverage)} per 1,000
          </span>
        </div>
      )}
    </div>
  )
}
