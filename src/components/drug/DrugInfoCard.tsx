import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { hasDrugInfoContent, useDrugInfo } from '../../hooks/useDrugInfo'
import DrugInfoDialog from './DrugInfoDialog'
import {
  TEXT_HEADING,
  TEXT_BODY,
  TEXT_MUTED,
  TEXT_DANGER,
  TEXT_DRUG
} from '@/theme'

interface Props {
  atcCode: string
  drugName: string
  narcoticClass?: string | null
}

export default function DrugInfoCard({
  atcCode,
  drugName,
  narcoticClass
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { data, loading, error } = useDrugInfo(atcCode)

  const hasContent = data !== null && hasDrugInfoContent(data)

  return (
    <>
      <Card
        className="flex flex-col cursor-pointer py-0 gap-0"
        style={{ height: '100%' }}
        onClick={() => hasContent && setIsOpen(true)}
      >
        {/* Header */}
        <CardHeader className="flex flex-row items-start justify-between gap-2 shrink-0 px-4 pt-4 pb-3">
          <div className="flex flex-col gap-1.5">
            <span
              className={`text-sm font-semibold leading-tight ${TEXT_HEADING}`}
            >
              {drugName}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary">{atcCode}</Badge>
              {narcoticClass && (
                <span className={`text-xs font-bold ${TEXT_DANGER}`}>
                  Narcotic {narcoticClass}
                </span>
              )}
            </div>
          </div>
          {hasContent && (
            <span
              className={`text-xs shrink-0 mt-0.5 font-medium ${TEXT_DRUG}`}
            >
              Read more →
            </span>
          )}
        </CardHeader>

        {/* Preview body */}
        <CardContent className="flex-1 min-h-0 overflow-hidden px-4 pb-4 pt-0 relative flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col gap-2">
              <Skeleton className="h-2.5 w-20 rounded-full" />
              <Skeleton className="h-3 w-full rounded-full" />
              <Skeleton className="h-3 w-5/6 rounded-full" />
              <Skeleton className="h-3 w-4/6 rounded-full" />
              <Skeleton className="h-3 w-full rounded-full mt-2" />
              <Skeleton className="h-3 w-3/4 rounded-full" />
            </div>
          ) : error ? (
            <p className="text-xs text-red-400">
              Failed to load drug information.
            </p>
          ) : data && hasContent ? (
            <>
              {data.indication && (
                <div className="flex flex-col gap-1.5">
                  <p className={`text-xs font-bold uppercase tracking-widest ${TEXT_MUTED}`}>
                    Indications
                  </p>
                  <p className={`text-xs leading-relaxed ${TEXT_BODY}`}>
                    {data.indication.replace(/\n+/g, ' ')}
                  </p>
                </div>
              )}
              {data.precautions && (
                <div className="flex flex-col gap-1.5">
                  <p className={`text-xs font-bold uppercase tracking-widest ${TEXT_MUTED}`}>
                    Precautions
                  </p>
                  <p className={`text-xs leading-relaxed ${TEXT_BODY}`}>
                    {data.precautions.replace(/\n+/g, ' ')}
                  </p>
                </div>
              )}
              {data.sideEffects && (
                <div className="flex flex-col gap-1.5">
                  <p className={`text-xs font-bold uppercase tracking-widest ${TEXT_MUTED}`}>
                    Side Effects
                  </p>
                  <p className={`text-xs leading-relaxed ${TEXT_BODY}`}>
                    {data.sideEffects.replace(/\n+/g, ' ')}
                  </p>
                </div>
              )}
              {/* fade-out at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-white to-transparent pointer-events-none" />
            </>
          ) : (
            <p className={`text-xs ${TEXT_MUTED}`}>No information available.</p>
          )}
        </CardContent>
      </Card>

      <DrugInfoDialog
        atcCode={atcCode}
        drugName={drugName}
        narcoticClass={narcoticClass}
        info={data}
        loading={loading}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  )
}
