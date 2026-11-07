import { useState } from 'react'
import InsightCard, {
  DirectionSection,
  DrugRow,
  Pill,
  Sparkline
} from './InsightCard'
import { changeDetail, growthLabel } from '../../lib/formatInsight'
import { useForYouChanges, type GrowthItem } from '../../hooks/useForYou'
import type { Demographics } from '../../context/ProfileContext'
import type { Drug } from '../../types'
import {
  COLOR_BRAND,
  COLOR_DECLINE,
  TEXT_MUTED,
  SURFACE_SEGMENTED,
  SEGMENT_ACTIVE,
  SEGMENT_IDLE
} from '../../theme'

const INTERVALS = [3, 5, 10]
const DEFAULT_INTERVAL = 5

/** The biggest rises and declines over a user-chosen number of years. */
export default function ChangesCard({
  demographics,
  audience,
  latestYear,
  onOpenDrug
}: {
  demographics: Demographics
  audience: string
  latestYear: number
  onOpenDrug: (drug: Drug) => void
}) {
  const [years, setYears] = useState(DEFAULT_INTERVAL)
  const { changes, error } = useForYouChanges(demographics, years)
  const startYear = changes?.startYear ?? latestYear - years

  return (
    <InsightCard
      title={`Changing since ${startYear}`}
      description={`Per 1,000 inhabitants ${audience}, ${startYear} → ${latestYear}`}
      action={<IntervalSwitch selected={years} onSelect={setYears} />}
    >
      <ChangesContent
        rising={changes?.rising ?? null}
        declining={changes?.declining ?? null}
        error={error}
        onOpenDrug={onOpenDrug}
      />
    </InsightCard>
  )
}

function ChangesContent({
  rising,
  declining,
  error,
  onOpenDrug
}: {
  rising: GrowthItem[] | null
  declining: GrowthItem[] | null
  error: string | null
  onOpenDrug: (drug: Drug) => void
}) {
  if (error) {
    return <p className={`text-sm ${TEXT_MUTED}`}>Couldn’t load changes.</p>
  }
  if (rising === null || declining === null) {
    return <p className={`text-sm ${TEXT_MUTED}`}>Loading changes…</p>
  }

  return (
    <>
      <DirectionSection
        direction="up"
        title="Rising"
        isEmpty={rising.length === 0}
      >
        {rising.map((item) => (
          <GrowthRow
            key={item.drug.atcCode}
            item={item}
            direction="up"
            onOpen={onOpenDrug}
          />
        ))}
      </DirectionSection>

      <DirectionSection
        direction="down"
        title="Declining"
        isEmpty={declining.length === 0}
      >
        {declining.map((item) => (
          <GrowthRow
            key={item.drug.atcCode}
            item={item}
            direction="down"
            onOpen={onOpenDrug}
          />
        ))}
      </DirectionSection>
    </>
  )
}

function IntervalSwitch({
  selected,
  onSelect
}: {
  selected: number
  onSelect: (years: number) => void
}) {
  return (
    <div
      role="group"
      aria-label="Time interval"
      className={`inline-flex shrink-0 p-0.5 rounded-lg ${SURFACE_SEGMENTED}`}
    >
      {INTERVALS.map((years) => (
        <button
          key={years}
          type="button"
          aria-pressed={years === selected}
          onClick={() => onSelect(years)}
          className={`h-6 px-2.5 rounded-md text-xs font-semibold transition-colors ${
            years === selected ? `shadow-sm ${SEGMENT_ACTIVE}` : SEGMENT_IDLE
          }`}
        >
          {years} y
        </button>
      ))}
    </div>
  )
}

function GrowthRow({
  item,
  direction,
  onOpen
}: {
  item: GrowthItem
  direction: 'up' | 'down'
  onOpen: (drug: Drug) => void
}) {
  const rates = item.trend.map((point) => point.per1000)
  const startRate = rates[0] ?? 0
  const latestRate = rates[rates.length - 1] ?? 0

  return (
    <DrugRow
      drug={item.drug}
      detail={changeDetail(startRate, latestRate)}
      trailing={
        <>
          <Sparkline
            values={rates}
            color={direction === 'up' ? COLOR_BRAND : COLOR_DECLINE}
          />
          <Pill tone={direction}>{growthLabel(item.growth)}</Pill>
        </>
      }
      onOpen={onOpen}
    />
  )
}
