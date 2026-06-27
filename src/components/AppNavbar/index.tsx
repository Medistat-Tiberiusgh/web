import {
  COLOR_BRAND,
  SURFACE_CARD,
  BORDER_DEFAULT,
  BORDER_SUBTLE
} from '../../theme'
import { useUser } from '../../context/UserContext'
import PortfolioLink from '../PortfolioLink'
import SocialLinks from '../SocialLinks'
import FilterChips from './FilterChips'
import NavSearch from './NavSearch'
import SavedMedicationsButton, {
  type SavedMedications
} from './SavedMedicationsButton'
import AuthButtons from './AuthButtons'
import UserMenu from './UserMenu'
import type { SearchHandlers } from '../../lib/searchResults'
import type { AgeBand, Drug, Region } from '../../types'

interface Props {
  onLogout: () => void
  authError: boolean
  activeDrug: Drug | null
  activeRegion: Region | null
  activeYear: number | null
  activeGender: string | null
  activeAgeBand: AgeBand | null
  availableAgeBands: AgeBand[]
  regions: Region[]
  years: number[]
  savedAtcCodes: Set<string>
  savedMedications: SavedMedications
  onDrugChange: (drug: Drug | null) => void
  onRegionChange: (region: Region | null) => void
  onYearChange: (year: number | null) => void
  onGenderChange: (gender: string | null) => void
  onAgeBandChange: (ageBand: AgeBand | null) => void
  onSaveDrug: (drug: Drug) => void
}

export default function AppNavbar({
  onLogout,
  authError,
  activeDrug,
  activeRegion,
  activeYear,
  activeGender,
  activeAgeBand,
  availableAgeBands,
  regions,
  years,
  savedAtcCodes,
  savedMedications,
  onDrugChange,
  onRegionChange,
  onYearChange,
  onGenderChange,
  onAgeBandChange,
  onSaveDrug
}: Props) {
  const user = useUser()

  const searchHandlers: SearchHandlers = {
    activeDrug,
    activeRegion,
    activeGender,
    activeAgeBand,
    onDrugChange,
    onRegionChange,
    onGenderChange,
    onAgeBandChange
  }

  const hasActiveFilters =
    !!activeDrug ||
    !!activeRegion ||
    !!activeGender ||
    !!activeAgeBand ||
    activeYear !== null

  function clearAllFilters() {
    onDrugChange(null)
    onRegionChange(null)
    onGenderChange(null)
    onAgeBandChange(null)
    onYearChange(null)
  }

  return (
    <nav className={`border-b shrink-0 ${BORDER_DEFAULT} ${SURFACE_CARD}`}>
      {/* Row 1: Breadcrumb back to the portfolio */}
      <div className="px-8 pt-3 pb-4">
        <PortfolioLink />
      </div>

      {/* Row 2: Brand + socials / account */}
      <div className="flex items-center justify-between gap-6 px-8 py-4">
        <div className="flex items-center gap-5">
          <span
            className="text-4xl font-bold tracking-tight"
            style={{ color: COLOR_BRAND }}
          >
            Medistat
          </span>
          <SocialLinks />
        </div>

        <div className="flex items-center justify-end gap-3">
          {user ? (
            <>
              <SavedMedicationsButton
                savedMedications={savedMedications}
                activeDrugAtcCode={activeDrug?.atcCode ?? null}
                onSelect={onDrugChange}
              />
              <UserMenu
                username={user.username}
                avatarUrl={user.avatarUrl}
                onLogout={onLogout}
              />
            </>
          ) : (
            <AuthButtons authError={authError} />
          )}
        </div>
      </div>

      {/* Row 3: Search, with active filters shown as chips inside it */}
      <div className={`flex justify-center px-8 py-2.5 border-t ${BORDER_SUBTLE}`}>
        <NavSearch
          searchHandlers={searchHandlers}
          availableAgeBands={availableAgeBands}
          regions={regions}
          onClearFilters={clearAllFilters}
          chips={
            hasActiveFilters ? (
              <FilterChips
                activeDrug={activeDrug}
                activeRegion={activeRegion}
                activeYear={activeYear}
                activeGender={activeGender}
                activeAgeBand={activeAgeBand}
                years={years}
                savedAtcCodes={savedAtcCodes}
                onDrugChange={onDrugChange}
                onRegionChange={onRegionChange}
                onYearChange={onYearChange}
                onGenderChange={onGenderChange}
                onAgeBandChange={onAgeBandChange}
                onSaveDrug={onSaveDrug}
              />
            ) : undefined
          }
        />
      </div>
    </nav>
  )
}
