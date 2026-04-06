import { ProgressBar, Chip } from '@heroui/react'
import type { RegionalStat } from '../types'
import { useUser } from '../context/UserContext'

interface Props {
  regions: RegionalStat[]
}

export default function RegionalRanking({ regions }: Props) {
  const user = useUser()

  const ranked = regions
    .filter((r) => r.regionId !== 0)
    .sort((a, b) => b.per1000 - a.per1000)

  const maxValue = Math.max(...regions.map((r) => r.per1000), 1)

  return (
    <div className="flex flex-col h-full">
      <ul className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {ranked.map((region) => {
          const isHome = region.regionId === user?.regionId
          return (
            <li key={region.regionId}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-700">{region.regionName}</span>
                  {isHome && (
                    <Chip size="sm" variant="soft" color="accent">Home</Chip>
                  )}
                </div>
                <span className="text-sm font-semibold text-blue-600">{region.per1000.toFixed(1)}</span>
              </div>
              <ProgressBar value={region.per1000} maxValue={maxValue} aria-label={region.regionName}>
                <ProgressBar.Track>
                  <ProgressBar.Fill className={isHome ? 'bg-accent' : ''} />
                </ProgressBar.Track>
              </ProgressBar>
            </li>
          )
        })}
      </ul>

    </div>
  )
}
