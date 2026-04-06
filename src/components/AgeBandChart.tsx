import { ProgressBar, Chip } from '@heroui/react'
import type { AgeSplitPoint } from '../types'
import { useUser } from '../context/UserContext'

interface Props {
  data: AgeSplitPoint[]
  latestYear: number | null
  columns?: 1 | 2
}

export default function AgeBandChart({ data, latestYear, columns = 1 }: Props) {
  const user = useUser()

  const rows = data
    .filter((d) => latestYear !== null && d.year === latestYear)
    .sort((a, b) => a.ageGroupId - b.ageGroupId)

  const maxValue = Math.max(...rows.map((r) => r.per1000), 1)

  if (rows.length === 0 || latestYear === null) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No age data available
      </div>
    )
  }

  const half = Math.ceil(rows.length / 2)
  const cols = columns === 2 ? [rows.slice(0, half), rows.slice(half)] : [rows]

  return (
    <div className="flex gap-6 p-4">
      {cols.map((col, ci) => (
        <ul key={ci} className="flex-1 flex flex-col gap-3">
          {col.map((row) => {
            const isUser = row.ageGroupId === user?.ageGroupId
            return (
              <li key={row.ageGroupId}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-700">
                      {row.ageGroupName}
                    </span>
                    {isUser && (
                      <Chip size="sm" variant="soft" color="accent">
                        You
                      </Chip>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {row.per1000.toFixed(1)}
                  </span>
                </div>
                <ProgressBar
                  value={row.per1000}
                  maxValue={maxValue}
                  aria-label={row.ageGroupName}
                >
                  <ProgressBar.Track>
                    <ProgressBar.Fill className={isUser ? 'bg-accent' : ''} />
                  </ProgressBar.Track>
                </ProgressBar>
              </li>
            )
          })}
        </ul>
      ))}
    </div>
  )
}
