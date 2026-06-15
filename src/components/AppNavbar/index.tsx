import { COLOR_BRAND, SURFACE_CARD, BORDER_DEFAULT } from '../../theme'
import { useUser } from '../../context/UserContext'
import FilterChips from './FilterChips'
import NavSearch from './NavSearch'
import SavedMedicationsButton, {
  type SavedMedications
} from './SavedMedicationsButton'
import SignInControl from './SignInControl'
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

  return (
    <nav className={`border-b shrink-0 ${BORDER_DEFAULT} ${SURFACE_CARD}`}>
      {/* Row 1: Logo / Search / User */}
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-6 px-8 py-3">
        <span className="text-3xl font-bold" style={{ color: COLOR_BRAND }}>
          Medistat
        </span>

        <NavSearch
          searchHandlers={searchHandlers}
          availableAgeBands={availableAgeBands}
          regions={regions}
        />

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
            <SignInControl authError={authError} />
          )}
        </div>
      </div>

      {/* Row 2: Active filter chips */}
      {hasActiveFilters && (
        <FilterChips
          activeDrug={activeDrug}
          activeRegion={activeRegion}
          activeYear={activeYear}
          activeGender={activeGender}
          activeAgeBand={activeAgeBand}
          savedAtcCodes={savedAtcCodes}
          onDrugChange={onDrugChange}
          onRegionChange={onRegionChange}
          onYearChange={onYearChange}
          onGenderChange={onGenderChange}
          onAgeBandChange={onAgeBandChange}
          onSaveDrug={onSaveDrug}
        />
      )}
    </nav>
  )
}
