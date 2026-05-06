import { Card, Skeleton } from '@heroui/react'
import GenderGapChart from '../charts/GenderGapChart'
import DrugInfoCard from '../DrugInfoCard'
import ChartFilterLabel from '../ChartFilterLabel'
import type { useDashboard } from '../../hooks/useDashboard'

type Db = ReturnType<typeof useDashboard>

export default function GenderAndDrugSection({ db }: { db: Db }) {
  return (
    <div className="flex gap-3 items-start">
      <div
        ref={db.chartCardRef}
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

      <div className="flex-1" style={{ height: db.chartCardHeight }}>
        <DrugInfoCard
          atcCode={db.activeDrug!.atcCode}
          drugName={db.activeDrug!.name}
          narcoticClass={db.activeDrug!.narcoticClass}
        />
      </div>
    </div>
  )
}
