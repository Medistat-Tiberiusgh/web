import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDrugInfo } from '../../hooks/useDrugInfo'
import {
  TEXT_HEADING,
  TEXT_BODY,
  TEXT_MUTED,
  TEXT_DANGER,
  TEXT_LINK,
  TEXT_DRUG,
  BORDER_SUBTLE,
  SURFACE_WARNING,
  BORDER_WARNING,
  TEXT_WARNING
} from '@/theme'

interface Props {
  atcCode: string
  drugName: string
  narcoticClass?: string | null
}

// ── Shared text renderer ──────────────────────────────────────────────────────

function TextBlock({ text }: { text: string }) {
  const paras = text
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter(Boolean)

  return (
    <div className="flex flex-col gap-1.5">
      {paras.map((p, i) => (
        <p key={i} className={`text-xs leading-relaxed ${TEXT_BODY}`}>
          {p}
        </p>
      ))}
    </div>
  )
}

function Section({
  label,
  text
}: {
  label: string
  text: string | null | undefined
}) {
  if (!text) return null
  return (
    <div className="flex flex-col gap-2">
      <p className={`text-xs font-bold uppercase tracking-widest ${TEXT_MUTED}`}>
        {label}
      </p>
      <TextBlock text={text} />
    </div>
  )
}

function PrecautionsSection({ text }: { text: string | null | undefined }) {
  if (!text) return null
  return (
    <div
      className={`flex flex-col gap-2 border-l-2 rounded-r-lg px-3 py-2.5 ${SURFACE_WARNING} ${BORDER_WARNING}`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-widest ${TEXT_WARNING}`}
      >
        Precautions
      </p>
      <TextBlock text={text} />
    </div>
  )
}

function Divider() {
  return <div className={`border-t ${BORDER_SUBTLE}`} />
}

// ── Modal content ─────────────────────────────────────────────────────────────

function ModalContent({
  drugName,
  narcoticClass,
  atcCode,
  data
}: {
  drugName: string
  narcoticClass?: string | null
  atcCode: string
  data: NonNullable<
    ReturnType<typeof import('../../hooks/useDrugInfo').useDrugInfo>['data']
  >
}) {
  const cachedDate = data.cachedAt
    ? new Date(data.cachedAt).toLocaleDateString('sv-SE')
    : null

  return (
    <>
      <DialogHeader className="px-6 pt-6 pb-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <DialogTitle
              className={`text-base font-semibold ${TEXT_HEADING}`}
            >
              {drugName}
            </DialogTitle>
            <Badge variant="secondary">{atcCode}</Badge>
            {narcoticClass && (
              <span className={`text-xs font-bold ${TEXT_DANGER}`}>
                Narcotic {narcoticClass}
              </span>
            )}
          </div>
          <p className={`text-xs ${TEXT_MUTED}`}>Drug information</p>
        </div>
      </DialogHeader>

      <div className="px-6 py-4 flex flex-col gap-4">
        <Section label="Indications" text={data.indication} />

        {data.indication && (data.precautions || data.sideEffects) && (
          <Divider />
        )}

        {(data.precautions || data.sideEffects) && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <PrecautionsSection text={data.precautions} />
            <Section label="Side Effects" text={data.sideEffects} />
          </div>
        )}

        {(data.precautions || data.sideEffects) &&
          (data.howToUse || data.otherUses) && <Divider />}

        {(data.howToUse || data.otherUses) && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Section label="How to Use" text={data.howToUse} />
            <Section label="Other Uses" text={data.otherUses} />
          </div>
        )}

        {data.otherInfo && (
          <Section label="Other Information" text={data.otherInfo} />
        )}
      </div>

      <div className="px-6 pb-5 pt-0 flex items-center justify-between gap-4">
        <p className={`text-xs flex-1 ${TEXT_MUTED}`}>
          Drug information sourced from{' '}
          <a
            href="https://medlineplus.gov"
            target="_blank"
            rel="noreferrer"
            className={`hover:underline ${TEXT_LINK}`}
          >
            MedlinePlus
          </a>
          , provided by the U.S. National Library of Medicine.
          {cachedDate && ` · cached ${cachedDate}`}
        </p>
        {data.sourceUrl && (
          <a
            href={data.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className={`text-xs hover:underline shrink-0 ${TEXT_LINK}`}
          >
            View source →
          </a>
        )}
      </div>
    </>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DrugInfoCard({
  atcCode,
  drugName,
  narcoticClass
}: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const { data, loading, error } = useDrugInfo(atcCode)

  const hasContent =
    data &&
    (data.indication ||
      data.howToUse ||
      data.otherUses ||
      data.precautions ||
      data.sideEffects ||
      data.otherInfo)

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

      {/* Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full sm:max-w-3xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
          {data && hasContent && (
            <ModalContent
              drugName={drugName}
              narcoticClass={narcoticClass}
              atcCode={atcCode}
              data={data}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
