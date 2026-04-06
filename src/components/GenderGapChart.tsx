import { useState } from 'react'
import type { GenderSplitPoint } from '../types'
import { useUser } from '../context/UserContext'

interface Props {
  data: GenderSplitPoint[]
}

function isMaleLike(g: string) {
  const l = g.toLowerCase()
  return l === 'men' || l === 'män' || l === 'male' || l === 'man' || l === 'm'
}

function displayLabel(g: string) {
  const l = g.toLowerCase()
  if (l === 'män' || l === 'man' || l === 'male') return 'Men'
  if (l === 'kvinnor' || l === 'kvinna' || l === 'female' || l === 'woman')
    return 'Women'
  return g
}

const W = 500
const PAD = { top: 28, right: 12, bottom: 8, left: 12 }
const CENTER_W = 36
const BAR_H = 10
const BAR_GAP = 4
const BAR_AREA = (W - PAD.left - PAD.right - CENTER_W) / 2

interface TooltipState {
  x: number
  y: number
  year: number
  men: number
  women: number
}

export default function GenderGapChart({ data }: Props) {
  const user = useUser()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No gender data available
      </div>
    )
  }

  const uniqueGenders = [...new Set(data.map((d) => d.gender))]
  const maleLabel = displayLabel(
    uniqueGenders.find(isMaleLike) ?? uniqueGenders[0]
  )
  const femaleLabel = displayLabel(
    uniqueGenders.find((g) => !isMaleLike(g)) ?? uniqueGenders[1]
  )

  // genderId 1 = male, 2 = female (reference data convention)
  const userIsMale = user ? user.genderId === 1 : false

  const byYear = new Map<number, { men: number; women: number }>()
  for (const pt of data) {
    if (!byYear.has(pt.year)) byYear.set(pt.year, { men: 0, women: 0 })
    const entry = byYear.get(pt.year)!
    if (isMaleLike(pt.gender)) entry.men = pt.per1000
    else entry.women = pt.per1000
  }

  const years = Array.from(byYear.keys()).sort((a, b) => a - b)
  const maxVal = Math.max(
    ...Array.from(byYear.values()).flatMap((v) => [v.men, v.women])
  )

  const H = PAD.top + years.length * (BAR_H + BAR_GAP) - BAR_GAP + PAD.bottom
  const centerX = PAD.left + BAR_AREA + CENTER_W / 2

  const menColor = userIsMale ? '#f59e0b' : '#3b82f6'
  const womenColor = !userIsMale ? '#f59e0b' : '#fb7185'

  return (
    <div className="relative">
      <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-1">
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ background: menColor }}
          />
          {maleLabel}
          {userIsMale ? ' (you)' : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ background: womenColor }}
          />
          {femaleLabel}
          {!userIsMale ? ' (you)' : ''}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseLeave={() => setTooltip(null)}
      >
        <text
          x={centerX - CENTER_W / 2 - 4}
          y={PAD.top - 10}
          textAnchor="end"
          fontSize={9}
          fill="#9ca3af"
        >
          ← {maleLabel} (per 1k)
        </text>
        <text
          x={centerX + CENTER_W / 2 + 4}
          y={PAD.top - 10}
          textAnchor="start"
          fontSize={9}
          fill="#9ca3af"
        >
          {femaleLabel} (per 1k) →
        </text>

        {years.map((year, i) => {
          const { men, women } = byYear.get(year)!
          const y = PAD.top + i * (BAR_H + BAR_GAP)
          const menLen = (men / (maxVal || 1)) * BAR_AREA
          const womenLen = (women / (maxVal || 1)) * BAR_AREA
          const isHovered = tooltip?.year === year

          return (
            <g key={year}>
              <rect
                x={centerX - CENTER_W / 2 - menLen}
                y={y}
                width={menLen}
                height={BAR_H}
                rx={2}
                fill={menColor}
                opacity={isHovered ? 1 : 0.7}
              />
              <rect
                x={centerX + CENTER_W / 2}
                y={y}
                width={womenLen}
                height={BAR_H}
                rx={2}
                fill={womenColor}
                opacity={isHovered ? 1 : 0.7}
              />
              <text
                x={centerX}
                y={y + BAR_H / 2 + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={8}
                fill={isHovered ? '#111827' : '#9ca3af'}
                fontWeight={isHovered ? 'bold' : 'normal'}
              >
                {year}
              </text>
              <rect
                x={PAD.left}
                y={y - BAR_GAP / 2}
                width={W - PAD.left - PAD.right}
                height={BAR_H + BAR_GAP}
                fill="transparent"
                style={{ cursor: 'crosshair' }}
                onMouseEnter={(e) =>
                  setTooltip({ x: e.clientX, y: e.clientY, year, men, women })
                }
                onMouseMove={(e) =>
                  setTooltip({ x: e.clientX, y: e.clientY, year, men, women })
                }
              />
            </g>
          )
        })}

        <line
          x1={centerX - CENTER_W / 2}
          y1={PAD.top - 4}
          x2={centerX - CENTER_W / 2}
          y2={H - PAD.bottom}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        <line
          x1={centerX + CENTER_W / 2}
          y1={PAD.top - 4}
          x2={centerX + CENTER_W / 2}
          y2={H - PAD.bottom}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      </svg>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <p className="font-semibold text-gray-900">{tooltip.year}</p>
          <p style={{ color: userIsMale ? '#d97706' : '#2563eb' }}>
            {maleLabel}: {tooltip.men.toFixed(1)} per 1,000
          </p>
          <p style={{ color: !userIsMale ? '#d97706' : '#f43f5e' }}>
            {femaleLabel}: {tooltip.women.toFixed(1)} per 1,000
          </p>
          {tooltip.men > 0 && tooltip.women > 0 && (
            <p className="text-gray-400 text-xs mt-0.5">
              {tooltip.women > tooltip.men
                ? `${femaleLabel} +${(((tooltip.women - tooltip.men) / tooltip.men) * 100).toFixed(0)}% higher`
                : `${maleLabel} +${(((tooltip.men - tooltip.women) / tooltip.women) * 100).toFixed(0)}% higher`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
