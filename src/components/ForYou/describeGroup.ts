import { AGE_BANDS } from '../../types'
import type { Demographics } from '../../context/ProfileContext'

const GENDER_NAMES: Record<number, string> = { 1: 'men', 2: 'women' }

export function genderName(genderId: number | null) {
  if (genderId === null) return null
  return GENDER_NAMES[genderId] ?? null
}

export function ageBandName(ageGroupId: number | null) {
  return AGE_BANDS.find((band) => band.id === ageGroupId)?.name ?? null
}

/** "women 45-49", "women", "people aged 45-49", or null when neither is set. */
function describePeople(group: Demographics) {
  const gender = genderName(group.genderId)
  const age = ageBandName(group.ageGroupId)

  if (gender && age) return `${gender} ${age}`
  if (gender) return gender
  if (age) return `people aged ${age}`
  return null
}

/** The tail of each card title: "for women 45-49 in Stockholms län", "in Stockholms län", … */
export function describeAudience(
  group: Demographics,
  regionName: string | null
) {
  const people = describePeople(group)
  const forPeople = people ? `for ${people}` : null
  const inRegion = regionName ? `in ${regionName}` : null
  return [forPeople, inRegion].filter(Boolean).join(' ')
}

/** "women 45-49 in all of Sweden", "everyone in Stockholms län", "Sweden overall" */
export function describeComparison(
  group: Demographics,
  regionName: string | null
) {
  const people = describePeople(group)
  if (regionName) return `${people ?? 'everyone'} in ${regionName}`
  if (people) return `${people} in all of Sweden`
  return 'Sweden overall'
}
