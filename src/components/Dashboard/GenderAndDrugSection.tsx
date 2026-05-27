import { useRef, useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import PatientGenderGap from '../charts/PatientGenderGap'
import DrugInfoCard from '../DrugInfoCard'
import ChartFilterLabel from '../ChartFilterLabel'
import type { useDashboard } from '../../hooks/dashboard/useDashboard'

type Db = ReturnType<typeof useDashboard>

export default function GenderAndDrugSection({ db }: { db: Db }) {
  const chartCardRef = useRef<HTMLDivElement>(null)
  const [chartCardHeight, setChartCardHeight] = useState<number | undefined>(
    undefined
  )
  useEffect(() => {
    const el = chartCardRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) =>
      setChartCardHeight(e.contentRect.height)
    )
    ro.observe(el)
    return () => ro.disconnect()
  }, [db.activeDrug?.atcCode])

  return (
    <div className="flex gap-3 items-start">
      <div
        ref={chartCardRef}
        style={{ width: '560px' }}
        className="shrink-0"
      >
        <Card className="py-0 gap-0">
          <CardHeader className="flex flex-row items-start justify-between px-4 pt-4 pb-0">
            <div>
              <CardTitle>
                Patient Gender Gap
                <ChartFilterLabel
                  regionName={db.regionName}
                  ageBand={db.activeAgeBand}
                />
              </CardTitle>
              <CardDescription>per 1,000 inhabitants · all years</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {db.loading ? (
              <Skeleton className="h-48 m-4 rounded" />
            ) : (
              <PatientGenderGap
                data={db.natGenderSplit}
                regionalData={db.regGenderSplit}
                regionName={db.regionName}
                filterGender={db.activeGender}
                selectedYear={db.activeYear}
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex-1" style={{ height: chartCardHeight }}>
        <DrugInfoCard
          atcCode={db.activeDrug!.atcCode}
          drugName={db.activeDrug!.name}
          narcoticClass={db.activeDrug!.narcoticClass}
        />
      </div>
    </div>
  )
}
