import { Card, Popover } from '@heroui/react'

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
    <Card>
      <Card.Content className="p-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
              {label}
            </span>
            <Popover>
              <Popover.Trigger aria-label="More information">
                <button className="w-5 h-5 rounded-full border border-gray-300 text-gray-400 text-[11px] font-bold leading-none flex items-center justify-center hover:border-gray-500 hover:text-gray-600 transition-colors">
                  i
                </button>
              </Popover.Trigger>
              <Popover.Content className="max-w-64">
                <Popover.Dialog>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    {info}
                  </div>
                </Popover.Dialog>
              </Popover.Content>
            </Popover>
          </div>

          <div className="flex items-start justify-between gap-2">
            <span className="text-3xl font-bold text-gray-900 tracking-tight leading-none pt-0.5">
              {value}
            </span>

            {(delta || subValue || nationalDelta) && (
              <div className="flex flex-col items-end gap-0.5">
                {delta && (
                  <span className="text-xs font-semibold text-gray-500">
                    {delta.value} vs prior year{delta.subLabel ? ` ${delta.subLabel}` : ''}
                  </span>
                )}
                {subValue && (
                  <span className="text-xs text-gray-400">{subValue}</span>
                )}
                {nationalDelta && (
                  <span className={`text-xs font-semibold ${nationalDeltaColor(nationalDelta.pct)}`}>
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
      </Card.Content>
    </Card>
  )
}
