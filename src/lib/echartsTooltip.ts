import {
  COLOR_TOOLTIP_BG,
  COLOR_TOOLTIP_BORDER,
  COLOR_TOOLTIP_NOTE,
  COLOR_TOOLTIP_TEXT,
  FONT_TOOLTIP,
  FONT_TOOLTIP_NOTE
} from '../theme'

/** Spread into ECharts option.tooltip to give the card a consistent look. */
export const chartTooltipOptions = {
  backgroundColor: COLOR_TOOLTIP_BG,
  borderColor: COLOR_TOOLTIP_BORDER,
  borderWidth: 1,
  borderRadius: 8,
  padding: 0,
  textStyle: { color: COLOR_TOOLTIP_TEXT, fontSize: FONT_TOOLTIP },
  extraCssText:
    'box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);'
}

export type TooltipRow = {
  marker?: string
  label: string
  value: string
}

/**
 * Colored circle marker HTML — matches ECharts' default series marker. Use in
 * a TooltipRow's `marker` when the chart's series doesn't carry a single color
 * (e.g. heatmap cells whose color comes from visualMap, not from the series).
 */
export function colorDot(color: string): string {
  return `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-right:6px;vertical-align:middle"></span>`
}

/**
 * Percent difference between two positive numbers, measured against the smaller.
 * Unsigned magnitude — always positive. Use when neither value is a baseline
 * (e.g. men vs women, age band vs age band).
 */
export function percentGap(a: number, b: number): number {
  const max = Math.max(a, b)
  const min = Math.min(a, b)
  return ((max - min) / min) * 100
}

/**
 * Signed percent change of `value` relative to `baseline`. Positive when value
 * is above baseline, negative when below. Use when one side is the reference
 * (e.g. regional vs national).
 */
export function percentChange(value: number, baseline: number): number {
  return ((value - baseline) / baseline) * 100
}

/**
 * Produces an HTML string for an ECharts tooltip formatter.
 * Layout: title (with bottom border) | rows | optional muted footer note (with top border).
 */
export function formatChartTooltip(data: {
  title: string
  rows: TooltipRow[]
  note?: string
}): string {
  const titleHtml = `<div style="padding:8px 12px;border-bottom:1px solid ${COLOR_TOOLTIP_BORDER};font-weight:600">${data.title}</div>`

  const rowsHtml = `<div style="padding:8px 12px">${data.rows
    .map((row) => `${row.marker ?? ''} ${row.label}: <b>${row.value}</b>`)
    .join('<br/>')}</div>`

  const noteHtml = data.note
    ? `<div style="padding:6px 12px;border-top:1px solid ${COLOR_TOOLTIP_BORDER};color:${COLOR_TOOLTIP_NOTE};font-size:${FONT_TOOLTIP_NOTE}px">${data.note}</div>`
    : ''

  return `${titleHtml}${rowsHtml}${noteHtml}`
}
