/** Parse a `#rrggbb` hex string into its [r, g, b] channels (0–255). */
export function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16)
  ]
}

/** Linear blend between two hex colors; t runs 0 (from) → 1 (to). */
export function mixColor(fromHex: string, toHex: string, t: number): string {
  const [fromR, fromG, fromB] = hexToRgb(fromHex)
  const [toR, toG, toB] = hexToRgb(toHex)
  const r = Math.round(fromR + t * (toR - fromR))
  const g = Math.round(fromG + t * (toG - fromG))
  const b = Math.round(fromB + t * (toB - fromB))
  return `rgb(${r},${g},${b})`
}
