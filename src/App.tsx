import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import { UserContext } from './context/UserContext'
import { getToken, saveToken, clearToken, decodeToken } from './lib/auth'
import type { User } from './context/UserContext'

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const token = getToken()
    return token ? decodeToken(token) : null
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      saveToken(token)
      setUser(decodeToken(token))
      window.history.replaceState({}, '', window.location.pathname)
    }
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
