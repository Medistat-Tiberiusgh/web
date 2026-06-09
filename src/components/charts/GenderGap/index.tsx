import { Skeleton } from '@/components/ui/skeleton'
import GenderGap from './GenderGap'
import ChartFilterLabel from '../../ChartFilterLabel'
import { ChartCard } from '../ChartCard'
import type { Db } from '../../../hooks/dashboard/useDashboard'

export default function GenderGapCard({
  db,
  className
}: {
  db: Db
  className?: string
}) {
  return (
    <ChartCard
      className={className}
      contentClassName="min-h-80"
      title={
        <>
          Gender Gap
          <ChartFilterLabel regionName={db.regionName} ageBand={db.activeAgeBand} />
        </>
      }
      description="per 1,000 inhabitants · all years"
    >
      {db.loading ? (
        <Skeleton className="h-48 m-4 rounded" />
      ) : (
        <GenderGap
          nationalData={db.natGenderSplit}
          regionalData={db.regGenderSplit}
        />
      )}
    </ChartCard>
  )
}
