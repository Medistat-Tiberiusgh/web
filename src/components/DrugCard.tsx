import { cn } from '@/lib/utils'
import DrugInfoCard from './DrugInfoCard'
import type { Db } from '../hooks/dashboard/useDashboard'

// The absolute layer lets the card clamp to its slot instead of growing to fit
// all the drug text, so DrugInfoCard keeps its "Read more" behaviour.
export default function DrugCard({
  db,
  className
}: {
  db: Db
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0">
        <DrugInfoCard
          atcCode={db.activeDrug!.atcCode}
          drugName={db.activeDrug!.name}
          narcoticClass={db.activeDrug!.narcoticClass}
        />
      </div>
    </div>
  )
}
