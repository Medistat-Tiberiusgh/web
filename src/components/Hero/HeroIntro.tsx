import NavSearch from '../AppNavbar/NavSearch'
import SocialLinks from '../SocialLinks'
import type { SearchHandlers } from '../../lib/searchResults'
import type { AgeBand, Drug, Region } from '../../types'
import { COLOR_BRAND, TEXT_HEADING, TEXT_SECONDARY } from '../../theme'

type Props = {
  availableAgeBands: AgeBand[]
  regions: Region[]
  onDrugChange: (drug: Drug | null) => void
  onRegionChange: (region: Region | null) => void
  onGenderChange: (gender: string | null) => void
  onAgeBandChange: (ageBand: AgeBand | null) => void
}

/** Centered wordmark, headline, lead, the medication search, and social links. */
export default function HeroIntro({
  availableAgeBands,
  regions,
  onDrugChange,
  onRegionChange,
  onGenderChange,
  onAgeBandChange
}: Props) {
  // This screen is the no-selection state, so every active filter is empty.
  const searchHandlers: SearchHandlers = {
    activeDrug: null,
    activeRegion: null,
    activeGender: null,
    activeAgeBand: null,
    onDrugChange,
    onRegionChange,
    onGenderChange,
    onAgeBandChange
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 text-center animate-in fade-in-0 duration-300">
      <p className="text-3xl font-bold mb-2" style={{ color: COLOR_BRAND }}>
        Medistat
      </p>
      <h1
        className={`text-4xl lg:text-5xl font-bold tracking-tight mb-3 ${TEXT_HEADING}`}
      >
        <span style={{ color: COLOR_BRAND }}>Swedish</span> medication
        dispensing, explored.
      </h1>
      <p className={`text-lg max-w-2xl mb-8 ${TEXT_SECONDARY}`}>
        How prescription medicines are dispensed across Sweden — by region, year,
        age and gender.
      </p>

      <div className="w-full flex justify-center">
        <NavSearch
          searchHandlers={searchHandlers}
          availableAgeBands={availableAgeBands}
          regions={regions}
        />
      </div>

      <SocialLinks className="mt-8" />
    </main>
  )
}
