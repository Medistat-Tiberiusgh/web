import { useState, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DrugInfoDialog from '../drug/DrugInfoDialog'
import InsightCard, { BarRow, TrendRow } from './InsightCard'
import {
  ageBandName,
  describeAudience,
  describeComparison,
  genderName
} from './describeGroup'
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
              Compared with{' '}
              {describeComparison(
                forYou.comparedWith,
                regionNameFor(forYou.comparedWith.regionId)
              )}{' '}
              · {forYou.latestYear}
            </p>
          )}
        </header>

        <ForYouContent
          forYou={forYou}
          error={error}
          audience={describeAudience(profile, regionName)}
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
  audience,
  onOpenDrug
}: {
  forYou: ForYouData | null
  error: string | null
  audience: string
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

  const highestRatio = forYou.standsOut[0]?.ratio ?? 1
  const highestRate = forYou.mostDispensed[0]?.per1000 ?? 1

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <InsightCard
        title={`Stands out ${audience}`}
        description="Dispensed more often here than in the comparison group"
        isEmpty={forYou.standsOut.length === 0}
      >
        {forYou.standsOut.map((item) => (
          <BarRow
            key={item.drug.atcCode}
            drug={item.drug}
            label={`${item.ratio.toFixed(1)}×`}
            fraction={item.ratio / highestRatio}
            onOpen={onOpenDrug}
          />
        ))}
      </InsightCard>

      <InsightCard
        title={`Most dispensed ${audience}`}
        description="Highest rate per 1,000 people in this group"
        isEmpty={forYou.mostDispensed.length === 0}
      >
        {forYou.mostDispensed.map((item) => (
          <BarRow
            key={item.drug.atcCode}
            drug={item.drug}
            label={`${Math.round(item.per1000)} per 1,000`}
            fraction={item.per1000 / highestRate}
            onOpen={onOpenDrug}
          />
        ))}
      </InsightCard>

      <InsightCard
        title={`Rising ${audience}`}
        description={`Biggest growth since ${forYou.trendStartYear}`}
        isEmpty={forYou.rising.length === 0}
      >
        {forYou.rising.map((item) => (
          <TrendRow
            key={item.drug.atcCode}
            drug={item.drug}
            label={`×${item.growth.toFixed(1)}`}
            values={item.trend.map((point) => point.per1000)}
            onOpen={onOpenDrug}
          />
        ))}
      </InsightCard>
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

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}
