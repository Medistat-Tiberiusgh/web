// ── Semantic chart colors ─────────────────────────────────────────────────────
// Import these wherever you need a chart color so all charts stay in sync.

/** App wordmark / brand color */
export const COLOR_BRAND = '#0d9488' // teal-600
/** National trend line / national bars */
export const COLOR_NATIONAL = '#1d4ed8' // blue-700
/** Regional / selected-region trend line and highlights */
export const COLOR_REGIONAL = '#0d9488' // teal-600
/** Male bars — full intensity (user is male, or gender unknown) */
export const COLOR_MALE = '#0ea5e9' // sky-500
/** Male bars — muted (user is female) */
export const COLOR_MALE_MUTED = '#7dd3fc' // sky-300
/** Male color used for national column when a regional column is also shown */
export const COLOR_MALE_NAT = '#38bdf8' // sky-400
/** Female bars — full intensity (user is female, or gender unknown) */
export const COLOR_FEMALE = '#f43f5e' // rose-500
/** Female bars — muted (user is male) */
export const COLOR_FEMALE_MUTED = '#fda4af' // rose-300
/** Active age band filter — chip, highlight ring, inline label */
export const COLOR_AGE_BAND = '#d97706' // amber-600
/** Active gender filter — chip, inline label */
export const COLOR_GENDER = '#f43f5e' // rose-500
/** Selected year band / annotation */
export const COLOR_YEAR = '#7c3aed' // violet-700
/** Trend sparkline — growing (mirrors map "above average" orange-red scale) */
export const COLOR_TREND_UP = '#c2410c' // orange-700
/** Trend sparkline — shrinking */
export const COLOR_TREND_DOWN = '#6b7280' // gray-500
/** Trend sparkline — stable / flat */
export const COLOR_TREND_FLAT = '#9ca3af' // gray-400
/** National sparkline shown as dashed background behind regional sparkline */
export const COLOR_SPARK_NAT = '#d1d5db' // gray-300
/** SVG chart grid lines */
export const COLOR_GRID = '#f3f4f6' // gray-100
/** SVG chart axis lines */
export const COLOR_AXIS = '#e5e7eb' // gray-200
/** SVG axis tick label text */
export const COLOR_AXIS_LABEL = '#9ca3af' // gray-400

// ── SVG font sizes (px) ───────────────────────────────────────────────────────
// Use in fontSize={} on SVG <text> elements. Do NOT use Tailwind classes there.

/** Axis tick values — x/y data labels */
export const FONT_TICK = 10
/** Secondary SVG text — axis title, in-bar year labels, column headers */
export const FONT_LABEL = 9
