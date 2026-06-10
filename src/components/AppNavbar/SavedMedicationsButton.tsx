import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import MedicationRow from '../MedicationList/MedicationRow'
import type { Drug, UserMedication } from '../../types'
import { TEXT_MUTED } from '../../theme'

export interface SavedMeds {
  medications: UserMedication[]
  error: boolean
  onRemove: (atcCode: string) => void
}

interface Props {
  savedMeds: SavedMeds
  activeDrugAtcCode: string | null
  onSelect: (drug: Drug) => void
}

export default function SavedMedicationsButton({
  savedMeds,
  activeDrugAtcCode,
  onSelect
}: Props) {
  const { medications, error, onRemove } = savedMeds
  const [open, setOpen] = useState(false)

  function handleSelect(drug: Drug) {
    onSelect(drug)
    setOpen(false)
  }

  function renderMedications() {
    if (error) {
      return (
        <li className={`px-3 py-6 text-center text-xs ${TEXT_MUTED}`}>
          Couldn't load your saved medications at this moment. Please try again
          later.
        </li>
      )
    }

    if (medications.length === 0) {
      return (
        <li className={`px-3 py-6 text-center text-xs ${TEXT_MUTED}`}>
          No saved medications yet. Search for a drug and save it from the
          filter chip.
        </li>
      )
    }

    return medications.map((med) => (
      <MedicationRow
        key={med.drugData.atcCode}
        medication={med}
        active={med.drugData.atcCode === activeDrugAtcCode}
        onSelect={handleSelect}
        onRemove={onRemove}
      />
    ))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Saved medications"
          title="Saved medications"
          className="relative"
        >
          <Bookmark className="size-4" />
          {medications.length > 0 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1 text-xs font-semibold tabular-nums"
            >
              {medications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-3 pt-3 pb-2">
          <h2
            className={`text-xs font-semibold uppercase tracking-wider ${TEXT_MUTED}`}
          >
            Saved medications
          </h2>
        </div>

        <ul className="max-h-80 overflow-y-auto px-2 pb-2 flex flex-col gap-1">
          {renderMedications()}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
