import { useState } from 'react'
import type { GenderSplitPoint } from '../../types'
import { useUser } from '../../context/UserContext'
import ChartTooltip from './ChartTooltip'
import { fmtPer1000 } from '../../lib/format'
import {
  COLOR_MALE,
  COLOR_MALE_MUTED,
  COLOR_MALE_NAT,
  COLOR_FEMALE,
  COLOR_FEMALE_MUTED,
  COLOR_YEAR,
  COLOR_AXIS,
  COLOR_AXIS_LABEL,
  FONT_TICK,
  FONT_LABEL
} from '../../theme'

interface Props {
  data: GenderSplitPoint[]
  regionalData?: GenderSplitPoint[]
  regionName?: string | null
  filterGender?: string | null
  selectedYear?: number | null
}

function isMaleLike(g: string) {
  const l = g.toLowerCase()
  return l === 'men' || l === 'man' || l === 'male' || l === 'män' || l === 'm'
}

function displayLabel(g: string) {
  const l = g.toLowerCase()
  if (l === 'män' || l === 'man' || l === 'male') return 'Men'
  if (l === 'kvinnor' || l === 'kvinna' || l === 'female' || l === 'woman') return 'Women'
  return g
}

const W = 500
const PAD = { top: 16, right: 12, bottom: 8, left: 12 }
const CENTER_W = 40
const BAR_H = 12
const BAR_GAP = 8
const BAR_AREA = (W - PAD.left - PAD.right - CENTER_W) / 2

interface TooltipState {
  x: number
  y: number
  year: number
  regMen: number | null
  regWomen: number | null
  natMen: number | null
  natWomen: number | null
}

function buildYearMap(data: GenderSplitPoint[]) {
  const map = new Map<number, { men: number | null; women: number | null }>()
  for (const pt of data) {
    if (!map.has(pt.year)) map.set(pt.year, { men: null, women: null })
    const entry = map.get(pt.year)!
    if (isMaleLike(pt.gender)) entry.men = pt.per1000
    else entry.women = pt.per1000
  }
  return map
}

export default function GenderGapChart({ data, regionalData, regionName, filterGender, selectedYear }: Props) {
  const user = useUser()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No gender data available
      </div>
    )
  }

  const maleLabel = 'Men'
  const femaleLabel = 'Women'

  // null = gender unknown; true = male; false = female
  const userIsMale: boolean | null = user?.genderId != null ? user.genderId === 1 : null

  const natByYear = buildYearMap(data)
  const regByYear = buildYearMap(regionalData ?? [])
  const hasRegional = (regionalData ?? []).length > 0

  const primaryByYear = hasRegional ? regByYear : natByYear
  const years = Array.from(natByYear.keys()).sort((a, b) => a - b)

  const allVals = [
    ...Array.from(natByYear.values()).flatMap((v) => [v.men ?? 0, v.women ?? 0]),
    ...Array.from(regByYear.values()).flatMap((v) => [v.men ?? 0, v.women ?? 0]),
  ]
  const maxVal = Math.max(...allVals, 1)

  const rowH = BAR_H + BAR_GAP
  const dynBarH = BAR_H
  const dynBarGap = BAR_GAP

  const H = PAD.top + years.length * rowH - BAR_GAP + PAD.bottom
  const centerX = PAD.left + BAR_AREA + CENTER_W / 2

  // Highlighted color for the user's gender, muted for the other (or both muted if unknown)
  const menColor = userIsMale === true ? COLOR_MALE : COLOR_MALE_MUTED
  const womenColor = userIsMale === false ? COLOR_FEMALE : COLOR_FEMALE_MUTED

  // In single-gender mode, shift the year-label column to the near edge so the
  // active gender's bars use the full available width (both BAR_AREAs combined).
  const filterIsMale = filterGender != null ? isMaleLike(filterGender) : null
  const singleGender = filterGender != null
  const effectiveCenterX = singleGender
    ? (filterIsMale ? W - PAD.right - CENTER_W / 2 : PAD.left + CENTER_W / 2)
    : centerX
  const effectiveBarArea = singleGender ? BAR_AREA * 2 : BAR_AREA

  return (
    <div className="relative pt-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseLeave={() => setTooltip(null)}
      >
        {(!filterGender || isMaleLike(filterGender)) && (
          <text x={effectiveCenterX - CENTER_W / 2 - 4} y={PAD.top - 4} textAnchor="end" fontSize={FONT_TICK} fill={COLOR_AXIS_LABEL}>
            ← {maleLabel}{userIsMale === true ? ' (you)' : ''}
          </text>
        )}
        {(!filterGender || !isMaleLike(filterGender)) && (
          <text x={effectiveCenterX + CENTER_W / 2 + 4} y={PAD.top - 4} textAnchor="start" fontSize={FONT_TICK} fill={COLOR_AXIS_LABEL}>
            {femaleLabel}{userIsMale === false ? ' (you)' : ''} →
          </text>
        )}

        {years.map((year, i) => {
          const primary = primaryByYear.get(year) ?? { men: null, women: null }
          const nat = natByYear.get(year) ?? { men: null, women: null }
          const y = PAD.top + i * rowH
          const isHovered = tooltip?.year === year
          const isSelected = selectedYear === year

          const regMenLen = ((primary.men ?? 0) / maxVal) * effectiveBarArea
          const regWomenLen = ((primary.women ?? 0) / maxVal) * effectiveBarArea

          const menOpacity = isHovered ? 1 : 0.75
          const womenOpacity = isHovered ? 1 : 0.75

          return (
            <g key={year}>
              {/* Selected year highlight band */}
              {isSelected && (
                <rect x={PAD.left} y={y - dynBarGap / 2} width={W - PAD.left - PAD.right} height={rowH} fill={COLOR_YEAR} fillOpacity={0.08} rx={2} />
              )}

              {/* Bars */}
              <rect x={effectiveCenterX - CENTER_W / 2 - regMenLen} y={y} width={regMenLen} height={dynBarH} rx={2} fill={menColor} opacity={menOpacity} />
              <rect x={effectiveCenterX + CENTER_W / 2} y={y} width={regWomenLen} height={dynBarH} rx={2} fill={womenColor} opacity={womenOpacity} />

              {/* Year label */}
              <text x={effectiveCenterX} y={y + dynBarH / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={FONT_LABEL} fill={isSelected ? COLOR_YEAR : isHovered ? '#111827' : COLOR_AXIS_LABEL} fontWeight={isSelected || isHovered ? 'bold' : 'normal'}>
                {year}
              </text>

              {/* Hover target */}
              <rect
                x={PAD.left} y={y - dynBarGap / 2} width={W - PAD.left - PAD.right} height={rowH}
                fill="transparent" style={{ cursor: 'crosshair' }}
                onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, year, regMen: hasRegional ? primary.men : null, regWomen: hasRegional ? primary.women : null, natMen: nat.men, natWomen: nat.women })}
                onMouseMove={(e) => setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
              />
            </g>
          )
        })}

        <line x1={effectiveCenterX - CENTER_W / 2} y1={PAD.top - 4} x2={effectiveCenterX - CENTER_W / 2} y2={H - PAD.bottom} stroke={COLOR_AXIS} strokeWidth={1} />
        <line x1={effectiveCenterX + CENTER_W / 2} y1={PAD.top - 4} x2={effectiveCenterX + CENTER_W / 2} y2={H - PAD.bottom} stroke={COLOR_AXIS} strokeWidth={1} />
      </svg>

      {tooltip && (() => {
        return (
          <ChartTooltip x={tooltip.x} y={tooltip.y} width={hasRegional ? 260 : 180}>
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <span className="font-semibold text-gray-800">{tooltip.year}</span>
            <span className="text-gray-400 ml-1.5">per 1,000 people</span>
          </div>

          {/* Body — two columns when regional data exists, single national column otherwise */}
          <div className="flex divide-x divide-gray-100">
            {hasRegional && (
              <div className="flex-1 px-3 py-2 bg-teal-50/60">
                <p className="text-[10px] font-semibold tracking-widest text-teal-600 uppercase mb-1.5">
                  {regionName}
                </p>
                <div className="flex flex-col gap-1">
                  {tooltip.regMen != null && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: menColor }} />
                        {maleLabel}{userIsMale === true ? ' · you' : ''}
                      </span>
                      <span className="font-semibold text-gray-800">{fmtPer1000(tooltip.regMen)}</span>
                    </div>
                  )}
                  {tooltip.regWomen != null && (
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: womenColor }} />
                        {femaleLabel}{userIsMale === false ? ' · you' : ''}
                      </span>
                      <span className="font-semibold text-gray-800">{fmtPer1000(tooltip.regWomen)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex-1 px-3 py-2">
              <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
                National
              </p>
              <div className="flex flex-col gap-1">
                {tooltip.natMen != null && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1 text-gray-500 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: hasRegional ? COLOR_MALE_NAT : menColor }} />
                      {maleLabel}{!hasRegional && userIsMale === true ? ' · you' : ''}
                    </span>
                    <span className="font-semibold text-gray-700">{fmtPer1000(tooltip.natMen)}</span>
                  </div>
                )}
                {tooltip.natWomen != null && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1 text-gray-500 whitespace-nowrap">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: hasRegional ? COLOR_FEMALE_MUTED : womenColor }} />
                      {femaleLabel}{!hasRegional && userIsMale === false ? ' · you' : ''}
                    </span>
                    <span className="font-semibold text-gray-700">{fmtPer1000(tooltip.natWomen)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer — gender gap for both regional and national */}
          {(() => {
            const lines: { text: string; color: string }[] = []

            if (tooltip.regMen != null && tooltip.regWomen != null && tooltip.regMen > 0 && tooltip.regWomen > 0) {
              const pct = Math.abs(((tooltip.regMen - tooltip.regWomen) / Math.min(tooltip.regMen, tooltip.regWomen)) * 100)
              const higher = tooltip.regMen > tooltip.regWomen ? maleLabel : femaleLabel
              lines.push({
                text: pct < 5
                  ? `${regionName ?? 'Region'}: similar rates for both genders.`
                  : `${regionName ?? 'Region'}: dispensed to ${higher.toLowerCase()} ${pct.toFixed(0)}% more.`,
                color: 'text-teal-600',
              })
            }

            if (tooltip.natMen != null && tooltip.natWomen != null && tooltip.natMen > 0 && tooltip.natWomen > 0) {
              const pct = Math.abs(((tooltip.natMen - tooltip.natWomen) / Math.min(tooltip.natMen, tooltip.natWomen)) * 100)
              const higher = tooltip.natMen > tooltip.natWomen ? maleLabel : femaleLabel
              lines.push({
                text: pct < 5
                  ? `National: similar rates for both genders.`
                  : `National: dispensed to ${higher.toLowerCase()} ${pct.toFixed(0)}% more.`,
                color: 'text-blue-500',
              })
            }

            if (lines.length === 0) return null
            return (
              <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50 flex flex-col gap-0.5">
                {lines.map((l, i) => (
                  <p key={i} className={`text-[10px] ${l.color}`}>{l.text}</p>
                ))}
              </div>
            )
          })()}
          </ChartTooltip>
        )
      })()}
    </div>
  )
}
