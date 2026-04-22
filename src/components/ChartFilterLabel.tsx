import type { AgeBand } from '../hooks/useFilters'

interface Props {
  year?: number | null
  regionName?: string | null
  gender?: string | null
  ageBand?: AgeBand | null
}

/**
 * Renders active filter values as colored inline text for use inside card titles.
 * Colors match the navbar filter chips (violet/teal/rose/amber).
 */
export default function ChartFilterLabel({ year, regionName, gender, ageBand }: Props) {
  return (
    <>
      {year && <> · <span className="text-violet-600">{year}</span></>}
      {regionName && <> · <span className="text-teal-600">{regionName}</span></>}
      {gender && <> · <span className="text-rose-500">{gender === 'men' ? 'Men' : 'Women'}</span></>}
      {ageBand && <> · <span className="text-amber-600">{ageBand.name} yrs</span></>}
    </>
  )
}
