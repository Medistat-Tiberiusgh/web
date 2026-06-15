import type { Drug, UserMedication } from '../../types'
import { TEXT_HEADING, TEXT_DANGER, SURFACE_MUTED_HOVER } from '../../theme'

interface Props {
  medication: UserMedication
  active: boolean
  onSelect: (drug: Drug) => void
  onRemove: (atcCode: string) => void
}

function TrashIcon() {
  return (
    <svg
      className="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

export default function MedicationRow({
  medication,
  active,
  onSelect,
  onRemove
}: Props) {
  const { drugData } = medication

  return (
    <li
      onClick={() => onSelect(drugData)}
      className={`group px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        active ? 'bg-indigo-100' : SURFACE_MUTED_HOVER
      }`}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`font-semibold text-sm truncate flex-1 ${
            active ? 'text-indigo-800' : TEXT_HEADING
          }`}
        >
          {drugData.name}
        </span>
        {drugData.narcoticClass && (
          <span className={`text-xs font-bold shrink-0 ${TEXT_DANGER}`}>
            N{drugData.narcoticClass}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(drugData.atcCode)
          }}
          className="opacity-0 group-hover:opacity-100 shrink-0 text-gray-300 hover:text-red-500 transition-all ml-0.5"
          aria-label="Remove from list"
          title="Remove from list"
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  )
}
