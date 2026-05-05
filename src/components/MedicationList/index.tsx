import { Skeleton } from '@heroui/react'
import type { Drug, UserMedication } from '../../types'
import MedicationRow from './MedicationRow'

interface Props {
  medications: UserMedication[]
  loading: boolean
  activeDrugAtcCode: string | null
  onSelect: (drug: Drug) => void
  onRemove: (atcCode: string) => void
}

const SKELETON_COUNT = 4

export default function MedicationList({
  medications,
  loading,
  activeDrugAtcCode,
  onSelect,
  onRemove
}: Props) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-4 pb-2 shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Saved medications
        </h2>
      </div>

      <ul className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1">
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <li key={i} className="p-3 flex flex-col gap-2">
                <Skeleton className="h-3 w-1/3 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </li>
            ))
          : medications.map((med) => (
              <MedicationRow
                key={med.drugData.atcCode}
                medication={med}
                active={med.drugData.atcCode === activeDrugAtcCode}
                onSelect={onSelect}
                onRemove={onRemove}
              />
            ))}
      </ul>
    </div>
  )
}
