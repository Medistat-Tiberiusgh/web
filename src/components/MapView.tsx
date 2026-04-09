import { useState, useEffect } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { useUser } from '../context/UserContext'
import type { RegionalStat } from '../types'
import type { FeatureCollection } from 'geojson'

interface Props {
  regions: RegionalStat[]
}

// Diverging color scale centered on the user's region value.
// Below user → blue scale (#bfdbfe → #1d4ed8); above user → orange-red scale (#fed7aa → #c2410c).
function getDivergingColor(
  value: number,
  userValue: number,
  min: number,
  max: number
): string {
  if (value < userValue) {
    // blue-200 (#bfdbfe) → blue-700 (#1d4ed8)
    const t = userValue === min ? 0 : (userValue - value) / (userValue - min)
    const r = Math.round(191 - t * (191 - 29))
    const g = Math.round(219 - t * (219 - 78))
    const b = Math.round(254 - t * (254 - 216))
    return `rgb(${r},${g},${b})`
  } else {
    // orange-200 (#fed7aa) → orange-700 (#c2410c)
    const t = max === userValue ? 0 : (value - userValue) / (max - userValue)
    const r = Math.round(254 - t * (254 - 194))
    const g = Math.round(215 - t * (215 - 65))
    const b = Math.round(170 - t * (170 - 12))
    return `rgb(${r},${g},${b})`
  }
}

interface TooltipState {
  x: number
  y: number
  region: RegionalStat
}

const WIDTH = 320
const HEIGHT = 700

export default function MapView({ regions }: Props) {
  const user = useUser()
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  useEffect(() => {
    fetch('/sweden-counties.geojson')
      .then((r) => r.json())
      .then(setGeoJson)
      .catch(() => setGeoJson(null))
  }, [])

  const filtered = regions.filter((r) => r.regionId !== 0)
  const values = filtered.map((r) => r.per1000)
  const min = Math.min(...values)
  const max = Math.max(...values)

  const userRegion = user
    ? filtered.find((r) => r.regionId === user.regionId)
    : null
  const userPer1000 = userRegion?.per1000 ?? null
  const regionById = new Map(filtered.map((r) => [r.regionId, r]))

  // Rank: 1 = highest per1000
  const sorted = [...filtered].sort((a, b) => b.per1000 - a.per1000)
  const rankById = new Map(sorted.map((r, i) => [r.regionId, i + 1]))

  const projection = geoJson
    ? geoMercator().fitExtent(
        [
          [0, 4],
          [WIDTH, HEIGHT - 4]
        ],
        geoJson
      )
    : geoMercator()
  const pathGenerator = geoPath().projection(projection)

  return (
    <div className="flex flex-col h-full">
      {filtered.length === 0 ? (
        <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
          {geoJson ? 'Select a medication to see the map' : 'Loading map…'}
        </div>
      ) : (
        <div className="flex-1 min-h-0 relative">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            style={{ width: '100%', height: '100%' }}
          >
            {geoJson?.features.map((feature) => {
              const id = feature.id as number
              const region = regionById.get(id)
              const isUserRegion = id === user?.regionId
              const fill = isUserRegion
                ? '#0d9488' // teal-600
                : region && userPer1000 !== null
                  ? getDivergingColor(region.per1000, userPer1000, min, max)
                  : region
                    ? '#dbeafe'
                    : '#e5e7eb'
              const d = pathGenerator(feature) ?? ''

              return (
                <path
                  key={id}
                  d={d}
                  fill={fill}
                  stroke="white"
                  strokeWidth={0.8}
                  style={{ cursor: region ? 'pointer' : 'default' }}
                  onMouseEnter={(e) =>
                    region && setTooltip({ x: e.clientX, y: e.clientY, region })
                  }
                  onMouseMove={(e) =>
                    region && setTooltip({ x: e.clientX, y: e.clientY, region })
                  }
                  onMouseLeave={() => setTooltip(null)}
                />
              )
            })}
          </svg>

          {tooltip &&
            (() => {
              const hovered = tooltip.region
              const isUserRegion = hovered.regionId === user?.regionId
              const rank = rankById.get(hovered.regionId)
              const total = filtered.length

              // delta vs user's region
              const diff =
                userPer1000 !== null ? hovered.per1000 - userPer1000 : null
              const pct =
                diff !== null && userPer1000 ? (diff / userPer1000) * 100 : null

              let footerText: string | null = null
              if (!isUserRegion && pct !== null) {
                const absPct = Math.abs(pct)
                const dir = pct > 0 ? 'higher' : 'lower'
                footerText =
                  absPct < 5
                    ? `${hovered.regionName}: about the same as your region.`
                    : `${hovered.regionName}: dispensed ${absPct.toFixed(0)}% ${dir} than your region.`
              }

              // Flip tooltip to the left if it would overflow the right edge
              const tooltipWidth = 224
              const flipLeft = tooltip.x + 14 + tooltipWidth > window.innerWidth
              const leftPos = flipLeft
                ? tooltip.x - tooltipWidth - 8
                : tooltip.x + 14

              return (
                <div
                  className="fixed z-50 pointer-events-none bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden text-xs"
                  style={{ left: leftPos, top: tooltip.y - 10, width: tooltipWidth }}
                >
                  {/* Header */}
                  <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                    <span className="font-semibold text-gray-800">
                      {hovered.regionName}
                    </span>
                    {isUserRegion && (
                      <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700">
                        Your region
                      </span>
                    )}
                  </div>

                  {/* Two-column body */}
                  <div className="flex divide-x divide-gray-100">
                    {/* Hovered region */}
                    <div
                      className={`flex-1 px-3 py-2 ${isUserRegion ? 'bg-teal-50/60' : ''}`}
                    >
                      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
                        per 1,000
                      </p>
                      <span
                        className={`text-lg font-bold ${isUserRegion ? 'text-teal-700' : 'text-gray-800'}`}
                      >
                        {hovered.per1000.toFixed(1)}
                      </span>
                    </div>

                    {/* User's region (only if different) */}
                    {!isUserRegion && userRegion && (
                      <div className="flex-1 px-3 py-2 bg-teal-50/60">
                        <p className="text-[10px] font-semibold tracking-widest text-teal-600 uppercase mb-1.5">
                          Your region
                        </p>
                        <span className="text-lg font-bold text-teal-700">
                          {userRegion.per1000.toFixed(1)}
                        </span>
                      </div>
                    )}

                    {/* If user's region — show rank */}
                    {isUserRegion && rank && (
                      <div className="flex-1 px-3 py-2">
                        <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
                          Rank
                        </p>
                        <span className="text-lg font-bold text-gray-600">
                          #{rank}
                          <span className="text-sm font-normal text-gray-400">
                            {' '}
                            / {total}
                          </span>
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {footerText && (
                    <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
                      <p className="text-[10px] text-teal-600 max-w-52">
                        {footerText}
                      </p>
                    </div>
                  )}
                </div>
              )
            })()}
        </div>
      )}
    </div>
  )
}
