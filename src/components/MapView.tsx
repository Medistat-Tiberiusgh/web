import { useState, useEffect } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { useUser } from '../context/UserContext'
import type { Region } from '../types'
import type { FeatureCollection } from 'geojson'

interface Props {
  regions: Region[]
}

// Interpolate from light blue (#dbeafe = rgb(219,234,254)) to dark blue (#1e40af = rgb(30,64,175))
function getColor(value: number, min: number, max: number): string {
  const t = max === min ? 0 : (value - min) / (max - min)
  const r = Math.round(219 - t * (219 - 30))
  const g = Math.round(234 - t * (234 - 64))
  const b = Math.round(254 - t * (254 - 175))
  return `rgb(${r},${g},${b})`
}

interface TooltipState {
  x: number
  y: number
  region: Region
}

const WIDTH = 500
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

  const userRegion = user ? filtered.find((r) => r.regionId === user.regionId) : null
  const userPer1000 = userRegion?.per1000 ?? null
  const regionById = new Map(filtered.map((r) => [r.regionId, r]))

  const projection = geoJson
    ? geoMercator().fitExtent([[10, 10], [WIDTH - 10, HEIGHT - 10]], geoJson)
    : geoMercator()
  const pathGenerator = geoPath().projection(projection)

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Prescription Intensity Index
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Regional distribution of prescriptions per 1,000 inhabitants
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm">
          {geoJson ? 'Select a medication to see the map' : 'Loading map…'}
        </div>
      ) : (
        <div className="flex-1 min-h-0 relative flex justify-center">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            style={{ width: '100%', height: '100%' }}
          >
            {geoJson?.features.map((feature) => {
              const id = feature.id as number
              const region = regionById.get(id)
              const isUserRegion = id === user?.regionId
              const fill = isUserRegion
                ? '#f59e0b'
                : region
                  ? getColor(region.per1000, min, max)
                  : '#e5e7eb'
              const d = pathGenerator(feature) ?? ''

              return (
                <path
                  key={id}
                  d={d}
                  fill={fill}
                  stroke="white"
                  strokeWidth={0.5}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={(e) => region && setTooltip({ x: e.clientX, y: e.clientY, region })}
                  onMouseMove={(e) => region && setTooltip({ x: e.clientX, y: e.clientY, region })}
                  onMouseLeave={() => setTooltip(null)}
                />
              )
            })}
          </svg>

          {tooltip && (
            <div
              className="fixed z-50 pointer-events-none bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm"
              style={{ left: tooltip.x + 12, top: tooltip.y - 8 }}
            >
              <p className="font-semibold text-gray-900">{tooltip.region.regionName}</p>
              <p className="text-gray-600">
                {tooltip.region.per1000.toLocaleString()} per 1 000
              </p>
              {userPer1000 !== null && (
                <p className={tooltip.region.per1000 >= userPer1000 ? 'text-red-500' : 'text-green-600'}>
                  {tooltip.region.per1000 >= userPer1000 ? '+' : ''}
                  {(((tooltip.region.per1000 - userPer1000) / (userPer1000 || 1)) * 100).toFixed(1)}% vs your region
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
