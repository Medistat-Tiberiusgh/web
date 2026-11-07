import DrugInfoDialog from '../drug/DrugInfoDialog'
import { useDrugInfo } from '../../hooks/useDrugInfo'
import type { Drug } from '../../types'

/** Loads a drug's MedlinePlus information and shows it in the shared drug dialog. */
export default function MedicationDialog({
  drug,
  onClose
}: {
  drug: Drug
  onClose: () => void
}) {
  const { data, loading } = useDrugInfo(drug.atcCode)
  return (
    <DrugInfoDialog
      atcCode={drug.atcCode}
      drugName={drug.name}
      narcoticClass={drug.narcoticClass}
      info={data}
      loading={loading}
      open
      onOpenChange={(open) => !open && onClose()}
    />
  )
}
