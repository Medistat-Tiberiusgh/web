import { useState } from 'react'
import { Card, Chip, Modal, Skeleton } from '@heroui/react'
import { useDrugInfo } from '../hooks/useDrugInfo'

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
        <p key={i} className="text-xs text-gray-700 leading-relaxed">
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
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </p>
      <TextBlock text={text} />
    </div>
  )
}

function PrecautionsSection({ text }: { text: string | null | undefined }) {
  if (!text) return null
  return (
    <div className="flex flex-col gap-2 bg-amber-50 border-l-2 border-amber-300 rounded-r-lg px-3 py-2.5">
      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
        Precautions
      </p>
      <TextBlock text={text} />
    </div>
  )
}

function Divider() {
  return <div className="border-t border-gray-100" />
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
    ReturnType<typeof import('../hooks/useDrugInfo').useDrugInfo>['data']
  >
}) {
  const cachedDate = data.cachedAt
    ? new Date(data.cachedAt).toLocaleDateString('sv-SE')
    : null

  return (
    <>
      <Modal.Header className="px-6 pt-6 pb-0">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Modal.Heading className="text-base font-semibold text-gray-900">
              {drugName}
            </Modal.Heading>
            <Chip size="sm" variant="soft">
              {atcCode}
            </Chip>
            {narcoticClass && (
              <span className="text-xs font-bold text-red-600">
                Narcotic {narcoticClass}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">Drug information</p>
        </div>
      </Modal.Header>

      <Modal.Body className="px-6 py-4 flex flex-col gap-4">
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
      </Modal.Body>

      <Modal.Footer className="px-6 pb-5 pt-0 flex items-center justify-between gap-4">
        <p className="text-[10px] text-gray-400 flex-1">
          Drug information sourced from{' '}
          <a
            href="https://medlineplus.gov"
            target="_blank"
            rel="noreferrer"
            className="text-teal-600 hover:underline"
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
            className="text-[10px] text-teal-600 hover:underline shrink-0"
          >
            View source →
          </a>
        )}
      </Modal.Footer>
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
        className="flex flex-col cursor-pointer"
        style={{ height: '100%' }}
        onClick={() => hasContent && setIsOpen(true)}
      >
        {/* Header */}
        <Card.Header className="px-4 pt-4 pb-3 flex-row items-start justify-between gap-2 shrink-0">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-900 leading-tight">
              {drugName}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Chip size="sm" variant="soft">
                {atcCode}
              </Chip>
              {narcoticClass && (
                <span className="text-xs font-bold text-red-600">
                  Narcotic {narcoticClass}
                </span>
              )}
            </div>
          </div>
          {hasContent && (
            <span className="text-[10px] text-indigo-500 shrink-0 mt-0.5 font-medium">
              Read more →
            </span>
          )}
        </Card.Header>

        {/* Preview body */}
        <Card.Content className="flex-1 min-h-0 overflow-hidden px-4 pb-4 pt-0 relative flex flex-col gap-4">
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
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Indications
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {data.indication.replace(/\n+/g, ' ')}
                  </p>
                </div>
              )}
              {data.precautions && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Precautions
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {data.precautions.replace(/\n+/g, ' ')}
                  </p>
                </div>
              )}
              {data.sideEffects && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Side Effects
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {data.sideEffects.replace(/\n+/g, ' ')}
                  </p>
                </div>
              )}
              {/* fade-out at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-linear-to-t from-white to-transparent pointer-events-none" />
            </>
          ) : (
            <p className="text-xs text-gray-400">No information available.</p>
          )}
        </Card.Content>
      </Card>

      {/* Modal */}
      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen} variant="blur">
        <Modal.Container scroll="inside">
          <Modal.Dialog className="w-full sm:max-w-3xl">
            <Modal.CloseTrigger />
            {data && hasContent && (
              <ModalContent
                drugName={drugName}
                narcoticClass={narcoticClass}
                atcCode={atcCode}
                data={data}
              />
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  )
}
