import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import KpiCard from '../KpiCard'
import { fmtPer1000, fmtPer1000Delta, fmtDelta } from '../../lib/format'
import type { Db } from '../../hooks/dashboard/useDashboard'

export default function KpiSection({ db }: { db: Db }) {
  if (db.loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="py-0 gap-0">
            <CardContent className="p-4 flex flex-col gap-2">
              <Skeleton className="h-3 w-1/3 rounded" />
              <Skeleton className="h-8 w-1/2 rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </CardContent>
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
                subLabel: db.previousTrend
                  ? `(${db.previousTrend.totalPatients.toLocaleString()})`
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
              {db.nationalLatest
                ? db.nationalLatest.totalPatients.toLocaleString()
                : '—'}{' '}
              patients.
            </p>
            {db.regionalLatest && (
              <p className="mt-2">
                Total dispensings in {db.regionName ?? 'your region'} (
                {db.regionalLatest.year}):{' '}
                {db.regionalLatest.totalPrescriptions.toLocaleString()}.
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
                subLabel: db.previousTrend
                  ? `(${fmtPer1000(db.previousTrend.per1000)})`
                  : undefined
              }
            : undefined
        }
        nationalDelta={
          db.per1000DeltaVsNat != null && db.nationalLatest
            ? {
                value: fmtDelta(db.per1000DeltaVsNat, '%'),
                pct: db.per1000DeltaVsNat,
                avgLabel: fmtPer1000(db.nationalLatest.per1000)
              }
            : null
        }
        info={
          db.demographicLabel
            ? `Dispensings per 1,000 ${db.demographicLabel}. The API filters the data for this demographic.`
            : `Dispensings per 1,000 inhabitants in ${db.regionName ?? 'your region'}. National average: ${db.nationalLatest ? fmtPer1000(db.nationalLatest.per1000) : '—'}.`
        }
      />

      <KpiCard
        label={`Chronic Use Ratio${db.regionName ? ` · ${db.regionName}` : ''}`}
        value={
          db.chronicUseRatio != null ? `${db.chronicUseRatio.toFixed(2)}x` : '—'
        }
        delta={
          db.ratioDiff != null && db.previousTrend != null
            ? {
                value: fmtDelta(db.ratioDiff, 'x', 2),
                subLabel: `(${(db.previousTrend.totalPrescriptions / db.previousTrend.totalPatients).toFixed(2)}x)`
              }
            : undefined
        }
        nationalDelta={
          db.ratioDeltaVsNat != null && db.nationalChronicRatio != null
            ? {
                value: fmtDelta(db.ratioDeltaVsNat, '%'),
                pct: db.ratioDeltaVsNat,
                avgLabel: `${db.nationalChronicRatio.toFixed(2)}x`
              }
            : null
        }
        info="Total dispensings divided by total patients. A value above 1 means patients dispensed the drug more than once on average, typical for chronic conditions."
      />
    </div>
  )
}
