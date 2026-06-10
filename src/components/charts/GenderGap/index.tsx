import { Skeleton } from '@/components/ui/skeleton'
import GenderGap from './GenderGap'
import ChartFilterLabel from '../../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import type { GenderSplitPoint } from '../../../types'
import type { AgeBand } from '../../../types'

export default function GenderGapCard({
  loading,
  regionName,
  ageBand,
  nationalData,
  regionalData,
  className
}: {
  loading: boolean
  regionName: string | null
  ageBand: AgeBand | null
  nationalData: GenderSplitPoint[]
  regionalData?: GenderSplitPoint[]
  className?: string
}) {
  return (
    <ChartCard
      className={className}
      contentClassName="min-h-80"
      title={
        <>
          Gender Gap
          <ChartFilterLabel regionName={regionName} ageBand={ageBand} />
        </>
      }
      description="per 1,000 inhabitants · all years"
    >
      {loading ? (
        <Skeleton className="h-48 m-4 rounded" />
      ) : (
        <GenderGap nationalData={nationalData} regionalData={regionalData} />
      )}
    </ChartCard>
  )
}
