import { Card, CardContent } from '@/components/ui/card'
import AppNavbar from '../AppNavbar'
import Footer from '../Footer'
import KpiSection from './KpiSection'
import ChartsSection from './ChartsSection'
import { useDashboard } from '../../hooks/dashboard/useDashboard'
import { TEXT_MUTED, SURFACE_MUTED } from '../../theme'

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const db = useDashboard()

  return (
    <div className={`h-screen flex flex-col ${SURFACE_MUTED}`}>
      <AppNavbar
        onLogout={onLogout}
        activeDrug={db.activeDrug}
        activeRegion={db.activeRegion}
        activeYear={db.activeYear}
        activeGender={db.activeGender}
        activeAgeBand={db.activeAgeBand}
        availableAgeBands={db.availableAgeBands}
        savedAtcCodes={new Set(db.medications.map((m) => m.drugData.atcCode))}
        savedMedications={{
          medications: db.medications,
          error: db.medicationsError,
          onRemove: db.removeMedication
        }}
        onDrugChange={db.setActiveDrug}
        onRegionChange={db.setActiveRegion}
        onYearChange={db.setActiveYear}
        onGenderChange={db.setActiveGender}
        onAgeBandChange={db.setActiveAgeBand}
        onSaveDrug={(drug) => db.addMedication(drug.atcCode)}
      />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-w-screen-2xl mx-auto w-full">
        <KpiSection db={db} />

        {!db.activeDrug ? (
          <Card>
            <CardContent
              className={`flex items-center justify-center h-64 text-sm ${TEXT_MUTED}`}
            >
              Search for a medication or pick one from your saved list to
              explore dispensing data
            </CardContent>
          </Card>
        ) : db.error ? (
          <Card>
            <CardContent
              className={`flex items-center justify-center h-64 text-sm ${TEXT_MUTED}`}
            >
              Couldn’t load dispensing data. Please try again.
            </CardContent>
          </Card>
        ) : (
          <ChartsSection db={db} />
        )}

        <Footer className="mt-auto pt-4 pb-2" />
      </main>
    </div>
  )
}
