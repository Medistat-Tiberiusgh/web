import { useState } from 'react'
import { scaleLinear } from 'd3-scale'
import { line as d3Line, area as d3Area, curveMonotoneX } from 'd3-shape'
import { extent, max as d3Max } from 'd3-array'
import type { TrendPoint } from '../../types'
import ChartTooltip from './ChartTooltip'
import { fmtPer1000 } from '../../lib/format'
import {
  COLOR_NATIONAL,
  COLOR_REGIONAL,
  COLOR_YEAR,
  COLOR_AXIS,
  COLOR_AXIS_LABEL,
  COLOR_GRID,
  FONT_TICK,
  FONT_LABEL
} from '../../theme'

interface TooltipState {
  x: number
  y: number
  year: number
  national: number | null
  regional: number | null
}

interface Props {
  data: TrendPoint[]
  regionalData?: TrendPoint[]
  regionName?: string | null
  selectedYear?: number | null
  onYearChange?: (year: number | null) => void
}

const W = 600
const H = 260
const PAD = { top: 20, right: 16, bottom: 40, left: 48 }
const INNER_W = W - PAD.left - PAD.right
const INNER_H = H - PAD.top - PAD.bottom

export default function TrendChart({
  data,
  regionalData,
  regionName,
  selectedYear,
  onYearChange
}: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No trend data available
      </div>
    )
  }

  const [minYear, maxYear] = extent(data, (d) => d.year) as [number, number]
  const maxVal =
    (d3Max([...data, ...(regionalData ?? [])], (d) => d.per1000) ?? 0) * 1.08
  const baseY = PAD.top + INNER_H

  const x = scaleLinear()
    .domain([minYear, maxYear])
    .range([PAD.left, PAD.left + INNER_W])

  const y = scaleLinear().domain([0, maxVal]).range([baseY, PAD.top])

  const lineGen = d3Line<TrendPoint>()
    .x((d) => x(d.year))
    .y((d) => y(d.per1000))
    .curve(curveMonotoneX)

  const areaGen = d3Area<TrendPoint>()
    .x((d) => x(d.year))
    .y0(baseY)
    .y1((d) => y(d.per1000))
    .curve(curveMonotoneX)

  const natPath = lineGen(data) ?? ''
  const natAreaPath = areaGen(data) ?? ''
  const regPath = regionalData ? (lineGen(regionalData) ?? '') : ''
  const regAreaPath = regionalData ? (areaGen(regionalData) ?? '') : ''

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = (maxVal / 4) * i
    return { val, y: y(val) }
  })

  const xTicks = data.filter((_, i) => i % 3 === 0 || data[i].year === maxYear)
  const colWidth = INNER_W / data.length

  const regByYear = new Map(
    (regionalData ?? []).map((d) => [d.year, d.per1000])
  )

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="natGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR_NATIONAL} stopOpacity="0.12" />
            <stop offset="100%" stopColor={COLOR_NATIONAL} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={COLOR_REGIONAL} stopOpacity="0.12" />
            <stop offset="100%" stopColor={COLOR_REGIONAL} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map(({ val, y: ty }, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={ty}
              x2={PAD.left + INNER_W}
              y2={ty}
              stroke={COLOR_GRID}
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={ty}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={FONT_TICK}
              fill={COLOR_AXIS_LABEL}
            >
              {fmtPer1000(val)}
            </text>
          </g>
        ))}

        {/* Area fills — drawn before lines so lines sit on top */}
        {regAreaPath && <path d={regAreaPath} fill="url(#regGrad)" />}
        <path d={natAreaPath} fill="url(#natGrad)" />

        {/* Lines */}
        <path
          d={natPath}
          fill="none"
          stroke={COLOR_NATIONAL}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {regPath && (
          <path
            d={regPath}
            fill="none"
            stroke={COLOR_REGIONAL}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Selected year band */}
        {selectedYear &&
          data.some((d) => d.year === selectedYear) &&
          (() => {
            const sx = x(selectedYear)
            return (
              <g>
                <rect
                  x={sx - colWidth / 2}
                  y={PAD.top}
                  width={colWidth}
                  height={INNER_H}
                  fill={COLOR_YEAR}
                  fillOpacity={0.08}
                  rx={2}
                />
                <line
                  x1={sx}
                  y1={PAD.top}
                  x2={sx}
                  y2={baseY}
                  stroke={COLOR_YEAR}
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                />
                <text
                  x={sx}
                  y={PAD.top - 6}
                  textAnchor="middle"
                  fontSize={FONT_LABEL}
                  fill={COLOR_YEAR}
                  fontWeight="600"
                >
                  {selectedYear}
                </text>
              </g>
            )
          })()}

        {/* Hover crosshair */}
        {tooltip && (
          <line
            x1={x(tooltip.year)}
            y1={PAD.top}
            x2={x(tooltip.year)}
            y2={baseY}
            stroke={COLOR_AXIS_LABEL}
            strokeWidth={1}
            strokeDasharray="3 2"
          />
        )}

        {/* Dots — only visible on hovered year */}
        {data.map((d) => {
          const hovered = tooltip?.year === d.year
          const cx = x(d.year)
          const cy = y(d.per1000)
          return (
            <g key={d.year}>
              {hovered && (
                <>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill="white"
                    stroke={COLOR_NATIONAL}
                    strokeWidth={2}
                  />
                  {regByYear.has(d.year) && (
                    <circle
                      cx={cx}
                      cy={y(regByYear.get(d.year)!)}
                      r={6}
                      fill="white"
                      stroke={COLOR_REGIONAL}
                      strokeWidth={2}
                    />
                  )}
                </>
              )}
              <rect
                x={cx - colWidth / 2}
                y={PAD.top}
                width={colWidth}
                height={INNER_H}
                fill="transparent"
                style={{ cursor: onYearChange ? 'pointer' : 'crosshair' }}
                onMouseEnter={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    year: d.year,
                    national: d.per1000,
                    regional: regByYear.get(d.year) ?? null
                  })
                }
                onMouseMove={(e) =>
                  setTooltip({
                    x: e.clientX,
                    y: e.clientY,
                    year: d.year,
                    national: d.per1000,
                    regional: regByYear.get(d.year) ?? null
                  })
                }
                onClick={() =>
                  onYearChange?.(selectedYear === d.year ? null : d.year)
                }
              />
            </g>
          )
        })}

        {/* X axis labels */}
        {xTicks.map((d) => (
          <text
            key={d.year}
            x={x(d.year)}
            y={baseY + 20}
            textAnchor="middle"
            fontSize={FONT_TICK}
            fill={COLOR_AXIS_LABEL}
          >
            {d.year}
          </text>
        ))}

        {/* Y axis label */}
        <text
          x={10}
          y={PAD.top + INNER_H / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={FONT_LABEL}
          fill={COLOR_AXIS_LABEL}
          transform={`rotate(-90, 10, ${PAD.top + INNER_H / 2})`}
        >
          per 1,000 inhabitants
        </text>

        {/* Axes */}
        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={baseY}
          stroke={COLOR_AXIS}
        />
        <line
          x1={PAD.left}
          y1={baseY}
          x2={PAD.left + INNER_W}
          y2={baseY}
          stroke={COLOR_AXIS}
        />
      </svg>

      {tooltip &&
        (() => {
          const hasRegional = tooltip.regional != null
          return (
            <ChartTooltip
              x={tooltip.x}
              y={tooltip.y}
              width={hasRegional ? 240 : 180}
            >
              {/* Header */}
              <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                <span className="font-semibold text-gray-800">
                  {tooltip.year}
                </span>
                <span className="text-gray-400 ml-auto">
                  per 1,000 inhabitants
                </span>
              </div>

              {/* Body — two columns when regional data exists, single national column otherwise */}
              <div className="flex divide-x divide-gray-100">
                {hasRegional && (
                  <div className="flex-1 px-3 py-2 bg-teal-50/60">
                    <p className="text-[10px] font-semibold tracking-widest text-teal-600 uppercase mb-1.5">
                      {regionName}
                    </p>
                    <span className="text-lg font-bold text-gray-800">
                      {fmtPer1000(tooltip.regional!)}
                    </span>
                  </div>
                )}
                <div className="flex-1 px-3 py-2">
                  <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
                    National
                  </p>
                  <span className="text-lg font-bold text-gray-600">
                    {tooltip.national != null
                      ? fmtPer1000(tooltip.national)
                      : '—'}
                  </span>
                </div>
              </div>

              {/* Footer — only when both values present */}
              {hasRegional &&
                tooltip.national != null &&
                (() => {
                  const diff = tooltip.regional! - tooltip.national
                  const pct =
                    tooltip.national > 0
                      ? (diff / tooltip.national) * 100
                      : null
                  const absPct = pct !== null ? Math.abs(pct) : null
                  const direction = diff > 0 ? 'higher' : 'lower'
                  const label = regionName ?? 'Your region'
                  const text =
                    absPct === null
                      ? null
                      : absPct < 5
                        ? `${label}: about the same as national avg.`
                        : `${label}: dispensed ${absPct.toFixed(0)}% ${direction} than national avg.`
                  if (!text) return null
                  return (
                    <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50">
                      <p className="text-[10px] text-teal-600">{text}</p>
                    </div>
                  )
                })()}
            </ChartTooltip>
          )
        })()}
    </div>
  )
}
