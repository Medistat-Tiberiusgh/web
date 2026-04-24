import { COLOR_BRAND } from '../theme'
import { generateVerifier, computeChallenge } from '../lib/pkce'

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID as string
const VERIFIER_KEY = 'medistat_pkce_verifier'

function redirectUri(): string {
  return `${window.location.origin}/`
}

async function startGithubLogin() {
  const verifier = generateVerifier()
  const challenge = await computeChallenge(verifier)
  sessionStorage.setItem(VERIFIER_KEY, verifier)

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri(),
    scope: 'read:user',
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })
  window.location.href = `https://github.com/login/oauth/authorize?${params}`
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 flex flex-col items-center gap-6 w-full max-w-sm">
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold" style={{ color: COLOR_BRAND }}>Medistat</span>
          <span className="text-sm text-gray-500">Swedish prescription analytics</span>
        </div>

        <button
          onClick={startGithubLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </button>
      </div>
    </div>
  )
}

export { VERIFIER_KEY, redirectUri }
