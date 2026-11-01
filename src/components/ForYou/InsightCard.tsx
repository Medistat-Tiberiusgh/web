import type { ReactNode } from 'react'
import { ChartCard } from '../charts/ChartCard'
import type { Drug } from '../../types'
import {
  COLOR_BRAND,
  TEXT_HEADING,
  TEXT_BODY,
  TEXT_MUTED,
  TEXT_LINK,
  BORDER_SUBTLE,
  SURFACE_MUTED_HOVER,
  SURFACE_BAR_TRACK,
  SURFACE_BAR_FILL
} from '../../theme'

export default function InsightCard({
  title,
  description,
  isEmpty,
  children
}: {
  title: string
  description: string
  isEmpty: boolean
  children: ReactNode
}) {
  return (
    <ChartCard
      title={title}
      description={description}
      contentClassName="px-4 pt-3 pb-3"
    >
      {isEmpty ? (
        <p className={`text-sm ${TEXT_MUTED}`}>
          Not enough data for this group yet.
        </p>
      ) : (
        <ul className="flex flex-col">{children}</ul>
      )}
    </ChartCard>
  )
}

export function BarRow({
  drug,
  label,
  fraction,
  onOpen
}: {
  drug: Drug
  label: string
  fraction: number
  onOpen: (drug: Drug) => void
}) {
  return (
    <li className={`border-t ${BORDER_SUBTLE}`}>
      <button
        type="button"
        onClick={() => onOpen(drug)}
        className={`w-full flex flex-col gap-1.5 py-2 px-1 text-left rounded-md ${SURFACE_MUTED_HOVER}`}
      >
        <span className="flex items-start justify-between gap-3">
          <DrugName drug={drug} />
          <span className={`text-sm font-semibold shrink-0 ${TEXT_BODY}`}>
            {label}
          </span>
        </span>
        <span className={`h-1.5 rounded-full ${SURFACE_BAR_TRACK}`}>
          <span
            className={`block h-1.5 rounded-full ${SURFACE_BAR_FILL}`}
            style={{ width: `${Math.max(fraction, 0.04) * 100}%` }}
          />
        </span>
      </button>
    </li>
  )
}

export function TrendRow({
  drug,
  label,
  values,
  onOpen
}: {
  drug: Drug
  label: string
  values: number[]
  onOpen: (drug: Drug) => void
}) {
  return (
    <li className={`border-t ${BORDER_SUBTLE}`}>
      <button
        type="button"
        onClick={() => onOpen(drug)}
        className={`w-full flex items-center justify-between gap-3 py-2 px-1 text-left rounded-md ${SURFACE_MUTED_HOVER}`}
      >
        <DrugName drug={drug} />
        <span className="flex items-center gap-2.5 shrink-0">
          <Sparkline values={values} />
          <span className={`text-sm font-semibold ${TEXT_LINK}`}>{label}</span>
        </span>
      </button>
    </li>
  )
}

function DrugName({ drug }: { drug: Drug }) {
  return (
    <span className="flex flex-col min-w-0">
      <span className={`text-sm font-semibold truncate ${TEXT_HEADING}`}>
        {drug.name}
      </span>
      <span className={`text-xs ${TEXT_MUTED}`}>{drug.atcCode}</span>
    </span>
  )
}

function Sparkline({ values }: { values: number[] }) {
  const width = 72
  const height = 24
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      <path
        d={sparklinePath(values, width, height)}
        fill="none"
        stroke={COLOR_BRAND}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function sparklinePath(values: number[], width: number, height: number) {
  const padding = 2
  const lowest = Math.min(...values)
  const range = Math.max(...values) - lowest || 1
  const step = (width - padding * 2) / Math.max(values.length - 1, 1)

  return values
    .map((value, index) => {
      const x = padding + index * step
      const y =
        height - padding - ((value - lowest) / range) * (height - padding * 2)
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}
