import {
  Dialog,
  DialogTrigger,
  DialogContent
} from '@/components/ui/dialog'
import ProfilePanel from './ProfilePanel'
import {
  TEXT_HEADING,
  SURFACE_AVATAR,
  SURFACE_MUTED_HOVER
} from '../../theme'

type Props = {
  username: string
  avatarUrl: string | null
  onLogout: () => void
}

export default function UserMenu({ username, avatarUrl, onLogout }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={`flex items-center gap-2 rounded-full p-1 pr-3 transition-colors ${SURFACE_MUTED_HOVER}`}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${SURFACE_AVATAR}`}
            >
              {username[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <span className={`text-base font-semibold ${TEXT_HEADING}`}>
            {username}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-0 gap-0">
        <ProfilePanel onLogout={onLogout} />
      </DialogContent>
    </Dialog>
  )
}
