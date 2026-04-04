import { SearchField, Button, Skeleton, Chip } from '@heroui/react'
import type { Medication } from '../types'

interface Props {
  medications: Medication[]
  loading: boolean
  selectedIndex: number | null
  onSelect: (index: number) => void
}

export default function MedicationList({
  medications,
  loading,
  selectedIndex,
  onSelect
}: Props) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 flex flex-col gap-3 border-b border-gray-200 shrink-0">
        <SearchField>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search drug or ATC..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="px-4 pt-4 pb-2 shrink-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            My Medications
          </h2>
        </div>

        <ul className="flex-1 overflow-y-auto px-3 pb-3 flex flex-col gap-1">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="p-3 flex flex-col gap-2">
                  <Skeleton className="h-3 w-1/3 rounded" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </li>
              ))
            : medications.map((med, i) => {
                const active = i === selectedIndex
                return (
                  <li
                    key={med.drugData.atcCode}
                    onClick={() => onSelect(i)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      active ? 'bg-blue-600' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-semibold text-sm ${active ? 'text-white' : 'text-gray-900'}`}
                      >
                        {med.drugData.name}
                      </span>
                      {med.drugData.narcoticClass && (
                        <Chip size="sm" variant="soft" color="warning">
                          Class {med.drugData.narcoticClass}
                        </Chip>
                      )}
                    </div>
                  </li>
                )
              })}
        </ul>

        <div className="p-3 border-t border-gray-100 shrink-0">
          <Button variant="outline" className="w-full text-sm">
            + Save current drug to list
          </Button>
        </div>
      </div>
    </div>
  )
}
