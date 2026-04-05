import { ProgressBar, Chip, Card } from '@heroui/react'
import type { RegionalStat } from '../types'
import { useUser } from '../context/UserContext'

interface Props {
  regions: RegionalStat[]
}

export default function RegionalRanking({ regions }: Props) {
  const user = useUser()

  const national = regions.find((r) => r.regionId === 0)
  const homeRegion = regions.find((r) => r.regionId === user?.regionId)
  const ranked = regions
    .filter((r) => r.regionId !== 0)
    .sort((a, b) => b.per1000 - a.per1000)

  const maxValue = Math.max(...regions.map((r) => r.per1000), 1)

  const diff =
    homeRegion && national && national.per1000 > 0
      ? ((homeRegion.per1000 - national.per1000) / national.per1000) * 100
      : null

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Regional Ranking</h2>
        <p className="text-xs text-gray-400 mt-0.5">Dispensed prescriptions per 1,000 residents · descending</p>
      </div>

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

      <div className="p-3 shrink-0">
        <Card className="bg-blue-900 text-white">
          <Card.Content>
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-blue-300">National avg</p>
                <p className="text-xl font-bold">{national?.per1000.toFixed(1) ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-blue-300">{homeRegion?.regionName ?? 'Your region'}</p>
                <p className="text-xl font-bold">{homeRegion?.per1000.toFixed(1) ?? '—'}</p>
              </div>
              {diff !== null && (
                <div>
                  <p className="text-xs text-blue-300">vs national</p>
                  <p className={`text-xl font-bold ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {diff >= 0 ? '+' : ''}{diff.toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}
