import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  TEXT_SECONDARY,
  TEXT_LINK,
  BORDER_CONTROL,
  SURFACE_MUTED_HOVER
} from '../../theme'

export interface ChipOption {
  id: number
  label: string
}

/** One clickable chip with a dropdown: "Any {dimension}" plus the given options. */
export default function GroupChip({
  dimension,
  colorClass,
  selectedId,
  options,
  onSelect
}: {
  dimension: string
  colorClass: string
  selectedId: number | null
  options: ChipOption[]
  onSelect: (id: number | null) => void
}) {
  const [open, setOpen] = useState(false)
  const selectedLabel =
    options.find((option) => option.id === selectedId)?.label ?? null

  function select(id: number | null) {
    onSelect(id)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Change ${dimension}`}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            selectedLabel === null
              ? `border border-dashed ${BORDER_CONTROL} ${TEXT_SECONDARY}`
              : colorClass
          }`}
        >
          {selectedLabel ?? `+ ${dimension}`}
          <ChevronDown className="size-3" aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-56 p-1 max-h-72 overflow-y-auto"
      >
        <OptionButton
          label={`Any ${dimension}`}
          selected={selectedId === null}
          onClick={() => select(null)}
        />
        {options.map((option) => (
          <OptionButton
            key={option.id}
            label={option.label}
            selected={option.id === selectedId}
            onClick={() => select(option.id)}
          />
        ))}
      </PopoverContent>
    </Popover>
  )
}

function OptionButton({
  label,
  selected,
  onClick
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-2.5 py-1.5 rounded-md text-sm text-left ${SURFACE_MUTED_HOVER}`}
    >
      {label}
      {selected && (
        <Check className={`size-4 ${TEXT_LINK}`} aria-hidden="true" />
      )}
    </button>
  )
}
