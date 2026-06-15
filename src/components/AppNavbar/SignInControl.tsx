import { useState } from 'react'
import { startGithubLogin } from '../../lib/oauth'
import {
  SURFACE_DANGER,
  BORDER_DANGER,
  TEXT_DANGER,
  TEXT_MUTED,
  TEXT_MUTED_HOVER
} from '../../theme'

type Props = {
  authError: boolean
}

export default function SignInControl({ authError }: Props) {
  // Whether the user has closed the error popup — purely local UI, so it lives
  // here rather than round-tripping to whoever owns authError.
  const [dismissed, setDismissed] = useState(false)

  function renderError() {
    if (!authError || dismissed) return null
    return (
      <div
        role="alert"
        className={`absolute right-0 top-full mt-2 z-50 flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm shadow-md ${SURFACE_DANGER} ${BORDER_DANGER} ${TEXT_DANGER}`}
      >
        <span>Sign-in failed — please try again</span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className={`${TEXT_MUTED} ${TEXT_MUTED_HOVER}`}
        >
          ✕
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={startGithubLogin}
        className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        Sign in
      </button>
      {renderError()}
    </div>
  )
}
