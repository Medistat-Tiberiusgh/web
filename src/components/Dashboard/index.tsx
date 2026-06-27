import { type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import AppNavbar from '../AppNavbar'
import Hero from '../Hero'
import Footer from '../Footer'
import KpiSection from './KpiSection'
import ChartsSection from './ChartsSection'
import { useDashboard, type Db } from '../../hooks/dashboard/useDashboard'
import { TEXT_MUTED, SURFACE_MUTED } from '../../theme'

function MessageCard({ children }: { children: ReactNode }) {
  return (
    <Card className="animate-in fade-in-0 duration-300">
      <CardContent
        className={`flex items-center justify-center h-64 text-sm ${TEXT_MUTED}`}
      >
        {children}
      </CardContent>
    </Card>
  )
}

function ErrorCard() {
  return (
    <MessageCard>Couldn’t load dispensing data. Please try again.</MessageCard>
  )
}

function LoadingCard() {
  return <MessageCard>Loading dispensing data…</MessageCard>
}

function DashboardCharts({ db }: { db: Db }) {
  return (
    <div className="flex flex-col gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <KpiSection db={db} />
      <ChartsSection db={db} />
    </div>
  )
}

function DashboardContent({ db }: { db: Db }) {
  if (db.error) return <ErrorCard />
  if (!db.hasData) return <LoadingCard />
  return <DashboardCharts db={db} />
}

export default function Dashboard({
  onLogout,
  authError
}: {
  onLogout: () => void
  authError: boolean
}) {
  const db = useDashboard()

  // No medication selected → show the hero (clearing a drug returns here)
  if (db.activeDrug === null) {
    return (
      <Hero
        authError={authError}
        onLogout={onLogout}
        availableAgeBands={db.availableAgeBands}
        regions={db.regions}
        savedMedications={{
          medications: db.medications,
          error: db.medicationsError,
          onRemove: db.removeMedication
        }}
        onDrugChange={db.setActiveDrug}
        onRegionChange={db.setActiveRegion}
        onGenderChange={db.setActiveGender}
        onAgeBandChange={db.setActiveAgeBand}
      />
    )
  }

  return (
    <div className={`h-screen flex flex-col ${SURFACE_MUTED}`}>
      <AppNavbar
        onLogout={onLogout}
        authError={authError}
        activeDrug={db.activeDrug}
        activeRegion={db.activeRegion}
        activeYear={db.activeYear}
        activeGender={db.activeGender}
        activeAgeBand={db.activeAgeBand}
        availableAgeBands={db.availableAgeBands}
        regions={db.regions}
        years={db.years}
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

      <main className="no-scrollbar flex-1 overflow-y-auto p-4 flex flex-col gap-3 max-w-screen-2xl mx-auto w-full animate-in fade-in-0 duration-300">
        <DashboardContent db={db} />

        <Footer className="mt-auto pt-4 pb-2" />
      </main>
    </div>
  )
}
