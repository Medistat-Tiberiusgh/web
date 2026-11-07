import { fmtPer1000 } from './format'

export type Tone = 'up' | 'down' | 'even'

// Within ±5% of the comparison counts as "about the same".
const EVEN_RANGE = 0.05

export function ratioTone(ratio: number): Tone {
  if (Math.abs(ratio - 1) <= EVEN_RANGE) return 'even'
  return ratio > 1 ? 'up' : 'down'
}

/** "↑ 3.0×", "↓ 0.18×", "≈ 0.96×" */
export function ratioLabel(ratio: number) {
  const arrow = { up: '↑', down: '↓', even: '≈' }[ratioTone(ratio)]
  const digits = ratio < 1 ? 2 : 1
  return `${arrow} ${ratio.toFixed(digits)}×`
}

/** "↑ ×31.6" for growth, "↓ −99%" for a decline */
export function growthLabel(growth: number) {
  if (growth >= 1) return `↑ ×${growth.toFixed(1)}`
  return `↓ −${Math.round((1 - growth) * 100)}%`
}

/** "9.3 vs 3.1 per 1,000", or "9.3 per 1,000" when there is nothing to compare with */
export function rateDetail(per1000: number, baselinePer1000: number | null) {
  if (baselinePer1000 === null) return `${fmtPer1000(per1000)} per 1,000`
  return `${fmtPer1000(per1000)} vs ${fmtPer1000(baselinePer1000)} per 1,000`
}

/** "8.4 → 266.0 per 1,000" */
export function changeDetail(startPer1000: number, latestPer1000: number) {
  return `${fmtPer1000(startPer1000)} → ${fmtPer1000(latestPer1000)} per 1,000`
}
