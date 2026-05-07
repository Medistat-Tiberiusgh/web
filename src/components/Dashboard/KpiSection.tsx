import { Card, Skeleton } from '@heroui/react'
import KpiCard from '../KpiCard'
import { fmtPer1000, fmtPer1000Delta, fmtDelta } from '../../lib/format'
import type { useDashboard } from '../../hooks/dashboard/useDashboard'

type Db = ReturnType<typeof useDashboard>

export default function KpiSection({ db }: { db: Db }) {
  if (db.loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <Card.Content className="p-4 flex flex-col gap-2">
              <Skeleton className="h-3 w-1/3 rounded" />
              <Skeleton className="h-8 w-1/2 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </Card.Content>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <KpiCard
        label={`Total Patients${db.regionName ? ` · ${db.regionName}` : ''}`}
        value={
          db.latestTrend ? db.latestTrend.totalPatients.toLocaleString() : '—'
        }
        delta={
          db.patientsPct != null
            ? {
                value: fmtDelta(db.patientsPct, '%'),
                subLabel: db.prevTrend
                  ? `(${db.prevTrend.totalPatients.toLocaleString()})`
                  : undefined
              }
            : undefined
        }
        nationalDelta={null}
        info={
          <>
            <p>
              Number of unique patients who received at least one dispensing for
              this drug
              {db.latestTrend ? ` in ${db.latestTrend.year}` : ''}.
            </p>
            <p className="mt-2">
              National total:{' '}
              {db.natLatest ? db.natLatest.totalPatients.toLocaleString() : '—'}{' '}
              patients.
            </p>
            {db.regLatest && (
              <p className="mt-2">
                Total dispensings in {db.regionName ?? 'your region'} (
                {db.regLatest.year}):{' '}
                {db.regLatest.totalPrescriptions.toLocaleString()}.
              </p>
            )}
          </>
        }
      />

      <KpiCard
        label={`Dispensings per 1,000 ${db.demographicLabel ?? 'Inhabitants'}${db.regionName ? ` · ${db.regionName}` : ''}`}
        value={db.latestTrend ? fmtPer1000(db.latestTrend.per1000) : '—'}
        delta={
          db.per1000Diff != null
            ? {
                value: fmtPer1000Delta(db.per1000Diff),
                subLabel: db.prevTrend
                  ? `(${fmtPer1000(db.prevTrend.per1000)})`
                  : undefined
              }
            : undefined
        }
        nationalDelta={
          db.per1000DeltaVsNat != null && db.natLatest
            ? {
                value: fmtDelta(db.per1000DeltaVsNat, '%'),
                pct: db.per1000DeltaVsNat,
                avgLabel: fmtPer1000(db.natLatest.per1000)
              }
            : null
        }
        info={
          db.demographicLabel
            ? `Dispensings per 1,000 ${db.demographicLabel}. The API filters the data for this demographic.`
            : `Dispensings per 1,000 inhabitants in ${db.regionName ?? 'your region'}. National average: ${db.natLatest ? fmtPer1000(db.natLatest.per1000) : '—'}.`
        }
      />

      <KpiCard
        label={`Chronic Use Ratio${db.regionName ? ` · ${db.regionName}` : ''}`}
        value={
          db.chronicUseRatio != null
            ? `${db.chronicUseRatio.toFixed(2)}x`
            : '—'
        }
        delta={
          db.ratioDiff != null && db.prevTrend != null
            ? {
                value: fmtDelta(db.ratioDiff, 'x', 2),
                subLabel: `(${(db.prevTrend.totalPrescriptions / db.prevTrend.totalPatients).toFixed(2)}x)`
              }
            : undefined
        }
        nationalDelta={
          db.ratioDeltaVsNat != null && db.natChronicRatio != null
            ? {
                value: fmtDelta(db.ratioDeltaVsNat, '%'),
                pct: db.ratioDeltaVsNat,
                avgLabel: `${db.natChronicRatio.toFixed(2)}x`
              }
            : null
        }
        info="Total dispensings divided by total patients. A value above 1 means patients dispensed the drug more than once on average, typical for chronic conditions."
      />
    </div>
  )
}
