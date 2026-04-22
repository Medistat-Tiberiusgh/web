/**
 * Option A — Age Band Bars + Sparklines
 *
 * Two-column layout (same split as AgeBandChart) so the list never runs
 * taller than the existing chart. Each row shows:
 *   label | thin bar (current year) | sparkline (full trend) | ±trend%
 */
import { useState } from 'react'
import { useUser } from '../context/UserContext'
import type { AgeSplitPoint } from '../types'
import ChartTooltip from './ChartTooltip'
import { fmtPer1000 } from '../lib/format'
import {
  COLOR_REGIONAL, COLOR_SPARK_NAT, COLOR_YEAR,
  COLOR_TREND_UP, COLOR_TREND_DOWN, COLOR_TREND_FLAT, COLOR_AGE_BAND,
} from '../theme'

interface Props {
  data: AgeSplitPoint[]
  regionalData?: AgeSplitPoint[]
  latestYear: number | null
  selectedYear?: number | null
  regionName?: string | null
  filterAgeBand?: string | null
}

interface TooltipState {
  x: number
  y: number
  ageGroupName: string
  yearData: { year: number; national: number; regional: number | null }[]
}

function sparkPath(values: number[], W: number, H: number): string {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const pad = 2
  return values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * W
      const y = H - pad - ((v - min) / range) * (H - pad * 2)
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

export default function AgeBandSparklines({
  data,
  regionalData,
  latestYear,
  selectedYear,
  regionName,
  filterAgeBand,
}: Props) {
  const user = useUser()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const years = [...new Set(data.map((d) => d.year))].sort()
  const ageGroups = [
    ...new Map(
      [...data].sort((a, b) => a.ageGroupId - b.ageGroupId).map((d) => [d.ageGroupId, d.ageGroupName])
    ).entries(),
  ]

  const natLookup = new Map<number, Map<number, number>>()
  for (const pt of data) {
    if (!natLookup.has(pt.ageGroupId)) natLookup.set(pt.ageGroupId, new Map())
    natLookup.get(pt.ageGroupId)!.set(pt.year, pt.per1000)
  }

  const regLookup = new Map<number, Map<number, number>>()
  for (const pt of regionalData ?? []) {
    if (!regLookup.has(pt.ageGroupId)) regLookup.set(pt.ageGroupId, new Map())
    regLookup.get(pt.ageGroupId)!.set(pt.year, pt.per1000)
  }

  const hasRegional = (regionalData ?? []).length > 0
  const regYears = hasRegional ? [...new Set((regionalData ?? []).map((d) => d.year))].sort() : []

  // Pick a year that actually exists in both datasets so bars always fill
  const sharedYears = hasRegional ? years.filter((y) => regYears.includes(y)) : years
  const effectiveYear = (() => {
    const pool = sharedYears.length > 0 ? sharedYears : years
    const target = latestYear ?? null
    if (target != null && pool.includes(target)) return target
    return pool.at(-1) ?? null
  })()

  const allLatest = ageGroups.flatMap(([id]) => [
    natLookup.get(id)?.get(effectiveYear ?? -1) ?? 0,
    regLookup.get(id)?.get(effectiveYear ?? -1) ?? 0,
  ])
  const maxBar = Math.max(...allLatest, 1)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-gray-400">
        No age band data available
      </div>
    )
  }

  const SW = 72
  const SH = 24

  const half = Math.ceil(ageGroups.length / 2)
  const columns = [ageGroups.slice(0, half), ageGroups.slice(half)]

  function renderRow([id, name]: [number, string]) {
    const natVal = natLookup.get(id)?.get(effectiveYear ?? -1) ?? null
    const regVal = regLookup.get(id)?.get(effectiveYear ?? -1) ?? null

    const sparkYears = selectedYear ? years.filter((y) => y <= selectedYear) : years
    const natSeries = sparkYears.map((y) => natLookup.get(id)?.get(y) ?? null).filter((v): v is number => v !== null)
    const regSeries = sparkYears.map((y) => regLookup.get(id)?.get(y) ?? null).filter((v): v is number => v !== null)
    const trendSeries = hasRegional && regSeries.length > 0 ? regSeries : natSeries

    const first = trendSeries.at(0)
    const last = trendSeries.at(-1)
    const trendPct = first != null && last != null && trendSeries.length >= 2 && first > 0 ? ((last - first) / first) * 100 : null
    const dir = trendPct == null ? 'flat' : trendPct > 5 ? 'up' : trendPct < -5 ? 'down' : 'flat'
    const lineColor = dir === 'up' ? COLOR_TREND_UP : dir === 'down' ? COLOR_TREND_DOWN : COLOR_TREND_FLAT
    const trendClass = dir === 'up' ? 'text-orange-700' : dir === 'down' ? 'text-gray-500' : 'text-gray-400'
    const firstYear = sparkYears.at(0)
    const trendLabel = trendPct == null ? '' : `${trendPct > 0 ? '+' : ''}${trendPct.toFixed(0)}% since '${String(firstYear).slice(2)}`

    const isUserAge = user?.ageGroupId != null && user.ageGroupId === id
    const isFiltered = !!filterAgeBand && filterAgeBand === name

    const natSparkPath = sparkPath(natSeries, SW, SH)
    const regSparkPath = hasRegional ? sparkPath(regSeries, SW, SH) : ''

    return (
      <li
        key={id}
        className="relative rounded-md px-2 py-1 -mx-2 cursor-default hover:bg-gray-100"
        style={isFiltered ? { backgroundColor: `${COLOR_AGE_BAND}14` } : isUserAge ? { backgroundColor: '#0d948814' } : undefined}
        onMouseEnter={(e) =>
          setTooltip({
            x: e.clientX,
            y: e.clientY,
            ageGroupName: name,
            yearData: years.map((y) => ({
              year: y,
              national: natLookup.get(id)?.get(y) ?? 0,
              regional: regLookup.get(id)?.get(y) ?? null,
            })),
          })
        }
        onMouseMove={(e) =>
          setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : null))
        }
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Label + "you" badge */}
        <div className="flex items-center gap-1 mb-0.5">
          <span
            className="text-xs font-medium truncate leading-none"
            style={{
              color: isFiltered ? COLOR_AGE_BAND : isUserAge ? '#0f766e' : '#4b5563',
              fontWeight: (isFiltered || isUserAge) ? 600 : 400,
            }}
          >
            {name}
          </span>
          {isUserAge && (
            <span className="text-[10px] font-semibold text-teal-600 bg-teal-50/60 px-1 rounded-full shrink-0 leading-snug">
              you
            </span>
          )}
        </div>

        {/* Bar + sparkline row */}
        <div className="flex items-center gap-2">
          {/* Bars — two stacked when regional available, one (national/blue) otherwise */}
          <div className="flex-1 flex flex-col gap-0.5 min-w-0">
            {hasRegional && (
              <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isUserAge ? 'bg-teal-600' : 'bg-teal-500'}`}
                  style={{ width: `${regVal != null ? (regVal / maxBar) * 100 : 0}%` }}
                />
              </div>
            )}
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-700 transition-all"
                style={{ width: `${natVal != null ? (natVal / maxBar) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Values */}
          <div className="flex flex-col items-end shrink-0">
            {hasRegional && (
              <span className="text-[10px] font-semibold text-teal-600 leading-none">
                {regVal != null ? fmtPer1000(regVal) : '—'}
              </span>
            )}
            <span className={`text-[10px] font-medium leading-none ${hasRegional ? 'text-blue-600' : 'text-gray-600'}`}>
              {natVal != null ? fmtPer1000(natVal) : '—'}
            </span>
          </div>

          {/* Sparkline */}
          <svg width={SW} height={SH} viewBox={`0 0 ${SW} ${SH}`} className="shrink-0 overflow-visible">
            {/* National — dashed gray behind (always present) */}
            {natSparkPath && (
              <path d={natSparkPath} fill="none" stroke={COLOR_SPARK_NAT} strokeWidth={1} strokeDasharray="2 2" strokeLinecap="round" />
            )}
            {/* Primary line: regional teal when selected, else national colored by trend */}
            {hasRegional
              ? regSparkPath && <path d={regSparkPath} fill="none" stroke={COLOR_REGIONAL} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              : natSparkPath && <path d={natSparkPath} fill="none" stroke={lineColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            }
            {/* Selected year marker — always at the right edge when year is filtered */}
            {selectedYear && trendSeries.length > 0 && (() => {
              const x = SW
              const min = Math.min(...trendSeries)
              const max = Math.max(...trendSeries)
              const val = trendSeries.at(-1)
              if (val == null) return null
              const y = SH - 2 - ((val - min) / (max - min || 1)) * (SH - 4)
              return (
                <g>
                  <line x1={x} y1={0} x2={x} y2={SH} stroke={COLOR_YEAR} strokeWidth={1} strokeDasharray="2 2" />
                  <circle cx={x} cy={y} r={2.5} fill="white" stroke={COLOR_YEAR} strokeWidth={1.5} />
                </g>
              )
            })()}
          </svg>

          {/* Trend % */}
          <span className={`text-[10px] font-semibold w-20 text-right shrink-0 leading-none ${trendClass}`}>
            {trendLabel}
          </span>
        </div>
      </li>
    )
  }

  return (
    <div onMouseLeave={() => setTooltip(null)}>
      <div className="flex gap-6 px-4 pb-3 pt-2">
        {columns.map((col, ci) => (
          <ul key={ci} className="flex-1 flex flex-col gap-0.5">
            {col.map(renderRow)}
          </ul>
        ))}
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex items-center gap-4 text-[10px] text-gray-400 border-t border-gray-100 pt-2">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 rounded" style={{ background: COLOR_TREND_UP }} /> Growing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 rounded" style={{ background: COLOR_TREND_DOWN }} /> Shrinking
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-4 h-0.5 rounded" style={{ background: COLOR_TREND_FLAT }} /> Stable
        </span>
        {hasRegional && (
          <>
            <span className="flex items-center gap-1.5">
              <svg width={16} height={6}><line x1={0} y1={3} x2={16} y2={3} stroke={COLOR_REGIONAL} strokeWidth={1.5} /></svg>
              {regionName ?? 'Region'}
            </span>
            <span className="flex items-center gap-1.5">
              <svg width={16} height={6}><line x1={0} y1={3} x2={16} y2={3} stroke={COLOR_SPARK_NAT} strokeWidth={1} strokeDasharray="2 2" /></svg>
              National
            </span>
          </>
        )}
        <span className="ml-auto">{years.at(0)}→{selectedYear ?? years.at(-1)}</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <ChartTooltip x={tooltip.x} y={tooltip.y} width={hasRegional ? 300 : 180}>
          <div className="px-3 py-2 border-b border-gray-100">
            <span className="font-semibold text-gray-800">{tooltip.ageGroupName}</span>
            <span className="text-gray-400 ml-2 text-[10px]">per 1,000 · all years</span>
          </div>
          {/* Flat grid — regional column gets a continuous teal background */}
          {(() => {
            const sorted = [...tooltip.yearData].reverse()
            const pinned = selectedYear ? sorted.find((d) => d.year === selectedYear) : null
            const rest = sorted.filter((d) => d.year !== selectedYear).slice(0, pinned ? 7 : 8)
            const rows = [...(pinned ? [pinned] : []), ...rest]
            const cols = hasRegional ? 'grid-cols-[auto_1fr_1fr]' : 'grid-cols-[auto_1fr]'
            return (
              <div className={`grid ${cols} text-xs`}>
                {/* Header row */}
                <div className="px-3 pt-2 pb-1" />
                {hasRegional && (
                  <div className="bg-teal-50/60 px-3 pt-2 pb-1 text-[10px] font-semibold tracking-widest text-teal-600 uppercase text-right">
                    {regionName ?? 'Region'}
                  </div>
                )}
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-widest text-gray-400 uppercase text-right">
                  National
                </div>

                {/* Data rows */}
                {rows.flatMap(({ year, national, regional }) => {
                  const isPinned = year === selectedYear
                  return [
                    <span key={`${year}-y`} className={`px-3 py-0.5 ${isPinned ? 'bg-violet-50 text-violet-600 font-semibold' : 'text-gray-400'}`}>{year}</span>,
                    ...(hasRegional ? [
                      <span key={`${year}-r`} className={`px-3 py-0.5 text-right font-medium ${isPinned ? 'bg-violet-100 text-violet-700 font-bold' : 'bg-teal-50/60 text-teal-700'}`}>
                        {regional != null ? fmtPer1000(regional) : '—'}
                      </span>
                    ] : []),
                    <span key={`${year}-n`} className={`px-3 py-0.5 text-right font-medium ${isPinned ? 'bg-violet-50 text-violet-700 font-bold' : 'text-gray-700'}`}>
                      {fmtPer1000(national)}
                    </span>,
                  ]
                })}

                {/* Bottom padding row to close off the teal column cleanly */}
                <div className="px-3 pb-2" />
                {hasRegional && <div className="bg-teal-50/60 pb-2" />}
                <div className="pb-2" />
              </div>
            )
          })()}
        </ChartTooltip>
      )}
    </div>
  )
}
