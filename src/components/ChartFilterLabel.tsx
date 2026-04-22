import type { AgeBand } from '../hooks/useFilters'
import { COLOR_YEAR, COLOR_REGIONAL, COLOR_GENDER, COLOR_AGE_BAND } from '../theme'

interface Props {
  year?: number | null
  regionName?: string | null
  gender?: string | null
  ageBand?: AgeBand | null
}

/**
 * Renders active filter values as colored inline text for use inside card titles.
 * Colors come from theme constants so they stay in sync with chart colors.
 */
export default function ChartFilterLabel({ year, regionName, gender, ageBand }: Props) {
  return (
    <>
      {year && <> · <span style={{ color: COLOR_YEAR }}>{year}</span></>}
      {regionName && <> · <span style={{ color: COLOR_REGIONAL }}>{regionName}</span></>}
      {gender && <> · <span style={{ color: COLOR_GENDER }}>{gender === 'men' ? 'Men' : 'Women'}</span></>}
      {ageBand && <> · <span style={{ color: COLOR_AGE_BAND }}>{ageBand.name} yrs</span></>}
    </>
  )
}
