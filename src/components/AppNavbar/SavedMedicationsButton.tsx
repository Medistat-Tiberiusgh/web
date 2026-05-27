import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import MedicationRow from '../MedicationList/MedicationRow'
import type { Drug, UserMedication } from '../../types'

interface Props {
  medications: UserMedication[]
  loading: boolean
  activeDrugAtcCode: string | null
  onSelect: (drug: Drug) => void
  onRemove: (atcCode: string) => void
}

const SKELETON_COUNT = 3

export default function SavedMedicationsButton({
  medications,
  loading,
  activeDrugAtcCode,
  onSelect,
  onRemove
}: Props) {
  const [open, setOpen] = useState(false)

  function handleSelect(drug: Drug) {
    onSelect(drug)
    setOpen(false)
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
              className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1 text-[10px] font-semibold tabular-nums"
            >
              {medications.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-3 pt-3 pb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Saved medications
          </h2>
        </div>

        <ul className="max-h-80 overflow-y-auto px-2 pb-2 flex flex-col gap-1">
          {loading ? (
            Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <li key={i} className="p-3 flex flex-col gap-2">
                <Skeleton className="h-3 w-1/3 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </li>
            ))
          ) : medications.length === 0 ? (
            <li className="px-3 py-6 text-center text-xs text-gray-400">
              No saved medications yet. Search for a drug and save it from the
              filter chip.
            </li>
          ) : (
            medications.map((med) => (
              <MedicationRow
                key={med.drugData.atcCode}
                medication={med}
                active={med.drugData.atcCode === activeDrugAtcCode}
                onSelect={handleSelect}
                onRemove={onRemove}
              />
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
