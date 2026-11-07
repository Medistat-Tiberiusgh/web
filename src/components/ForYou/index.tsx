import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GroupChips from './GroupChips'
import ForYouContent from './ForYouContent'
import MedicationDialog from './MedicationDialog'
import {
  comparisonTitle,
  describeAudience,
  describeComparison
} from '../../lib/describeGroup'
import {
  hasDemographics,
  useProfile,
  type Demographics
} from '../../context/ProfileContext'
import { useForYou } from '../../hooks/useForYou'
import type { Drug, Region } from '../../types'
import {
  TEXT_HEADING,
  TEXT_SECONDARY,
  SURFACE_HIGHLIGHT,
  BORDER_HIGHLIGHT
} from '../../theme'

type Props = {
  regions: Region[]
  onClose: () => void
}

export default function ForYou({ regions, onClose }: Props) {
  const profile = useProfile()
  // Starts as the saved profile; the chips change it without saving anything.
  const [group, setGroup] = useState<Demographics>({
    regionId: profile.regionId,
    genderId: profile.genderId,
    ageGroupId: profile.ageGroupId
  })
  const { forYou, error } = useForYou(group)
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)

  function regionNameFor(regionId: number | null) {
    return regions.find((region) => region.id === regionId)?.regionName ?? null
  }

  const regionName = regionNameFor(group.regionId)
  const comparisonLabel = forYou
    ? describeComparison(
        forYou.comparedWith,
        regionNameFor(forYou.comparedWith.regionId)
      )
    : ''

  return (
    <div className="flex flex-col gap-2 animate-in fade-in-0 duration-300">
      <Button
        variant="ghost"
        size="sm"
        className="self-start"
        onClick={onClose}
      >
        <X /> Close
      </Button>

      <section
        className={`flex flex-col gap-5 rounded-2xl border p-6 ${SURFACE_HIGHLIGHT} ${BORDER_HIGHLIGHT}`}
      >
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className={`text-3xl font-bold tracking-tight ${TEXT_HEADING}`}>
              For you
            </h1>
            <GroupChips group={group} regions={regions} onChange={setGroup} />
          </div>
          {forYou && hasDemographics(group) && (
            <p className={`text-sm ${TEXT_SECONDARY}`}>
              Compared with {comparisonLabel} · {forYou.latestYear}
            </p>
          )}
        </header>

        <ForYouContent
          forYou={forYou}
          error={error}
          group={group}
          title={comparisonTitle(group, regionName)}
          audience={describeAudience(group, regionName)}
          comparisonLabel={comparisonLabel}
          onOpenDrug={setSelectedDrug}
        />

        <p className={`text-xs ${TEXT_SECONDARY}`}>
          Click any medication to read what it is used for.
        </p>
      </section>

      {selectedDrug && (
        <MedicationDialog
          drug={selectedDrug}
          onClose={() => setSelectedDrug(null)}
        />
      )}
    </div>
  )
}
