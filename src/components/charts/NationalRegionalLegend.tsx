import {
  COLOR_NATIONAL,
  COLOR_REGIONAL,
  COLOR_LEGEND_TEXT,
  FONT_LEGEND
} from '../../theme'

export function NationalRegionalLegend({ regionName }: { regionName: string | null }) {
  return (
    <div
      className="flex items-center gap-3 shrink-0"
      style={{ fontSize: FONT_LEGEND, color: COLOR_LEGEND_TEXT }}
    >
      {regionName && (
        <span className="flex items-center gap-1.5">
          <span
            className="w-4 h-1.5 rounded-full inline-block"
            style={{ backgroundColor: COLOR_REGIONAL }}
          />
          {regionName}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <span
          className="w-4 h-1.5 rounded-full inline-block"
          style={{ backgroundColor: COLOR_NATIONAL }}
        />
        National
      </span>
    </div>
  )
}
