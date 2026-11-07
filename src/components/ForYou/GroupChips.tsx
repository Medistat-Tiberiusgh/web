import GroupChip from './GroupChip'
import { capitalize, genderName } from '../../lib/describeGroup'
import type { Demographics } from '../../context/ProfileContext'
import { AGE_BANDS, type Region } from '../../types'
import { TEXT_SECONDARY, CHIP_REGION, CHIP_GENDER, CHIP_AGE } from '../../theme'

// "Riket" is the national total, which is what "Any region" already means.
const NATIONAL_REGION_ID = 0
const GENDER_IDS = [1, 2]

/** "Showing: [Stockholms län ▾] [Women ▾] [45-49 ▾]" — changes the shown group, never the saved profile. */
export default function GroupChips({
  group,
  regions,
  onChange
}: {
  group: Demographics
  regions: Region[]
  onChange: (group: Demographics) => void
}) {
  const regionOptions = regions
    .filter((region) => region.id !== NATIONAL_REGION_ID)
    .map((region) => ({ id: region.id, label: region.regionName }))
  const genderOptions = GENDER_IDS.map((id) => ({
    id,
    label: capitalize(genderName(id) ?? '')
  }))
  const ageOptions = AGE_BANDS.map((band) => ({
    id: band.id,
    label: band.name
  }))

  return (
    <div
      className={`flex flex-wrap items-center gap-2 text-sm ${TEXT_SECONDARY}`}
    >
      <span>Showing:</span>
      <GroupChip
        dimension="region"
        colorClass={CHIP_REGION}
        selectedId={group.regionId}
        options={regionOptions}
        onSelect={(regionId) => onChange({ ...group, regionId })}
      />
      <GroupChip
        dimension="gender"
        colorClass={CHIP_GENDER}
        selectedId={group.genderId}
        options={genderOptions}
        onSelect={(genderId) => onChange({ ...group, genderId })}
      />
      <GroupChip
        dimension="age"
        colorClass={CHIP_AGE}
        selectedId={group.ageGroupId}
        options={ageOptions}
        onSelect={(ageGroupId) => onChange({ ...group, ageGroupId })}
      />
    </div>
  )
}
