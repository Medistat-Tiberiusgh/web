import { useState } from 'react'
import type { DemographicCell } from '../types'
import { useUser } from '../context/UserContext'
import ChartTooltip from './ChartTooltip'

interface Props {
  data: DemographicCell[]
  regionName?: string | null
  regionalData?: DemographicCell[]
}

interface TooltipState {
  x: number
  y: number
  ageGroupName: string
  menNat: number | null
  womenNat: number | null
  menReg: number | null
  womenReg: number | null
}

function isMaleLike(g: string) {
  const l = g.toLowerCase()
  return l === 'män' || l === 'man' || l === 'male' || l === 'men' || l === 'm'
}

/** Map a 0–1 intensity to a colour in a given hue family. */
function cellColor(intensity: number, isMale: boolean): string {
  // Men: blue family.  Women: rose family.
  // At intensity=0 we use a very light tint; at 1 we use a saturated dark shade.
  if (isMale) {
    // #dbeafe (blue-100) → #1e40af (blue-800)
    const r = Math.round(219 - intensity * (219 - 30))
    const g = Math.round(234 - intensity * (234 - 64))
    const b = Math.round(254 - intensity * (254 - 175))
    return `rgb(${r},${g},${b})`
  } else {
    // #ffe4e6 (rose-100) → #9f1239 (rose-800)
    const r = Math.round(255 - intensity * (255 - 159))
    const g = Math.round(228 - intensity * (228 - 18))
    const b = Math.round(230 - intensity * (230 - 57))
    return `rgb(${r},${g},${b})`
  }
}

/** Pick a readable text colour based on intensity (dark text on light cells, light on dark). */
function textColor(intensity: number): string {
  return intensity > 0.55 ? 'text-white' : 'text-gray-700'
}

export default function DemographicHeatmap({ data, regionalData, regionName }: Props) {
  const user = useUser()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No demographic data available
      </div>
    )
  }

  // Build a lookup: ageGroupId → { men, women } for national and regional
  const natMap = new Map<number, { name: string; men: number | null; women: number | null }>()
  for (const cell of data) {
    if (!natMap.has(cell.ageGroupId)) {
      natMap.set(cell.ageGroupId, { name: cell.ageGroupName, men: null, women: null })
    }
    const entry = natMap.get(cell.ageGroupId)!
    if (isMaleLike(cell.gender)) entry.men = cell.per1000
    else entry.women = cell.per1000
  }

  const regMap = new Map<number, { men: number | null; women: number | null }>()
  for (const cell of regionalData ?? []) {
    if (!regMap.has(cell.ageGroupId)) {
      regMap.set(cell.ageGroupId, { men: null, women: null })
    }
    const entry = regMap.get(cell.ageGroupId)!
    if (isMaleLike(cell.gender)) entry.men = cell.per1000
    else entry.women = cell.per1000
  }

  const hasRegional = (regionalData ?? []).length > 0

  // Age bands sorted by ID, using the primary data source
  const ageGroups = [...natMap.entries()].sort((a, b) => a[0] - b[0])

  // Find the global max across all cells to normalise colour intensity
  const allValues = [...natMap.values(), ...regMap.values()].flatMap((v) => [
    v.men ?? 0,
    v.women ?? 0,
  ])
  const maxVal = Math.max(...allValues, 1)

  const displayMap = hasRegional ? regMap : natMap

  return (
    <div className="px-4 pb-4 pt-2" onMouseLeave={() => setTooltip(null)}>
      {/* Column headers */}
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-px mb-1">
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider" />
        <div className="text-[11px] font-semibold text-blue-600 text-center py-1">Men</div>
        <div className="text-[11px] font-semibold text-rose-500 text-center py-1">Women</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-px">
        {ageGroups.map(([id, nat]) => {
          const primary = hasRegional ? (regMap.get(id) ?? { men: null, women: null }) : nat
          const isUserAge = user?.ageGroupId != null && user.ageGroupId === id
          const menIntensity = primary.men != null ? primary.men / maxVal : 0
          const womenIntensity = primary.women != null ? primary.women / maxVal : 0

          return (
            <div
              key={id}
              className={`grid grid-cols-[1fr_1fr_1fr] gap-px rounded overflow-hidden cursor-default
                ${isUserAge ? 'ring-2 ring-offset-1 ring-teal-500' : ''}`}
              onMouseEnter={(e) =>
                setTooltip({
                  x: e.clientX,
                  y: e.clientY,
                  ageGroupName: nat.name,
                  menNat: nat.men,
                  womenNat: nat.women,
                  menReg: regMap.get(id)?.men ?? null,
                  womenReg: regMap.get(id)?.women ?? null,
                })
              }
              onMouseMove={(e) =>
                setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
              }
            >
              {/* Age label */}
              <div className={`flex items-center px-2 py-1.5 bg-gray-50 ${isUserAge ? 'bg-teal-50' : ''}`}>
                <span className={`text-[11px] font-medium ${isUserAge ? 'text-teal-700 font-semibold' : 'text-gray-500'}`}>
                  {nat.name}
                  {isUserAge && <span className="ml-1 text-teal-500">·you</span>}
                </span>
              </div>

              {/* Men cell */}
              <div
                className={`flex items-center justify-center py-1.5 text-[11px] font-semibold transition-colors ${textColor(menIntensity)}`}
                style={{ backgroundColor: cellColor(menIntensity, true) }}
              >
                {primary.men != null ? primary.men.toFixed(1) : '—'}
              </div>

              {/* Women cell */}
              <div
                className={`flex items-center justify-center py-1.5 text-[11px] font-semibold transition-colors ${textColor(womenIntensity)}`}
                style={{ backgroundColor: cellColor(womenIntensity, false) }}
              >
                {primary.women != null ? primary.women.toFixed(1) : '—'}
              </div>
            </div>
          )
        })}
      </div>

      {/* Colour scale legend */}
      <div className="mt-3 flex items-center gap-4 justify-end">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <div className="flex gap-px">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
              <div key={v} className="w-4 h-2 rounded-sm" style={{ backgroundColor: cellColor(v, true) }} />
            ))}
          </div>
          Men
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          Women
          <div className="flex gap-px">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((v) => (
              <div key={v} className="w-4 h-2 rounded-sm" style={{ backgroundColor: cellColor(v, false) }} />
            ))}
          </div>
        </div>
        <span className="text-[10px] text-gray-400">per 1,000 people · darker = higher rate</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <ChartTooltip x={tooltip.x} y={tooltip.y} width={hasRegional ? 260 : 180}>
          <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
            <span className="font-semibold text-gray-800">{tooltip.ageGroupName}</span>
            <span className="text-gray-400 ml-auto text-xs">per 1,000 people</span>
          </div>

          <div className="flex divide-x divide-gray-100">
            {hasRegional && (
              <div className="flex-1 px-3 py-2 bg-teal-50/60">
                <p className="text-[10px] font-semibold tracking-widest text-teal-600 uppercase mb-1.5">
                  {regionName}
                </p>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1 text-gray-600 text-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      Men
                    </span>
                    <span className="font-semibold text-gray-800 text-xs">
                      {tooltip.menReg != null ? tooltip.menReg.toFixed(1) : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1 text-gray-600 text-xs">
                      <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                      Women
                    </span>
                    <span className="font-semibold text-gray-800 text-xs">
                      {tooltip.womenReg != null ? tooltip.womenReg.toFixed(1) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 px-3 py-2">
              <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
                National
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                    Men
                  </span>
                  <span className="font-semibold text-gray-700 text-xs">
                    {tooltip.menNat != null ? tooltip.menNat.toFixed(1) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-gray-500 text-xs">
                    <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                    Women
                  </span>
                  <span className="font-semibold text-gray-700 text-xs">
                    {tooltip.womenNat != null ? tooltip.womenNat.toFixed(1) : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Gender gap callout */}
          {(() => {
            const men = hasRegional ? tooltip.menReg : tooltip.menNat
            const women = hasRegional ? tooltip.womenReg : tooltip.womenNat
            if (men == null || women == null || men === 0 || women === 0) return null
            const higher = men > women ? 'men' : 'women'
            const pct = Math.abs(((men - women) / Math.min(men, women)) * 100)
            if (pct < 5) return (
              <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
                <p className="text-[10px] text-gray-500">Similar rates for both genders in this age group.</p>
              </div>
            )
            return (
              <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
                <p className="text-[10px] text-gray-500">
                  Dispensed to {higher} <span className="font-semibold">{pct.toFixed(0)}% more</span> in this age group.
                </p>
              </div>
            )
          })()}
        </ChartTooltip>
      )}
    </div>
  )
}
