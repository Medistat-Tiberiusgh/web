import ComparisonCard from './ComparisonCard'
import ChangesCard from './ChangesCard'
import MostDispensedCard from './MostDispensedCard'
import { capitalize } from '../../lib/describeGroup'
import {
  hasDemographics,
  type Demographics
} from '../../context/ProfileContext'
import type { ForYouData } from '../../hooks/useForYou'
import type { Drug } from '../../types'
import { TEXT_SECONDARY, TEXT_MUTED } from '../../theme'

/** The three cards, or a message while there is nothing to show yet. */
export default function ForYouContent({
  forYou,
  error,
  group,
  title,
  audience,
  comparisonLabel,
  onOpenDrug
}: {
  forYou: ForYouData | null
  error: string | null
  group: Demographics
  title: string
  audience: string
  comparisonLabel: string
  onOpenDrug: (drug: Drug) => void
}) {
  if (!hasDemographics(group)) {
    return (
      <p className={`text-sm ${TEXT_SECONDARY}`}>
        Pick a region, gender or age group to see highlights.
      </p>
    )
  }
  if (error) {
    return (
      <p className={`text-sm ${TEXT_SECONDARY}`}>
        Couldn’t load your highlights.
      </p>
    )
  }
  if (!forYou) {
    return <p className={`text-sm ${TEXT_MUTED}`}>Loading your highlights…</p>
  }

  return (
    <div className="grid gap-4 items-start lg:grid-cols-3">
      <ComparisonCard
        title={title}
        description="Per 1,000 inhabitants · your group vs the national average"
        moreCommon={forYou.moreCommon}
        lessCommon={forYou.lessCommon}
        onOpenDrug={onOpenDrug}
      />
      <ChangesCard
        demographics={group}
        audience={audience}
        latestYear={forYou.latestYear}
        onOpenDrug={onOpenDrug}
      />
      <MostDispensedCard
        title={`Most dispensed ${audience}`}
        description="Highest rate per 1,000 inhabitants in this group"
        comparisonLabel={capitalize(comparisonLabel)}
        items={forYou.mostDispensed}
        onOpenDrug={onOpenDrug}
      />
    </div>
  )
}
