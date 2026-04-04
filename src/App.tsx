import AppNavbar from './components/AppNavbar'
import MedicationList from './components/MedicationList'
import MapView from './components/MapView'
import RegionalRanking from './components/RegionalRanking'
import { useMedications } from './hooks/useMedications'

export default function App() {
  const { medications, loadingList, selectedIndex, regions, selectMedication } =
    useMedications()

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppNavbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
          <MedicationList
            medications={medications}
            loading={loadingList}
            selectedIndex={selectedIndex}
            onSelect={selectMedication}
          />
        </aside>
        <main className="flex-1 overflow-hidden">
          <MapView />
        </main>
        <aside className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
          <RegionalRanking regions={regions} />
        </aside>
      </div>
    </div>
  )
}
