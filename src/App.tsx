import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
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

  return (
    <UserContext.Provider value={user}>
      <Dashboard onLogout={handleLogout} />
    </UserContext.Provider>
  )
}
