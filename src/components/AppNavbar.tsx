import { SearchField } from '@heroui/react'
import { useUser } from '../context/UserContext'

export default function AppNavbar({ onLogout }: { onLogout: () => void }) {
  const user = useUser()

  return (
    <nav className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 gap-4">
      <span className="text-lg font-bold text-blue-700 shrink-0">Medistat</span>

      <div className="flex-1 max-w-md">
        <SearchField>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Search drug or ATC..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-9 h-9 rounded-full object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-600" />
        )}
        <p className="text-sm font-medium text-gray-900">{user?.username ?? 'Guest'}</p>
        <button
          title="Log out"
          onClick={onLogout}
          className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
