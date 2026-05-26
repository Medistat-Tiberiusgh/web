import { useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { interpolateRgb } from 'd3-interpolate'
import { max as d3Max } from 'd3-array'
import type { DemographicCell } from '../../types'
import { useUser } from '../../context/UserContext'
import ChartTooltip from './ChartTooltip'
import { fmtPer1000 } from '../../lib/format'
import { COLOR_AGE_BAND } from '../../theme'

interface Props {
  data: DemographicCell[]
  regionName?: string | null
  regionalData?: DemographicCell[]
  filterGender?: string | null
  highlightAgeBand?: number | null
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

// Men: sky-100 → sky-800. Women: rose-100 → rose-800.
const menColorScale = scaleLinear<string>()
  .domain([0, 1])
  .range(['#e0f2fe', '#075985'])
  .interpolate(interpolateRgb)

const womenColorScale = scaleLinear<string>()
  .domain([0, 1])
  .range(['#ffe4e6', '#9f1239'])
  .interpolate(interpolateRgb)

function cellColor(intensity: number, isMale: boolean): string {
  return isMale ? menColorScale(intensity) : womenColorScale(intensity)
}

/** Pick a readable text colour based on intensity (dark text on light cells, light on dark). */
function textColor(intensity: number): string {
  return intensity > 0.55 ? 'text-white' : 'text-gray-700'
}

export default function DemographicHeatmap({
  data,
  regionalData,
  regionName,
  filterGender,
  highlightAgeBand
}: Props) {
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
  const natMap = new Map<
    number,
    { name: string; men: number | null; women: number | null }
  >()
  for (const cell of data) {
    if (!natMap.has(cell.ageGroupId)) {
      natMap.set(cell.ageGroupId, {
        name: cell.ageGroupName,
        men: null,
        women: null
      })
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
  const maxVal =
    d3Max(
      [...natMap.values(), ...regMap.values()].flatMap((v) => [
        v.men ?? 0,
        v.women ?? 0
      ])
    ) ?? 1

  const showMen = !filterGender || isMaleLike(filterGender)
  const showWomen = !filterGender || !isMaleLike(filterGender)
  const colLayout =
    showMen && showWomen ? 'grid-cols-[1fr_1fr_1fr]' : 'grid-cols-[1fr_1fr]'

  return (
    <div className="px-4 pb-4 pt-2" onMouseLeave={() => setTooltip(null)}>
      {/* Column headers */}
      <div className={`grid ${colLayout} gap-px mb-1`}>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider" />
        {showMen && (
          <div className="text-xs font-semibold text-sky-500 text-center py-1">
            Men
          </div>
        )}
        {showWomen && (
          <div className="text-xs font-semibold text-rose-500 text-center py-1">
            Women
          </div>
        )}
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-px">
        {ageGroups.map(([id, nat]) => {
          const primary = hasRegional
            ? (regMap.get(id) ?? { men: null, women: null })
            : nat
          const isUserAge = user?.ageGroupId != null && user.ageGroupId === id
          const isHighlighted =
            highlightAgeBand != null && highlightAgeBand === id
          const menIntensity = primary.men != null ? primary.men / maxVal : 0
          const womenIntensity =
            primary.women != null ? primary.women / maxVal : 0

          return (
            <div
              key={id}
              className="relative cursor-default"
              onMouseEnter={(e) =>
                setTooltip({
                  x: e.clientX,
                  y: e.clientY,
                  ageGroupName: nat.name,
                  menNat: nat.men,
                  womenNat: nat.women,
                  menReg: regMap.get(id)?.men ?? null,
                  womenReg: regMap.get(id)?.women ?? null
                })
              }
              onMouseMove={(e) =>
                setTooltip((t) =>
                  t ? { ...t, x: e.clientX, y: e.clientY } : null
                )
              }
            >
              {/* Highlight background — sits behind the grid row */}
              {isHighlighted && (
                <div
                  className="absolute inset-0 rounded pointer-events-none"
                  style={{ backgroundColor: COLOR_AGE_BAND, opacity: 0.08 }}
                />
              )}

              <div
                className={`grid ${colLayout} gap-px rounded overflow-hidden`}
              >
                {/* Age label */}
                <div
                  className={`flex items-center px-2 py-1.5 ${isUserAge ? 'bg-teal-50' : 'bg-gray-50'}`}
                >
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isHighlighted
                        ? COLOR_AGE_BAND
                        : isUserAge
                          ? '#0f766e'
                          : '#6b7280',
                      fontWeight: isHighlighted || isUserAge ? 600 : 400
                    }}
                  >
                    {nat.name}
                    {isUserAge && (
                      <span className="ml-1 text-teal-600">·you</span>
                    )}
                  </span>
                </div>

                {/* Men cell */}
                {showMen && (
                  <div
                    className={`flex items-center justify-center py-1.5 text-xs font-semibold transition-colors ${textColor(menIntensity)}`}
                    style={{ backgroundColor: cellColor(menIntensity, true) }}
                  >
                    {primary.men != null ? fmtPer1000(primary.men) : '—'}
                  </div>
                )}

                {/* Women cell */}
                {showWomen && (
                  <div
                    className={`flex items-center justify-center py-1.5 text-xs font-semibold transition-colors ${textColor(womenIntensity)}`}
                    style={{
                      backgroundColor: cellColor(womenIntensity, false)
                    }}
                  >
                    {primary.women != null ? fmtPer1000(primary.women) : '—'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Tooltip */}
      {tooltip &&
        (() => {
          const men = hasRegional ? tooltip.menReg : tooltip.menNat
          const women = hasRegional ? tooltip.womenReg : tooltip.womenNat
          const menNat = tooltip.menNat
          const womenNat = tooltip.womenNat
          const total = (men ?? 0) + (women ?? 0)
          const menPct = total > 0 && men != null ? (men / total) * 100 : 50
          const gap =
            men != null && women != null && men > 0 && women > 0
              ? Math.abs(((men - women) / Math.min(men, women)) * 100)
              : null
          const higher =
            men != null && women != null
              ? men > women
                ? 'men'
                : 'women'
              : null

          return (
            <ChartTooltip x={tooltip.x} y={tooltip.y} width={200}>
              {/* Header */}
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-sm">
                  {tooltip.ageGroupName}
                </span>
                {hasRegional && (
                  <span className="text-[10px] text-teal-600 font-semibold">
                    {regionName}
                  </span>
                )}
              </div>

              {/* Gender values + ratio bar */}
              <div className="px-3 py-2 flex flex-col gap-2">
                {showMen && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1 text-xs text-sky-600 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />{' '}
                      Men
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      {men != null ? fmtPer1000(men) : '—'}
                    </span>
                  </div>
                )}
                {/* Ratio bar — only when both genders are visible */}
                {showMen && showWomen && (
                  <div className="h-1.5 w-full rounded-full overflow-hidden flex">
                    <div
                      className="h-full bg-sky-400 transition-all"
                      style={{ width: `${menPct}%` }}
                    />
                    <div className="h-full flex-1 bg-rose-300" />
                  </div>
                )}
                {showWomen && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1 text-xs text-rose-500 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />{' '}
                      Women
                    </span>
                    <span className="text-xs font-bold text-gray-800">
                      {women != null ? fmtPer1000(women) : '—'}
                    </span>
                  </div>
                )}
              </div>

              {/* National comparison when showing regional */}
              {hasRegional && (menNat != null || womenNat != null) && (
                <div className="px-3 py-1.5 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                  <span>National avg</span>
                  <span>
                    {showMen && menNat != null && (
                      <span className="text-sky-400">{fmtPer1000(menNat)}</span>
                    )}
                    {showMen &&
                      showWomen &&
                      menNat != null &&
                      womenNat != null && <span className="mx-1">/</span>}
                    {showWomen && womenNat != null && (
                      <span className="text-rose-400">
                        {fmtPer1000(womenNat)}
                      </span>
                    )}
                  </span>
                </div>
              )}

              {/* Gap insight */}
              {gap != null && gap >= 5 && higher && (
                <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
                  <p className="text-[10px] text-gray-500">
                    Dispensed to {higher}{' '}
                    <span className="font-semibold">
                      {gap.toFixed(0)}% more
                    </span>{' '}
                    in this group.
                  </p>
                </div>
              )}
            </ChartTooltip>
          )
        })()}
    </div>
  )
}
