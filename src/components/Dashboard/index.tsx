import { type ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import AppNavbar from '../AppNavbar'
import Footer from '../Footer'
import KpiSection from './KpiSection'
import ChartsSection from './ChartsSection'
import { useDashboard, type Db } from '../../hooks/dashboard/useDashboard'
import { TEXT_MUTED, SURFACE_MUTED } from '../../theme'

function MessageCard({ children }: { children: ReactNode }) {
  return (
    <Card>
      <CardContent
        className={`flex items-center justify-center h-64 text-sm ${TEXT_MUTED}`}
      >
        {children}
      </CardContent>
    </Card>
  )
}

function NoDrugSelectedCard() {
  return (
    <MessageCard>
      Search for a medication or pick one from your saved list to explore
      dispensing data
    </MessageCard>
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

function DashboardContent({ db }: { db: Db }) {
  if (db.activeDrug === null) return <NoDrugSelectedCard />
  if (db.error) return <ErrorCard />
  if (!db.hasData) return <LoadingCard />
  return (
    <>
      <KpiSection db={db} />
      <ChartsSection db={db} />
    </>
  )
}

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
        <DashboardContent db={db} />

        <Footer className="mt-auto pt-4 pb-2" />
      </main>
    </div>
  )
}
