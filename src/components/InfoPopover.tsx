import type { ReactNode } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  TEXT_SECONDARY,
  TEXT_MUTED,
  TEXT_MUTED_HOVER,
  BORDER_CONTROL,
  BORDER_CONTROL_HOVER
} from '@/theme'

const INFO_CIRCLE = `w-5 h-5 shrink-0 rounded-full border ${BORDER_CONTROL} ${TEXT_MUTED} text-xs font-bold leading-none flex items-center justify-center`

export function InfoIcon() {
  return (
    <span aria-hidden="true" className={INFO_CIRCLE}>
      i
    </span>
  )
}

export default function InfoPopover({ children }: { children: ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger asChild aria-label="More information">
        <button
          className={`${INFO_CIRCLE} ${BORDER_CONTROL_HOVER} ${TEXT_MUTED_HOVER} transition-colors`}
        >
          i
        </button>
      </PopoverTrigger>
      <PopoverContent className="max-w-64">
        <div className={`text-xs leading-relaxed ${TEXT_SECONDARY}`}>
          {children}
        </div>
      </PopoverContent>
    </Popover>
  )
}
