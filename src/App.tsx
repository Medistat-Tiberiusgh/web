import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import LoginPage, { VERIFIER_KEY, redirectUri } from './components/LoginPage'
import { UserContext } from './context/UserContext'
import { getToken, saveToken, clearToken, decodeToken } from './lib/auth'
import type { User } from './context/UserContext'

const API_URL = import.meta.env.VITE_API_URL as string

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const token = getToken()
    return token ? decodeToken(token) : null
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (!code) return

    const verifier = sessionStorage.getItem(VERIFIER_KEY)
    sessionStorage.removeItem(VERIFIER_KEY)
    window.history.replaceState({}, '', window.location.pathname)

    if (!verifier) return

    fetch(`${API_URL}/auth/github/exchange`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, codeVerifier: verifier, redirectUri: redirectUri() }),
    })
      .then((r) => r.json())
      .then((data: { token?: string }) => {
        if (!data.token) return
        saveToken(data.token)
        setUser(decodeToken(data.token))
      })
  }, [])

  function handleLogout() {
    clearToken()
    setUser(null)
  }

  if (!user) return <LoginPage />

  return (
    <UserContext.Provider value={user}>
      <Dashboard onLogout={handleLogout} />
    </UserContext.Provider>
  )
}
