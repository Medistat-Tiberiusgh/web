import { Card, CardContent } from '@/components/ui/card'
import InfoPopover from '../InfoPopover'
import { TEXT_HEADING, TEXT_SECONDARY, TEXT_MUTED } from '@/theme'

interface Props {
  label: string
  value: string
  subValue?: string
  delta?: { value: string; subLabel?: string }
  nationalDelta?: { value: string; pct: number; avgLabel: string } | null
  info: React.ReactNode
}

function nationalDeltaColor(pct: number) {
  const abs = Math.abs(pct)
  if (abs < 15) return 'text-indigo-500'
  if (abs < 30) return 'text-amber-500'
  return 'text-red-500'
}

export default function KpiCard({
  label,
  value,
  subValue,
  delta,
  nationalDelta,
  info
}: Props) {
  return (
    <Card className="py-0 gap-0">
      <CardContent className="p-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-semibold tracking-widest uppercase ${TEXT_MUTED}`}
            >
              {label}
            </span>
            <InfoPopover>{info}</InfoPopover>
          </div>

          <div className="flex items-start justify-between gap-2">
            <span
              className={`text-3xl font-bold tracking-tight leading-none pt-0.5 ${TEXT_HEADING}`}
            >
              {value}
            </span>

            {(delta || subValue || nationalDelta) && (
              <div className="flex flex-col items-end gap-0.5">
                {delta && (
                  <span className={`text-xs font-semibold ${TEXT_SECONDARY}`}>
                    {delta.value} vs prior year
                    {delta.subLabel ? ` ${delta.subLabel}` : ''}
                  </span>
                )}
                {subValue && (
                  <span className={`text-xs ${TEXT_MUTED}`}>{subValue}</span>
                )}
                {nationalDelta && (
                  <span
                    className={`text-xs font-semibold ${nationalDeltaColor(nationalDelta.pct)}`}
                  >
                    {nationalDelta.value} vs national avg{' '}
                    <span className="font-normal opacity-75">
                      ({nationalDelta.avgLabel})
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
