import { useState } from 'react'
import type { TrendPoint } from '../types'
import ChartTooltip from './ChartTooltip'

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
}

const W = 600
const H = 260
const PAD = { top: 20, right: 16, bottom: 40, left: 48 }
const INNER_W = W - PAD.left - PAD.right
const INNER_H = H - PAD.top - PAD.bottom

function scaleX(year: number, minYear: number, maxYear: number) {
  return PAD.left + ((year - minYear) / (maxYear - minYear || 1)) * INNER_W
}

function scaleY(value: number, minVal: number, maxVal: number) {
  return (
    PAD.top + INNER_H - ((value - minVal) / (maxVal - minVal || 1)) * INNER_H
  )
}

// Smooth cubic bezier path through points
function buildSmoothedPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C ${cpx.toFixed(1)} ${prev.y.toFixed(1)}, ${cpx.toFixed(1)} ${curr.y.toFixed(1)}, ${curr.x.toFixed(1)} ${curr.y.toFixed(1)}`
  }
  return d
}

function buildAreaPath(
  linePath: string,
  points: { x: number; y: number }[],
  baseY: number
) {
  if (!linePath || points.length === 0) return ''
  return (
    linePath +
    ` L ${points[points.length - 1].x.toFixed(1)} ${baseY.toFixed(1)}` +
    ` L ${points[0].x.toFixed(1)} ${baseY.toFixed(1)} Z`
  )
}

export default function TrendChart({ data, regionalData, regionName }: Props) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No trend data available
      </div>
    )
  }

  const years = data.map((d) => d.year)
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)

  const allPer1000 = [
    ...data.map((d) => d.per1000),
    ...(regionalData ?? []).map((d) => d.per1000),
  ]
  const maxVal = Math.max(...allPer1000) * 1.08
  const minVal = 0
  const baseY = PAD.top + INNER_H

  const natPoints = data.map((d) => ({
    x: scaleX(d.year, minYear, maxYear),
    y: scaleY(d.per1000, minVal, maxVal),
    year: d.year,
    per1000: d.per1000,
  }))

  const regPoints = (regionalData ?? []).map((d) => ({
    x: scaleX(d.year, minYear, maxYear),
    y: scaleY(d.per1000, minVal, maxVal),
    year: d.year,
    per1000: d.per1000,
  }))

  const natPath = buildSmoothedPath(natPoints)
  const regPath = buildSmoothedPath(regPoints)
  const natAreaPath = buildAreaPath(natPath, natPoints, baseY)
  const regAreaPath = buildAreaPath(regPath, regPoints, baseY)

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = (maxVal / 4) * i
    return { val, y: scaleY(val, minVal, maxVal) }
  })

  const xTicks = data.filter((_, i) => i % 3 === 0 || data[i].year === maxYear)
  const colWidth = INNER_W / data.length

  const regByYear = new Map((regionalData ?? []).map((d) => [d.year, d.per1000]))

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="natGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map(({ val, y }) => (
          <g key={val}>
            <line x1={PAD.left} y1={y} x2={PAD.left + INNER_W} y2={y} stroke="#f3f4f6" strokeWidth={1} />
            <text x={PAD.left - 8} y={y} textAnchor="end" dominantBaseline="middle" fontSize={10} fill="#9ca3af">
              {val.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Area fills — drawn before lines so lines sit on top */}
        {regAreaPath && <path d={regAreaPath} fill="url(#regGrad)" />}
        <path d={natAreaPath} fill="url(#natGrad)" />

        {/* Lines */}
        <path d={natPath} fill="none" stroke="#1d4ed8" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {regPath && (
          <path d={regPath} fill="none" stroke="#0d9488" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Hover crosshair */}
        {tooltip && (
          <line
            x1={scaleX(tooltip.year, minYear, maxYear)}
            y1={PAD.top}
            x2={scaleX(tooltip.year, minYear, maxYear)}
            y2={baseY}
            stroke="#9ca3af"
            strokeWidth={1}
            strokeDasharray="3 2"
          />
        )}

        {/* Dots — only visible on hovered year */}
        {natPoints.map(({ x, y, year, per1000 }) => {
          const hovered = tooltip?.year === year
          return (
            <g key={year}>
              {hovered && (
                <>
                  <circle cx={x} cy={y} r={6} fill="white" stroke="#1d4ed8" strokeWidth={2} />
                  {regByYear.has(year) && (
                    <circle
                      cx={x}
                      cy={scaleY(regByYear.get(year)!, minVal, maxVal)}
                      r={6}
                      fill="white"
                      stroke="#0d9488"
                      strokeWidth={2}
                    />
                  )}
                </>
              )}
              <rect
                x={x - colWidth / 2}
                y={PAD.top}
                width={colWidth}
                height={INNER_H}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={(e) =>
                  setTooltip({ x: e.clientX, y: e.clientY, year, national: per1000, regional: regByYear.get(year) ?? null })
                }
                onMouseMove={(e) =>
                  setTooltip({ x: e.clientX, y: e.clientY, year, national: per1000, regional: regByYear.get(year) ?? null })
                }
              />
            </g>
          )
        })}

        {/* X axis labels */}
        {xTicks.map((d) => (
          <text
            key={d.year}
            x={scaleX(d.year, minYear, maxYear)}
            y={baseY + 20}
            textAnchor="middle"
            fontSize={10}
            fill="#9ca3af"
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
          fontSize={9}
          fill="#9ca3af"
          transform={`rotate(-90, 10, ${PAD.top + INNER_H / 2})`}
        >
          per 1,000 inhabitants
        </text>

        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={baseY} stroke="#e5e7eb" />
        <line x1={PAD.left} y1={baseY} x2={PAD.left + INNER_W} y2={baseY} stroke="#e5e7eb" />
      </svg>

      {tooltip && (() => {
        const hasRegional = tooltip.regional != null
        return (
          <ChartTooltip x={tooltip.x} y={tooltip.y} width={hasRegional ? 240 : 180}>
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
            <span className="font-semibold text-gray-800">{tooltip.year}</span>
            <span className="text-gray-400 ml-auto">per 1,000 inhabitants</span>
          </div>

          {/* Body — two columns when regional data exists, single national column otherwise */}
          <div className="flex divide-x divide-gray-100">
            {hasRegional && (
              <div className="flex-1 px-3 py-2 bg-teal-50/60">
                <p className="text-[10px] font-semibold tracking-widest text-teal-600 uppercase mb-1.5">
                  {regionName}
                </p>
                <span className="text-lg font-bold text-gray-800">
                  {tooltip.regional!.toFixed(1)}
                </span>
              </div>
            )}
            <div className="flex-1 px-3 py-2">
              <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
                National
              </p>
              <span className="text-lg font-bold text-gray-600">
                {tooltip.national != null ? tooltip.national.toFixed(1) : '—'}
              </span>
            </div>
          </div>

          {/* Footer — only when both values present */}
          {hasRegional && tooltip.national != null && (() => {
            const diff = tooltip.regional! - tooltip.national
            const pct = tooltip.national > 0 ? (diff / tooltip.national) * 100 : null
            const absPct = pct !== null ? Math.abs(pct) : null
            const direction = diff > 0 ? 'higher' : 'lower'
            const text = absPct === null ? null : absPct < 5
              ? `${regionName}: about the same as national avg.`
              : `${regionName}: dispensed ${absPct.toFixed(0)}% ${direction} than national avg.`
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
