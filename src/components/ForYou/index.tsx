import { useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DrugInfoDialog from '../drug/DrugInfoDialog'
import ComparisonCard from './ComparisonCard'
import ChangesCard from './ChangesCard'
import MostDispensedCard from './MostDispensedCard'
import {
  ageBandName,
  capitalize,
  comparisonTitle,
  describeAudience,
  describeComparison,
  genderName
} from '../../lib/describeGroup'
import { useProfile, type Demographics } from '../../context/ProfileContext'
import { useForYou, type ForYouData } from '../../hooks/useForYou'
import { useDrugInfo } from '../../hooks/useDrugInfo'
import type { Drug, Region } from '../../types'
import {
  TEXT_HEADING,
  TEXT_SECONDARY,
  TEXT_MUTED,
  SURFACE_HIGHLIGHT,
  BORDER_HIGHLIGHT,
  CHIP_REGION,
  CHIP_GENDER,
  CHIP_AGE
} from '../../theme'

type Props = {
  regions: Region[]
  onClose: () => void
}

export default function ForYou({ regions, onClose }: Props) {
  const profile = useProfile()
  const { forYou, error } = useForYou(profile)
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null)

  function regionNameFor(regionId: number | null) {
    return regions.find((region) => region.id === regionId)?.regionName ?? null
  }

  const regionName = regionNameFor(profile.regionId)
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
            <ProfileChips profile={profile} regionName={regionName} />
          </div>
          {forYou && (
            <p className={`text-sm ${TEXT_SECONDARY}`}>
              Compared with {comparisonLabel} · {forYou.latestYear}
            </p>
          )}
        </header>

        <ForYouContent
          forYou={forYou}
          error={error}
          demographics={profile}
          title={comparisonTitle(profile, regionName)}
          audience={describeAudience(profile, regionName)}
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

function MedicationDialog({
  drug,
  onClose
}: {
  drug: Drug
  onClose: () => void
}) {
  const { data, loading } = useDrugInfo(drug.atcCode)
  return (
    <DrugInfoDialog
      atcCode={drug.atcCode}
      drugName={drug.name}
      narcoticClass={drug.narcoticClass}
      info={data}
      loading={loading}
      open
      onOpenChange={(open) => !open && onClose()}
    />
  )
}

function ForYouContent({
  forYou,
  error,
  demographics,
  title,
  audience,
  comparisonLabel,
  onOpenDrug
}: {
  forYou: ForYouData | null
  error: string | null
  demographics: Demographics
  title: string
  audience: string
  comparisonLabel: string
  onOpenDrug: (drug: Drug) => void
}) {
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
        description="Patients per 1,000 · your group vs the national average"
        moreCommon={forYou.moreCommon}
        lessCommon={forYou.lessCommon}
        onOpenDrug={onOpenDrug}
      />
      <ChangesCard
        demographics={demographics}
        audience={audience}
        latestYear={forYou.latestYear}
        onOpenDrug={onOpenDrug}
      />
      <MostDispensedCard
        title={`Most dispensed ${audience}`}
        description="Highest rate per 1,000 people in this group"
        comparisonLabel={capitalize(comparisonLabel)}
        items={forYou.mostDispensed}
        onOpenDrug={onOpenDrug}
      />
    </div>
  )
}

function ProfileChips({
  profile,
  regionName
}: {
  profile: Demographics
  regionName: string | null
}) {
  const gender = genderName(profile.genderId)
  const age = ageBandName(profile.ageGroupId)

  return (
    <div
      className={`flex flex-wrap items-center gap-2 text-sm ${TEXT_SECONDARY}`}
    >
      <span>Based on your profile:</span>
      {regionName && <Chip className={CHIP_REGION}>{regionName}</Chip>}
      {gender && <Chip className={CHIP_GENDER}>{capitalize(gender)}</Chip>}
      {age && <Chip className={CHIP_AGE}>{age}</Chip>}
    </div>
  )
}

function Chip({
  className,
  children
}: {
  className: string
  children: ReactNode
}) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  )
}
