import InsightCard, {
  DrugList,
  DrugRow,
  RatioPill,
  RateBar
} from './InsightCard'
import { rateDetail } from '../../lib/formatInsight'
import type { MostDispensedItem } from '../../hooks/useForYou'
import type { Drug } from '../../types'
import { TEXT_SECONDARY, SURFACE_BAR_FILL, SURFACE_MARKER } from '../../theme'

/** The group's most dispensed drugs; with a comparison group, its rate is marked on each bar. */
export default function MostDispensedCard({
  title,
  description,
  comparisonLabel,
  items,
  onOpenDrug
}: {
  title: string
  description: string
  comparisonLabel: string | null
  items: MostDispensedItem[]
  onOpenDrug: (drug: Drug) => void
}) {
  const scaleMax = Math.max(
    1,
    ...items.map((item) => Math.max(item.per1000, item.baselinePer1000 ?? 0))
  )

  return (
    <InsightCard title={title} description={description}>
      {comparisonLabel !== null && <Legend comparisonLabel={comparisonLabel} />}
      <DrugList isEmpty={items.length === 0}>
        {items.map((item) => (
          <DrugRow
            key={item.drug.atcCode}
            drug={item.drug}
            detail={rateDetail(item.per1000, item.baselinePer1000)}
            trailing={
              item.baselinePer1000 !== null && (
                <RatioPill ratio={item.per1000 / item.baselinePer1000} />
              )
            }
            onOpen={onOpenDrug}
          >
            <RateBar
              fraction={item.per1000 / scaleMax}
              markerFraction={
                item.baselinePer1000 === null
                  ? null
                  : item.baselinePer1000 / scaleMax
              }
            />
          </DrugRow>
        ))}
      </DrugList>
    </InsightCard>
  )
}

function Legend({ comparisonLabel }: { comparisonLabel: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-4 text-xs ${TEXT_SECONDARY}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <span className={`w-3.5 h-1.5 rounded-full ${SURFACE_BAR_FILL}`} />
        Your group
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className={`w-0.5 h-3 ${SURFACE_MARKER}`} />
        {comparisonLabel}
      </span>
    </div>
  )
}
