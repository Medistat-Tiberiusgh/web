/**
 * Format a per-1,000 value with enough decimal places to show meaningful precision.
 * - >= 1   → 1 dp  ("1.3")
 * - < 1    → 2 dp  ("0.04")  — DB stores numeric(10,2) so 2dp is the max useful precision
 */
export function fmtPer1000(v: number): string {
  if (v < 1 && v > 0) return v.toFixed(2)
  return v.toFixed(1)
}

/**
 * Format a per-1,000 delta with sign and adaptive precision.
 * Avoids the JavaScript -0 trap where "-0.0" renders as "+0.0".
 */
export function fmtPer1000Delta(n: number): string {
  const abs = Math.abs(n)
  const formatted = abs < 1 && abs > 0.005 ? abs.toFixed(2) : abs.toFixed(1)
  if (abs < 0.005) return '+0.0'  // truly zero after rounding
  return `${n > 0 ? '+' : ''}${n < 0 ? '-' : ''}${formatted}`
}
