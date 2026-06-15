import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import { UserContext } from './context/UserContext'
import { clearToken, loadCurrentUser, completeLogin } from './lib/auth'
import type { User } from './context/UserContext'

export default function App() {
  const [user, setUser] = useState<User | null>(loadCurrentUser)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    const hasCode = new URLSearchParams(window.location.search).has('code')
    if (!hasCode) return
    // The verifier is consumed when the callback is claimed, so a failed
    // exchange can't be silently retried — surface it and let the user start a
    // fresh sign-in. Catch covers a thrown exchange (network down, non-JSON
    // error page); the null branch covers a missing token.
    completeLogin()
      .then((u) => (u ? setUser(u) : setAuthError(true)))
      .catch(() => setAuthError(true))
  }, [])

  function handleLogout() {
    clearToken()
    setUser(null)
  }

  return (
    <UserContext.Provider value={user}>
      <Dashboard onLogout={handleLogout} authError={authError} />
    </UserContext.Provider>
  )
}
