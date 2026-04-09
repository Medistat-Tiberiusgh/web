import { useState } from 'react'
import { Chip } from '@heroui/react'
import type { AgeSplitPoint } from '../types'
import { useUser } from '../context/UserContext'

interface TooltipState {
  x: number
  y: number
  ageGroupName: string
  regional: number
  national: number | null
  isUser: boolean
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
              const isUser = row.ageGroupId === user?.ageGroupId
              const natVal = natByGroup.get(row.ageGroupId) ?? null
              const regPct = (row.per1000 / maxValue) * 100
              const natPct = natVal !== null ? (natVal / maxValue) * 100 : null

              return (
                <li
                  key={row.ageGroupId}
                  className={`rounded-md px-2 py-1.5 -mx-2 cursor-default ${
                    isUser ? 'bg-gray-50 hover:bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                  onMouseEnter={(e) =>
                    setTooltip({ x: e.clientX, y: e.clientY, ageGroupName: row.ageGroupName, regional: row.per1000, national: natVal, isUser })
                  }
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

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-sm min-w-44"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <div className="flex items-center gap-1.5 font-semibold text-gray-800 mb-1.5">
            {tooltip.ageGroupName}
            {tooltip.isUser && (
              <span className="text-xs font-normal text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full">You</span>
            )}
          </div>
          <p className="text-gray-400 text-xs mb-1.5">dispensings per 1,000 people</p>
          {hasRegional && (
            <div className="flex items-center gap-1.5 text-teal-700">
              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
              <span>{regionName ?? 'Region'}: <span className="font-semibold">{tooltip.regional.toFixed(1)}</span></span>
            </div>
          )}
          {tooltip.national !== null && (
            <div className="flex items-center gap-1.5 text-blue-700 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-blue-700 shrink-0" />
              <span>National: <span className="font-semibold">{tooltip.national.toFixed(1)}</span></span>
            </div>
          )}
          {hasRegional && tooltip.national !== null && (() => {
            const diff = tooltip.regional - tooltip.national
            const pct = tooltip.national > 0 ? (diff / tooltip.national) * 100 : 0
            const absPct = Math.abs(pct)
            const direction = diff > 0 ? 'higher' : 'lower'
            const magnitude = absPct < 5 ? 'about the same as' : absPct < 20 ? `${absPct.toFixed(0)}% ${direction} than` : `${absPct.toFixed(0)}% ${direction} than`
            return (
              <div className="mt-1.5 border-t border-gray-100 pt-1.5 flex flex-col gap-1">
                <p className="text-gray-500 text-xs">
                  {absPct < 5
                    ? `${regionName ?? 'This region'} is about the same as the national average.`
                    : `${regionName ?? 'This region'} is ${magnitude} the national average.`
                  }
                </p>
                {tooltip.isUser && (
                  <p className="text-teal-600 text-xs font-medium">
                    This is your age group.
                  </p>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </>
  )
}
