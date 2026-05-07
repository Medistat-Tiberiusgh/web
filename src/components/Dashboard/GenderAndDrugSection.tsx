import { useRef, useState, useEffect } from 'react'
import { Card, Skeleton } from '@heroui/react'
import GenderGapChart from '../charts/GenderGapChart'
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
        <Card>
          <Card.Header className="flex-row items-start justify-between px-4 pt-4 pb-0">
            <div>
              <Card.Title>
                Patient Gender Gap
                <ChartFilterLabel
                  regionName={db.regionName}
                  ageBand={db.activeAgeBand}
                />
              </Card.Title>
              <Card.Description>per 1,000 inhabitants · all years</Card.Description>
            </div>
          </Card.Header>
          <Card.Content className="p-0">
            {db.loading ? (
              <Skeleton className="h-48 m-4 rounded" />
            ) : (
              <GenderGapChart
                data={db.natGenderSplit}
                regionalData={db.regGenderSplit}
                regionName={db.regionName}
                filterGender={db.activeGender}
                selectedYear={db.activeYear}
              />
            )}
          </Card.Content>
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
