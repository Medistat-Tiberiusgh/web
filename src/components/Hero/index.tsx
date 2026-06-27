import Footer from '../Footer'
import PortfolioLink from '../PortfolioLink'
import AccountControls from './AccountControls'
import HeroIntro from './HeroIntro'
import type { SavedMedications } from '../AppNavbar/SavedMedicationsButton'
import type { AgeBand, Drug, Region } from '../../types'
import { SURFACE_MUTED } from '../../theme'

type Props = {
  authError: boolean
  onLogout: () => void
  availableAgeBands: AgeBand[]
  regions: Region[]
  savedMedications: SavedMedications
  onDrugChange: (drug: Drug | null) => void
  onRegionChange: (region: Region | null) => void
  onGenderChange: (gender: string | null) => void
  onAgeBandChange: (ageBand: AgeBand | null) => void
}

// Landing screen shown while no medication is selected.
export default function Hero({
  authError,
  onLogout,
  availableAgeBands,
  regions,
  savedMedications,
  onDrugChange,
  onRegionChange,
  onGenderChange,
  onAgeBandChange
}: Props) {
  return (
    <div className={`min-h-screen flex flex-col ${SURFACE_MUTED}`}>
      <header className="flex items-center justify-between px-8 py-4">
        <PortfolioLink />
        <AccountControls
          authError={authError}
          onLogout={onLogout}
          savedMedications={savedMedications}
          onSelectDrug={onDrugChange}
        />
      </header>

      <HeroIntro
        availableAgeBands={availableAgeBands}
        regions={regions}
        onDrugChange={onDrugChange}
        onRegionChange={onRegionChange}
        onGenderChange={onGenderChange}
        onAgeBandChange={onAgeBandChange}
      />

      <Footer className="pb-4" />
    </div>
  )
}
