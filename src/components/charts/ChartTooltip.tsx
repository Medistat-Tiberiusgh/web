import type { ReactNode } from 'react'
import { SURFACE_CARD, BORDER_DEFAULT } from '../../theme'

interface Props {
  x: number
  y: number
  width?: number
  children: ReactNode
}

export default function ChartTooltip({ x, y, width = 224, children }: Props) {
  const left = x + 14 + width > window.innerWidth ? x - width - 8 : x + 14

  return (
    <div
      className={`fixed z-50 pointer-events-none ${SURFACE_CARD} border ${BORDER_DEFAULT} rounded-xl shadow-lg overflow-hidden text-xs`}
      style={{ left, top: y - 10, width }}
    >
      {children}
    </div>
  )
}
