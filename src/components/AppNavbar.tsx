export default function AppNavbar() {
  return (
    <nav className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      <span className="text-lg font-bold text-blue-700">Medistat</span>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-600" />
        <p className="text-sm font-medium text-gray-900">Guest Visitor</p>
        <button
          title="Log out"
          className="p-2 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
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
      </div>
    </nav>
  )
}
