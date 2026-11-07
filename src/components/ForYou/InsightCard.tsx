import type { ReactNode } from 'react'
import { ChartCard } from '../charts/ChartCard'
import { ratioLabel, ratioTone, type Tone } from '../../lib/formatInsight'
import type { Drug } from '../../types'
import {
  TEXT_HEADING,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER_SUBTLE,
  SURFACE_MUTED_HOVER,
  SURFACE_BAR_TRACK,
  SURFACE_BAR_FILL,
  SURFACE_MARKER,
  SURFACE_UP,
  BORDER_UP,
  TEXT_UP,
  PILL_UP,
  SURFACE_DOWN,
  BORDER_DOWN,
  TEXT_DOWN,
  PILL_DOWN,
  PILL_EVEN
} from '../../theme'

type Direction = 'up' | 'down'

export default function InsightCard({
  title,
  description,
  action,
  children
}: {
  title: string
  description: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <ChartCard
      title={title}
      description={description}
      legend={action}
      contentClassName="px-4 pt-3 pb-4 flex flex-col gap-3"
    >
      {children}
    </ChartCard>
  )
}

/** A tinted "up" or "down" block holding one list, e.g. "↑ Rising". */
export function DirectionSection({
  direction,
  title,
  isEmpty,
  children
}: {
  direction: Direction
  title: string
  isEmpty: boolean
  children: ReactNode
}) {
  const colors =
    direction === 'up'
      ? `${SURFACE_UP} ${BORDER_UP}`
      : `${SURFACE_DOWN} ${BORDER_DOWN}`
  const headingColor = direction === 'up' ? TEXT_UP : TEXT_DOWN
  const arrow = direction === 'up' ? '↑' : '↓'

  return (
    <section className={`rounded-lg border px-3 pt-2.5 pb-1 ${colors}`}>
      <h3
        className={`text-xs font-bold uppercase tracking-wider ${headingColor}`}
      >
        {arrow} {title}
      </h3>
      <DrugList isEmpty={isEmpty}>{children}</DrugList>
    </section>
  )
}

export function DrugList({
  isEmpty,
  children
}: {
  isEmpty: boolean
  children: ReactNode
}) {
  if (isEmpty) {
    return (
      <p className={`py-2 text-sm ${TEXT_MUTED}`}>
        Not enough data for this group yet.
      </p>
    )
  }
  return <ul className="flex flex-col">{children}</ul>
}

/** One clickable drug: name, "ATC · detail" underneath, and an optional value on the right. */
export function DrugRow({
  drug,
  detail,
  trailing,
  onOpen,
  children
}: {
  drug: Drug
  detail: string
  trailing: ReactNode
  onOpen: (drug: Drug) => void
  children?: ReactNode
}) {
  return (
    <li className={`border-t first:border-t-0 ${BORDER_SUBTLE}`}>
      <button
        type="button"
        onClick={() => onOpen(drug)}
        className={`w-full flex flex-col gap-1.5 py-2 px-1 text-left rounded-md ${SURFACE_MUTED_HOVER}`}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="flex flex-col min-w-0">
            <span className={`text-sm font-semibold truncate ${TEXT_HEADING}`}>
              {drug.name}
            </span>
            <span className={`text-xs ${TEXT_SECONDARY}`}>
              {drug.atcCode} · {detail}
            </span>
          </span>
          <span className="flex items-center gap-2.5 shrink-0">{trailing}</span>
        </span>
        {children}
      </button>
    </li>
  )
}

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  const colors = { up: PILL_UP, down: PILL_DOWN, even: PILL_EVEN }[tone]
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${colors}`}>
      {children}
    </span>
  )
}

/** "↑ 3.0×" in teal, "↓ 0.18×" in amber, "≈ 0.96×" in grey */
export function RatioPill({ ratio }: { ratio: number }) {
  return <Pill tone={ratioTone(ratio)}>{ratioLabel(ratio)}</Pill>
}

/** A rate bar with a thin marker for the comparison group's rate. */
export function RateBar({
  fraction,
  markerFraction
}: {
  fraction: number
  markerFraction: number | null
}) {
  return (
    <span className={`relative block h-1.5 rounded-full ${SURFACE_BAR_TRACK}`}>
      <span
        className={`block h-1.5 rounded-full ${SURFACE_BAR_FILL}`}
        style={{ width: `${Math.max(fraction, 0.04) * 100}%` }}
      />
      {markerFraction !== null && (
        <span
          className={`absolute -top-0.75 h-3 w-0.5 ${SURFACE_MARKER}`}
          style={{ left: `${markerFraction * 100}%` }}
        />
      )}
    </span>
  )
}

export function Sparkline({
  values,
  color
}: {
  values: number[]
  color: string
}) {
  const width = 64
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
        stroke={color}
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
