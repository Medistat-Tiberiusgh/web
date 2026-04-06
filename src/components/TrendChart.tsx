import { useState } from 'react'
import type { TrendPoint } from '../types'

interface TooltipState {
  x: number
  y: number
  point: TrendPoint
}

interface Props {
  data: TrendPoint[]
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

function buildPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return ''
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
}

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
  return `${n}`
}

export default function TrendChart({ data }: Props) {
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

  const maxVal = Math.max(
    ...data.map((d) => d.totalPrescriptions),
    ...data.map((d) => d.totalPatients)
  )
  const minVal = 0

  const prescPoints = data.map((d) => ({
    x: scaleX(d.year, minYear, maxYear),
    y: scaleY(d.totalPrescriptions, minVal, maxVal),
    data: d
  }))

  const patientPoints = data.map((d) => ({
    x: scaleX(d.year, minYear, maxYear),
    y: scaleY(d.totalPatients, minVal, maxVal),
    data: d
  }))

  const prescPath = buildPath(prescPoints)
  const patientPath = buildPath(patientPoints)

  const areaPath =
    prescPath +
    ` L ${prescPoints[prescPoints.length - 1].x.toFixed(1)} ${(PAD.top + INNER_H).toFixed(1)}` +
    ` L ${prescPoints[0].x.toFixed(1)} ${(PAD.top + INNER_H).toFixed(1)} Z`

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = (maxVal / 4) * i
    return { val, y: scaleY(val, minVal, maxVal) }
  })

  const xTicks = data.filter((_, i) => i % 3 === 0 || data[i].year === maxYear)
  const colWidth = INNER_W / data.length

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map(({ val, y }) => (
          <g key={val}>
            <line
              x1={PAD.left}
              y1={y}
              x2={PAD.left + INNER_W}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fill="#9ca3af"
            >
              {fmt(val)}
            </text>
          </g>
        ))}

        <path d={areaPath} fill="url(#areaGradient)" />
        <path
          d={patientPath}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <path
          d={prescPath}
          fill="none"
          stroke="#1d4ed8"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {tooltip && (
          <line
            x1={scaleX(tooltip.point.year, minYear, maxYear)}
            y1={PAD.top}
            x2={scaleX(tooltip.point.year, minYear, maxYear)}
            y2={PAD.top + INNER_H}
            stroke="#1d4ed8"
            strokeWidth={1}
            strokeDasharray="3 2"
            opacity={0.4}
          />
        )}

        {prescPoints.map(({ x, y, data: d }, i) => (
          <g key={d.year}>
            <circle
              cx={x}
              cy={y}
              r={tooltip?.point.year === d.year ? 5 : 3}
              fill="#1d4ed8"
            />
            <circle
              cx={patientPoints[i].x}
              cy={patientPoints[i].y}
              r={tooltip?.point.year === d.year ? 4 : 2.5}
              fill="#9ca3af"
            />
            <rect
              x={x - colWidth / 2}
              y={PAD.top}
              width={colWidth}
              height={INNER_H}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={(e) =>
                setTooltip({ x: e.clientX, y: e.clientY, point: d })
              }
              onMouseMove={(e) =>
                setTooltip({ x: e.clientX, y: e.clientY, point: d })
              }
            />
          </g>
        ))}

        {xTicks.map((d) => (
          <text
            key={d.year}
            x={scaleX(d.year, minYear, maxYear)}
            y={PAD.top + INNER_H + 20}
            textAnchor="middle"
            fontSize={10}
            fill="#9ca3af"
          >
            {d.year}
          </text>
        ))}

        <line
          x1={PAD.left}
          y1={PAD.top}
          x2={PAD.left}
          y2={PAD.top + INNER_H}
          stroke="#e5e7eb"
        />
        <line
          x1={PAD.left}
          y1={PAD.top + INNER_H}
          x2={PAD.left + INNER_W}
          y2={PAD.top + INNER_H}
          stroke="#e5e7eb"
        />
      </svg>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <p className="font-semibold text-gray-900">{tooltip.point.year}</p>
          <p className="text-blue-700">
            {tooltip.point.totalPrescriptions.toLocaleString()} dispensings
          </p>
          <p className="text-gray-500">
            {tooltip.point.totalPatients.toLocaleString()} patients
          </p>
        </div>
      )}
    </div>
  )
}
