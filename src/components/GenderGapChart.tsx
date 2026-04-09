import { useState } from 'react'
import type { GenderSplitPoint } from '../types'
import { useUser } from '../context/UserContext'

interface Props {
  data: GenderSplitPoint[]
  regionalData?: GenderSplitPoint[]
  regionName?: string | null
}

function isMaleLike(g: string) {
  const l = g.toLowerCase()
  return l === 'men' || l === 'män' || l === 'male' || l === 'man' || l === 'm'
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
  const map = new Map<number, { men: number; women: number }>()
  for (const pt of data) {
    if (!map.has(pt.year)) map.set(pt.year, { men: 0, women: 0 })
    const entry = map.get(pt.year)!
    if (isMaleLike(pt.gender)) entry.men = pt.per1000
    else entry.women = pt.per1000
  }
  return map
}

export default function GenderGapChart({ data, regionalData, regionName }: Props) {
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
  const maleLabel = displayLabel(uniqueGenders.find(isMaleLike) ?? uniqueGenders[0])
  const femaleLabel = displayLabel(uniqueGenders.find((g) => !isMaleLike(g)) ?? uniqueGenders[1])

  const userIsMale = user ? user.genderId === 1 : false

  const natByYear = buildYearMap(data)
  const regByYear = buildYearMap(regionalData ?? [])
  const hasRegional = (regionalData ?? []).length > 0

  const primaryByYear = hasRegional ? regByYear : natByYear
  const years = Array.from(natByYear.keys()).sort((a, b) => a - b)

  const allVals = [
    ...Array.from(natByYear.values()).flatMap((v) => [v.men, v.women]),
    ...Array.from(regByYear.values()).flatMap((v) => [v.men, v.women]),
  ]
  const maxVal = Math.max(...allVals, 1)

  const H = PAD.top + years.length * (BAR_H + BAR_GAP) - BAR_GAP + PAD.bottom
  const centerX = PAD.left + BAR_AREA + CENTER_W / 2

  // Fixed gender colors — independent of regional/national scheme
  const menColor = userIsMale ? '#3b82f6' : '#93c5fd'
  const womenColor = !userIsMale ? '#f43f5e' : '#fda4af'

  return (
    <div className="relative pt-1">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        onMouseLeave={() => setTooltip(null)}
      >
        <text x={centerX - CENTER_W / 2 - 4} y={PAD.top - 4} textAnchor="end" fontSize={9} fill="#9ca3af">
          ← {maleLabel}{userIsMale ? ' (you)' : ''}
        </text>
        <text x={centerX + CENTER_W / 2 + 4} y={PAD.top - 4} textAnchor="start" fontSize={9} fill="#9ca3af">
          {femaleLabel}{!userIsMale ? ' (you)' : ''} →
        </text>

        {years.map((year, i) => {
          const primary = primaryByYear.get(year) ?? { men: 0, women: 0 }
          const nat = natByYear.get(year) ?? { men: 0, women: 0 }
          const rowH = BAR_H + BAR_GAP
          const y = PAD.top + i * rowH
          const isHovered = tooltip?.year === year

          const regMenLen = (primary.men / maxVal) * BAR_AREA
          const regWomenLen = (primary.women / maxVal) * BAR_AREA

          return (
            <g key={year}>
              {/* Regional bars (primary) */}
              <rect x={centerX - CENTER_W / 2 - regMenLen} y={y} width={regMenLen} height={BAR_H} rx={2} fill={menColor} opacity={isHovered ? 1 : 0.75} />
              <rect x={centerX + CENTER_W / 2} y={y} width={regWomenLen} height={BAR_H} rx={2} fill={womenColor} opacity={isHovered ? 1 : 0.75} />

              {/* Year label */}
              <text x={centerX} y={y + BAR_H / 2 + 1} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill={isHovered ? '#111827' : '#9ca3af'} fontWeight={isHovered ? 'bold' : 'normal'}>
                {year}
              </text>

              {/* Hover target */}
              <rect
                x={PAD.left} y={y - BAR_GAP / 2} width={W - PAD.left - PAD.right} height={rowH}
                fill="transparent" style={{ cursor: 'crosshair' }}
                onMouseEnter={(e) => setTooltip({ x: e.clientX, y: e.clientY, year, regMen: hasRegional ? primary.men : null, regWomen: hasRegional ? primary.women : null, natMen: nat.men, natWomen: nat.women })}
                onMouseMove={(e) => setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null)}
              />
            </g>
          )
        })}

        <line x1={centerX - CENTER_W / 2} y1={PAD.top - 4} x2={centerX - CENTER_W / 2} y2={H - PAD.bottom} stroke="#e5e7eb" strokeWidth={1} />
        <line x1={centerX + CENTER_W / 2} y1={PAD.top - 4} x2={centerX + CENTER_W / 2} y2={H - PAD.bottom} stroke="#e5e7eb" strokeWidth={1} />
      </svg>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden text-xs min-w-64"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100">
            <span className="font-semibold text-gray-800">{tooltip.year}</span>
            <span className="text-gray-400 ml-1.5">per 1,000 people</span>
          </div>

          {/* Two-column body */}
          <div className="flex divide-x divide-gray-100">
            {/* Left — regional */}
            <div className="flex-1 px-3 py-2 bg-teal-50/60">
              <p className="text-[10px] font-semibold tracking-widest text-teal-600 uppercase mb-1.5">
                {regionName ?? 'Region'}
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: menColor }} />
                    {maleLabel}{userIsMale ? ' · you' : ''}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {tooltip.regMen != null ? tooltip.regMen.toFixed(1) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-gray-600 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: womenColor }} />
                    {femaleLabel}{!userIsMale ? ' · you' : ''}
                  </span>
                  <span className="font-semibold text-gray-800">
                    {tooltip.regWomen != null ? tooltip.regWomen.toFixed(1) : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right — national */}
            <div className="flex-1 px-3 py-2">
              <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
                National
              </p>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-gray-500 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    {maleLabel}
                  </span>
                  <span className="font-semibold text-gray-700">
                    {tooltip.natMen != null ? tooltip.natMen.toFixed(1) : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 text-gray-500 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-rose-300 shrink-0" />
                    {femaleLabel}
                  </span>
                  <span className="font-semibold text-gray-700">
                    {tooltip.natWomen != null ? tooltip.natWomen.toFixed(1) : '—'}
                  </span>
                </div>
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
        </div>
      )}
    </div>
  )
}
