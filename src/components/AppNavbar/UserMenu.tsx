import { TEXT_HEADING, TEXT_MUTED, TEXT_BODY_HOVER } from '../../theme'

type Props = {
  username: string
  avatarUrl: string | null
  onLogout: () => void
}

export default function UserMenu({ username, avatarUrl, onLogout }: Props) {
  return (
    <>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={username}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {username[0]?.toUpperCase() ?? '?'}
        </div>
      )}
      <span className={`text-base font-semibold ${TEXT_HEADING}`}>
        {username}
      </span>
      <button
        title="Log out"
        onClick={onLogout}
        className={`p-1.5 rounded-md hover:bg-gray-100 transition-colors ${TEXT_MUTED} ${TEXT_BODY_HOVER}`}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
          />
        </svg>
      </button>
    </>
  )
}
