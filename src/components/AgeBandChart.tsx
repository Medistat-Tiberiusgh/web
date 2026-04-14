import { useState } from 'react'
import { Chip } from '@heroui/react'
import type { AgeSplitPoint } from '../types'
import { useUser } from '../context/UserContext'
import ChartTooltip from './ChartTooltip'

interface TooltipState {
  x: number
  y: number
  ageGroupName: string
  regional: number
  national: number | null
  isUser: boolean
  regRank: number
  natRank: number | null
  total: number
}

interface Props {
  data: AgeSplitPoint[]
  regionalData?: AgeSplitPoint[]
  latestYear: number | null
  regionName?: string | null
}

export default function AgeBandChart({ data, regionalData, latestYear, regionName }: Props) {
  const user = useUser()
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  const natRows = data
    .filter((d) => latestYear !== null && d.year === latestYear)
    .sort((a, b) => a.ageGroupId - b.ageGroupId)

  const regRows = (regionalData ?? [])
    .filter((d) => latestYear !== null && d.year === latestYear)
    .sort((a, b) => a.ageGroupId - b.ageGroupId)

  const primaryRows = regRows.length > 0 ? regRows : natRows
  const hasRegional = regRows.length > 0
  const natByGroup = new Map(natRows.map((r) => [r.ageGroupId, r.per1000]))
  const maxValue = Math.max(...primaryRows.map((r) => r.per1000), ...natRows.map((r) => r.per1000), 1)

  if (primaryRows.length === 0 || latestYear === null) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No age data available
      </div>
    )
  }

  const half = Math.ceil(primaryRows.length / 2)
  const cols = [primaryRows.slice(0, half), primaryRows.slice(half)]

  return (
    <>
      <div className="flex gap-6 px-4 pb-4 pt-2" onMouseLeave={() => setTooltip(null)}>
        {cols.map((col, colIdx) => (
          <ul key={colIdx} className="flex-1 flex flex-col gap-1">
            {col.map((row) => {
              const isUser = user?.ageGroupId != null && row.ageGroupId === user.ageGroupId
              const natVal = natByGroup.get(row.ageGroupId) ?? null
              const regPct = (row.per1000 / maxValue) * 100
              const natPct = natVal !== null ? (natVal / maxValue) * 100 : null

              return (
                <li
                  key={row.ageGroupId}
                  className={`rounded-md px-2 py-1.5 -mx-2 cursor-default ${
                    isUser ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                  onMouseEnter={(e) => {
                    const regSorted = [...primaryRows].sort((a, b) => b.per1000 - a.per1000)
                    const regRank = regSorted.findIndex((r) => r.ageGroupId === row.ageGroupId) + 1
                    const natSorted = [...natRows].sort((a, b) => b.per1000 - a.per1000)
                    const natRankIdx = natSorted.findIndex((r) => r.ageGroupId === row.ageGroupId)
                    const natRank = natRankIdx >= 0 ? natRankIdx + 1 : null
                    setTooltip({ x: e.clientX, y: e.clientY, ageGroupName: row.ageGroupName, regional: row.per1000, national: natVal, isUser, regRank, natRank, total: primaryRows.length })
                  }}
                  onMouseMove={(e) =>
                    setTooltip((t) => t ? { ...t, x: e.clientX, y: e.clientY } : null)
                  }
                  onMouseLeave={() => setTooltip(null)}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`text-xs ${isUser ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                      {row.ageGroupName}
                    </span>
                    {isUser && <Chip size="sm" variant="soft" color="accent">You</Chip>}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <div className="relative h-1.5 w-full rounded-full bg-gray-200">
                      <div
                        className={`absolute left-0 top-0 h-1.5 rounded-full ${isUser ? 'bg-teal-600' : 'bg-teal-500'}`}
                        style={{ width: `${regPct}%` }}
                      />
                    </div>
                    {hasRegional && natPct !== null && (
                      <div className="relative h-1.5 w-full rounded-full bg-gray-200">
                        <div
                          className="absolute left-0 top-0 h-1.5 rounded-full bg-blue-700"
                          style={{ width: `${natPct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ))}
      </div>

      {tooltip && (() => {
        return (
          <ChartTooltip x={tooltip.x} y={tooltip.y} width={hasRegional ? 240 : 180}>
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
            <span className="font-semibold text-gray-800">{tooltip.ageGroupName}</span>
            {tooltip.isUser && (
              <span className="text-[10px] font-medium text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full">You</span>
            )}
            <span className="text-gray-400 ml-auto">per 1,000 people</span>
          </div>

          {/* Body — two columns when regional data exists, single national column otherwise */}
          <div className="flex divide-x divide-gray-100">
            {hasRegional && (
              <div className="flex-1 px-3 py-2 bg-teal-50/60">
                <p className="text-[10px] font-semibold tracking-widest text-teal-600 uppercase mb-1.5">
                  {regionName}
                </p>
                <span className="text-lg font-bold text-gray-800">{tooltip.regional.toFixed(1)}</span>
              </div>
            )}
            <div className="flex-1 px-3 py-2">
              <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-1.5">
                National
              </p>
              <span className="text-lg font-bold text-gray-600">
                {(hasRegional ? tooltip.national : tooltip.regional) !== null
                  ? (hasRegional ? tooltip.national! : tooltip.regional).toFixed(1)
                  : '—'}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 py-1.5 border-t border-gray-100 bg-gray-50 flex flex-col gap-0.5">
            {(() => {
              const s = (r: number) => r === 1 ? 'st' : r === 2 ? 'nd' : r === 3 ? 'rd' : 'th'
              if (!hasRegional) {
                return (
                  <p className="text-[10px] text-gray-500">
                    National: {tooltip.regRank}{s(tooltip.regRank)} highest among all age groups.
                  </p>
                )
              }
              const diff = tooltip.national !== null ? tooltip.regional - tooltip.national : null
              const pct = diff !== null && tooltip.national! > 0 ? (diff / tooltip.national!) * 100 : null
              const absPct = pct !== null ? Math.abs(pct) : null
              const direction = diff !== null && diff > 0 ? 'higher' : 'lower'
              const vsNat = absPct === null ? '' : absPct < 5
                ? 'about the same as national avg.'
                : `dispensed ${absPct.toFixed(0)}% ${direction} than national avg.`
              return (
                <>
                  <p className="text-[10px] text-teal-600">
                    {regionName}: {tooltip.regRank}{s(tooltip.regRank)} highest among age groups{vsNat ? `. ${vsNat}` : '.'}
                  </p>
                  {tooltip.natRank !== null && (
                    <p className="text-[10px] text-blue-500">
                      National: {tooltip.natRank}{s(tooltip.natRank)} highest among all age groups.
                    </p>
                  )}
                </>
              )
            })()}
          </div>
          </ChartTooltip>
        )
      })()}
    </>
  )
}
