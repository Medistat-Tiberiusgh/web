import InsightCard, {
  DirectionSection,
  DrugRow,
  RatioPill
} from './InsightCard'
import { rateDetail } from '../../lib/formatInsight'
import type { ComparisonItem } from '../../hooks/useForYou'
import type { Drug } from '../../types'

/** Your group vs the national average, in both directions. */
export default function ComparisonCard({
  title,
  description,
  moreCommon,
  lessCommon,
  onOpenDrug
}: {
  title: string
  description: string
  moreCommon: ComparisonItem[]
  lessCommon: ComparisonItem[]
  onOpenDrug: (drug: Drug) => void
}) {
  return (
    <InsightCard title={title} description={description}>
      <DirectionSection
        direction="up"
        title="More than the national average"
        isEmpty={moreCommon.length === 0}
      >
        {moreCommon.map((item) => (
          <ComparisonRow
            key={item.drug.atcCode}
            item={item}
            onOpen={onOpenDrug}
          />
        ))}
      </DirectionSection>

      <DirectionSection
        direction="down"
        title="Less than the national average"
        isEmpty={lessCommon.length === 0}
      >
        {lessCommon.map((item) => (
          <ComparisonRow
            key={item.drug.atcCode}
            item={item}
            onOpen={onOpenDrug}
          />
        ))}
      </DirectionSection>
    </InsightCard>
  )
}

function ComparisonRow({
  item,
  onOpen
}: {
  item: ComparisonItem
  onOpen: (drug: Drug) => void
}) {
  return (
    <DrugRow
      drug={item.drug}
      detail={rateDetail(item.per1000, item.baselinePer1000)}
      trailing={<RatioPill ratio={item.ratio} />}
      onOpen={onOpen}
    />
  )
}
