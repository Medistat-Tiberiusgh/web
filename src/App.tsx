import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import { UserContext } from './context/UserContext'
import { clearToken, loadCurrentUser, completeLogin } from './lib/auth'
import type { User } from './context/UserContext'

export default function App() {
  const [user, setUser] = useState<User | null>(loadCurrentUser)

  useEffect(() => {
    const hasCode = new URLSearchParams(window.location.search).has('code')
    if (!hasCode) return
    completeLogin().then((u) => {
      if (u) setUser(u)
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
