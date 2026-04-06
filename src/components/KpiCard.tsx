import { useState, useEffect, useRef } from 'react'
import { Card } from '@heroui/react'

interface Props {
  label: string
  value: string
  subValue?: string
  info: string
}

export default function KpiCard({ label, value, subValue, info }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <Card>
      <Card.Content className="p-5">
        <div ref={ref} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">
              {label}
            </span>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="More information"
              className="w-5 h-5 rounded-full border border-gray-300 text-gray-400 text-[11px] font-bold leading-none flex items-center justify-center hover:border-gray-500 hover:text-gray-600 transition-colors"
            >
              i
            </button>
          </div>

          <span className="text-3xl font-bold text-gray-900 tracking-tight">
            {value}
          </span>

          {subValue && !open && (
            <span className="text-xs text-gray-400">{subValue}</span>
          )}

          {open && (
            <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-2 mt-1">
              {info}
            </p>
          )}
        </div>
      </Card.Content>
    </Card>
  )
}
