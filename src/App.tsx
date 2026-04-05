import { useState } from 'react'
import AppNavbar from './components/AppNavbar'
import MedicationList from './components/MedicationList'
import MapView from './components/MapView'
import RegionalRanking from './components/RegionalRanking'
import { useMedications } from './hooks/useMedications'
import { UserContext } from './context/UserContext'
import { mockUser } from './mock/user'
import type { User } from './context/UserContext'

export default function App() {
  // TODO: replace with real JWT parsing after login
  const [user] = useState<User>(mockUser)

  const { medications, loading, selectedIndex, regions, selectMedication } = useMedications()

  return (
    <UserContext.Provider value={user}>
      <div className="h-screen flex flex-col bg-gray-50">
        <AppNavbar />
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-72 border-r border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
            <MedicationList
              medications={medications}
              loading={loading}
              selectedIndex={selectedIndex}
              onSelect={selectMedication}
            />
          </aside>
          <main className="flex-1 overflow-hidden">
            <MapView regions={regions} />
          </main>
          <aside className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
            <RegionalRanking regions={regions} />
          </aside>
        </div>
      </div>
    </UserContext.Provider>
  )
}
