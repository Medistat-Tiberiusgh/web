import { ProgressBar, Card } from '@heroui/react'
import type { Region } from '../types'

interface Props {
  regions: Region[]
}

export default function RegionalRanking({ regions }: Props) {
  const national = regions.find((r) => r.regionId === 0)
  const ranked = regions
    .filter((r) => r.regionId !== 0)
    .sort((a, b) => b.per1000 - a.per1000)

  const maxValue = Math.max(...regions.map((r) => r.per1000), 1)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Regional Ranking</h2>
        <p className="text-xs text-gray-400 mt-0.5">Prescriptions per 1,000 residents · descending</p>
      </div>

      <ul className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {ranked.map((region) => (
          <li key={region.regionId}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-700">{region.regionName}</span>
              <span className="text-sm font-semibold text-blue-600">{region.per1000.toFixed(1)}</span>
            </div>
            <ProgressBar value={region.per1000} maxValue={maxValue} aria-label={region.regionName}>
              <ProgressBar.Track>
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
          </li>
        ))}

        {national && (
          <li className="border border-blue-200 bg-blue-50 rounded-lg p-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">National</span>
                <span className="text-sm text-blue-700 font-medium">{national.regionName}</span>
              </div>
              <span className="text-sm font-semibold text-blue-600">{national.per1000.toFixed(1)}</span>
            </div>
            <ProgressBar value={national.per1000} maxValue={maxValue} aria-label="National average">
              <ProgressBar.Track>
                <ProgressBar.Fill className="bg-blue-400" />
              </ProgressBar.Track>
            </ProgressBar>
          </li>
        )}
      </ul>

      <div className="p-4">
        <Card className="bg-blue-900 text-white">
          <Card.Content className="p-4">
            <p className="text-xs text-blue-300 uppercase tracking-wider mb-2">Trend Outlook</p>
            <p className="text-xs text-blue-300 uppercase mb-1">National Avg</p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">{national?.per1000.toFixed(1) ?? '—'}</span>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}
