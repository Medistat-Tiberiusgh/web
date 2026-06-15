import { cn } from '@/lib/utils'
import DrugInfoCard from './DrugInfoCard'
import type { Drug } from '../../types'

// The absolute layer lets the card clamp to its slot instead of growing to fit
// all the drug text, so DrugInfoCard keeps its "Read more" behaviour.
export default function DrugCard({
  drug,
  className
}: {
  drug: Drug
  className?: string
}) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0">
        <DrugInfoCard
          atcCode={drug.atcCode}
          drugName={drug.name}
          narcoticClass={drug.narcoticClass}
        />
      </div>
    </div>
  )
}
