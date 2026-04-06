import { Card, Popover } from '@heroui/react'

interface Props {
  label: string
  value: string
  subValue?: string
  delta?: { value: string; positive: boolean }
  info: React.ReactNode
}

export default function KpiCard({
  label,
  value,
  subValue,
  delta,
  info
}: Props) {
  return (
    <Card>
      <Card.Content className="p-5">
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

          <span className="text-3xl font-bold text-gray-900 tracking-tight">
            {value}
          </span>

          {(delta || subValue) && (
            <div className="flex items-center gap-2 mt-0.5">
              {delta && (
                <span
                  className={`text-xs font-semibold ${delta.positive ? 'text-green-600' : 'text-red-500'}`}
                >
                  {delta.value} vs prior year
                </span>
              )}
              {subValue && (
                <span className="text-xs text-gray-400">{subValue}</span>
              )}
            </div>
          )}
        </div>
      </Card.Content>
    </Card>
  )
}
