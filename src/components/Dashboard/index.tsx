import { Card } from '@heroui/react'
import AppNavbar from '../AppNavbar'
import MedicationList from '../MedicationList'
import Footer from '../Footer'
import KpiSection from './KpiSection'
import ChartsGridSection from './ChartsGridSection'
import GenderAndDrugSection from './GenderAndDrugSection'
import { useDashboard } from '../../hooks/dashboard/useDashboard'

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const db = useDashboard()

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <AppNavbar
        onLogout={onLogout}
        activeDrug={db.activeDrug}
        activeRegion={db.activeRegion}
        activeYear={db.activeYear}
        activeGender={db.activeGender}
        activeAgeBand={db.activeAgeBand}
        availableAgeBands={db.availableAgeBands}
        savedAtcCodes={new Set(db.medications.map((m) => m.drugData.atcCode))}
        onDrugChange={db.setActiveDrug}
        onRegionChange={db.setActiveRegion}
        onYearChange={db.setActiveYear}
        onGenderChange={db.setActiveGender}
        onAgeBandChange={db.setActiveAgeBand}
        onSaveDrug={(drug) => db.addMedication(drug.atcCode)}
      />

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 border-r border-gray-200 bg-white flex flex-col overflow-hidden shrink-0">
          <MedicationList
            medications={db.medications}
            loading={db.medsLoading}
            activeDrugAtcCode={db.activeDrug?.atcCode ?? null}
            onSelect={db.setActiveDrug}
            onRemove={db.removeMedication}
          />
        </aside>

        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-w-screen-2xl mx-auto w-full">
          <KpiSection db={db} />

          {!db.activeDrug ? (
            <Card>
              <Card.Content className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Select a medication from the sidebar or search bar to explore
                dispensing data
              </Card.Content>
            </Card>
          ) : (
            <>
              <ChartsGridSection db={db} />
              <GenderAndDrugSection db={db} />
            </>
          )}

          <Footer className="mt-auto pt-4 pb-2" />
        </main>
      </div>
    </div>
  )
}
