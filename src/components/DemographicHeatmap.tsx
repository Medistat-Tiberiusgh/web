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


      {/* Tooltip */}
      {tooltip && (() => {
        const men = hasRegional ? tooltip.menReg : tooltip.menNat
        const women = hasRegional ? tooltip.womenReg : tooltip.womenNat
        const menNat = tooltip.menNat
        const womenNat = tooltip.womenNat
        const total = (men ?? 0) + (women ?? 0)
        const menPct = total > 0 && men != null ? (men / total) * 100 : 50
        const gap = men != null && women != null && men > 0 && women > 0
          ? Math.abs(((men - women) / Math.min(men, women)) * 100)
          : null
        const higher = men != null && women != null ? (men > women ? 'men' : 'women') : null

        return (
          <ChartTooltip x={tooltip.x} y={tooltip.y} width={200}>
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-800 text-sm">{tooltip.ageGroupName}</span>
              {hasRegional && <span className="text-[10px] text-teal-600 font-semibold">{regionName}</span>}
            </div>

            {/* Gender values + ratio bar */}
            <div className="px-3 py-2 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> Men
                </span>
                <span className="text-[11px] font-bold text-gray-800">
                  {men != null ? men.toFixed(1) : '—'}
                </span>
              </div>
              {/* Ratio bar */}
              <div className="h-1.5 w-full rounded-full overflow-hidden flex">
                <div className="h-full bg-blue-400 transition-all" style={{ width: `${menPct}%` }} />
                <div className="h-full flex-1 bg-rose-300" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1 text-[11px] text-rose-500 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" /> Women
                </span>
                <span className="text-[11px] font-bold text-gray-800">
                  {women != null ? women.toFixed(1) : '—'}
                </span>
              </div>
            </div>

            {/* National comparison when showing regional */}
            {hasRegional && menNat != null && womenNat != null && (
              <div className="px-3 py-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                <span>National avg</span>
                <span>
                  <span className="text-blue-400">{menNat.toFixed(1)}</span>
                  <span className="mx-1">/</span>
                  <span className="text-rose-400">{womenNat.toFixed(1)}</span>
                </span>
              </div>
            )}

            {/* Gap insight */}
            {gap != null && gap >= 5 && higher && (
              <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
                <p className="text-[10px] text-gray-500">
                  Dispensed to {higher} <span className="font-semibold">{gap.toFixed(0)}% more</span> in this group.
                </p>
              </div>
            )}
          </ChartTooltip>
        )
      })()}
    </div>
  )
}
