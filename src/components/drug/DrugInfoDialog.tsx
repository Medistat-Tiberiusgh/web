import { Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { hasDrugInfoContent, type DrugInfo } from '../../hooks/useDrugInfo'
import {
  TEXT_HEADING,
  TEXT_BODY,
  TEXT_MUTED,
  TEXT_DANGER,
  TEXT_LINK,
  BORDER_SUBTLE,
  SURFACE_WARNING,
  BORDER_WARNING,
  TEXT_WARNING
} from '@/theme'

interface Props {
  atcCode: string
  drugName: string
  narcoticClass?: string | null
  info: DrugInfo | null
  loading: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function DrugInfoDialog({
  atcCode,
  drugName,
  narcoticClass,
  info,
  loading,
  open,
  onOpenChange
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-3xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DrugHeader
          drugName={drugName}
          narcoticClass={narcoticClass}
          atcCode={atcCode}
        />
        <DrugInfoBody info={info} loading={loading} />
      </DialogContent>
    </Dialog>
  )
}

function DrugInfoBody({
  info,
  loading
}: {
  info: DrugInfo | null
  loading: boolean
}) {
  if (loading) {
    return (
      <p
        role="status"
        className={`flex items-center gap-2 px-6 py-5 text-xs ${TEXT_MUTED}`}
      >
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Loading drug information…
      </p>
    )
  }
  if (!info || !hasDrugInfoContent(info)) {
    return (
      <p className={`px-6 py-5 text-xs ${TEXT_MUTED}`}>
        MedlinePlus has no information about this medication.
      </p>
    )
  }
  return (
    <>
      <DrugInfoSections info={info} />
      <SourceFooter info={info} />
    </>
  )
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
      <p
        className={`text-xs font-bold uppercase tracking-widest ${TEXT_MUTED}`}
      >
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

function DrugHeader({
  drugName,
  narcoticClass,
  atcCode
}: {
  drugName: string
  narcoticClass?: string | null
  atcCode: string
}) {
  return (
    <DialogHeader className="px-6 pt-6 pb-0">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <DialogTitle className={`text-base font-semibold ${TEXT_HEADING}`}>
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
  )
}

function DrugInfoSections({ info }: { info: DrugInfo }) {
  return (
    <div className="px-6 py-4 flex flex-col gap-4">
      <Section label="Indications" text={info.indication} />

      {info.indication && (info.precautions || info.sideEffects) && <Divider />}

      {(info.precautions || info.sideEffects) && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <PrecautionsSection text={info.precautions} />
          <Section label="Side Effects" text={info.sideEffects} />
        </div>
      )}

      {(info.precautions || info.sideEffects) &&
        (info.howToUse || info.otherUses) && <Divider />}

      {(info.howToUse || info.otherUses) && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <Section label="How to Use" text={info.howToUse} />
          <Section label="Other Uses" text={info.otherUses} />
        </div>
      )}

      {info.otherInfo && (
        <Section label="Other Information" text={info.otherInfo} />
      )}
    </div>
  )
}

function SourceFooter({ info }: { info: DrugInfo }) {
  const cachedDate = info.cachedAt
    ? new Date(info.cachedAt).toLocaleDateString('sv-SE')
    : null

  return (
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
      {info.sourceUrl && (
        <a
          href={info.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className={`text-xs hover:underline shrink-0 ${TEXT_LINK}`}
        >
          View source →
        </a>
      )}
    </div>
  )
}
