import SavedMedicationsButton, {
  type SavedMedications
} from '../AppNavbar/SavedMedicationsButton'
import AuthButtons from '../AppNavbar/AuthButtons'
import UserMenu from '../AppNavbar/UserMenu'
import { useUser } from '../../context/UserContext'
import type { Drug } from '../../types'

type Props = {
  authError: boolean
  onLogout: () => void
  savedMedications: SavedMedications
  onSelectDrug: (drug: Drug) => void
}

/** Saved medications + user menu when signed in, otherwise the sign-in button. */
export default function AccountControls({
  authError,
  onLogout,
  savedMedications,
  onSelectDrug
}: Props) {
  const user = useUser()
  if (!user) return <AuthButtons authError={authError} />
  return (
    <div className="flex items-center gap-3">
      <SavedMedicationsButton
        savedMedications={savedMedications}
        activeDrugAtcCode={null}
        onSelect={onSelectDrug}
      />
      <UserMenu
        username={user.username}
        avatarUrl={user.avatarUrl}
        onLogout={onLogout}
      />
    </div>
  )
}
