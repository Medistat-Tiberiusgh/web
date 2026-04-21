import { Skeleton } from '@heroui/react'
import type { Drug, UserMedication } from '../types'

interface Props {
  medications: UserMedication[]
  loading: boolean
  activeDrugAtcCode: string | null
  onSelect: (drug: Drug) => void
  onRemove: (atcCode: string) => void
}

export default function MedicationList({
  medications,
  loading,
  activeDrugAtcCode,
  onSelect,
  onRemove,
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
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="p-3 flex flex-col gap-2">
                <Skeleton className="h-3 w-1/3 rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </li>
            ))
          : medications.map((med) => {
              const active = med.drugData.atcCode === activeDrugAtcCode
              return (
                <li
                  key={med.drugData.atcCode}
                  onClick={() => onSelect(med.drugData)}
                  className={`group px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    active ? 'bg-indigo-100' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`font-semibold text-sm truncate flex-1 ${active ? 'text-indigo-800' : 'text-gray-900'}`}
                    >
                      {med.drugData.name}
                    </span>
                    {med.drugData.narcoticClass && (
                      <span className="text-xs font-bold text-red-600 shrink-0">
                        N{med.drugData.narcoticClass}
                      </span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemove(med.drugData.atcCode) }}
                      className="opacity-0 group-hover:opacity-100 shrink-0 text-gray-300 hover:text-red-500 transition-all ml-0.5"
                      aria-label="Remove from list"
                      title="Remove from list"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              )
            })}
      </ul>
    </div>
  )
}
