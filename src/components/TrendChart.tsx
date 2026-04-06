import type { TrendPoint } from '../types'

interface Props {
  data: TrendPoint[]
  drugName: string
}

const W = 600
const H = 260
const PAD = { top: 20, right: 20, bottom: 40, left: 60 }
const INNER_W = W - PAD.left - PAD.right
const INNER_H = H - PAD.top - PAD.bottom

function scaleX(year: number, minYear: number, maxYear: number) {
  return PAD.left + ((year - minYear) / (maxYear - minYear || 1)) * INNER_W
}

function scaleY(value: number, minVal: number, maxVal: number) {
  return PAD.top + INNER_H - ((value - minVal) / (maxVal - minVal || 1)) * INNER_H
}

function buildPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return ''
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ')
}

export default function TrendChart({ data, drugName }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        No trend data available
      </div>
    )
  }

  const years = data.map((d) => d.year)
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)

  const prescValues = data.map((d) => d.totalPrescriptions)
  const patientValues = data.map((d) => d.totalPatients)
  const maxVal = Math.max(...prescValues, ...patientValues)
  const minVal = 0

  const prescPoints = data.map((d) => ({
    x: scaleX(d.year, minYear, maxYear),
    y: scaleY(d.totalPrescriptions, minVal, maxVal),
    data: d,
  }))

  const patientPoints = data.map((d) => ({
    x: scaleX(d.year, minYear, maxYear),
    y: scaleY(d.totalPatients, minVal, maxVal),
    data: d,
  }))

  const prescPath = buildPath(prescPoints)
  const patientPath = buildPath(patientPoints)

  // Area fill under prescriptions line
  const areaPath =
    prescPath +
    ` L ${prescPoints[prescPoints.length - 1].x.toFixed(1)} ${(PAD.top + INNER_H).toFixed(1)}` +
    ` L ${prescPoints[0].x.toFixed(1)} ${(PAD.top + INNER_H).toFixed(1)} Z`

  // Y-axis tick labels (4 ticks)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = (maxVal / 4) * i
    const y = scaleY(val, minVal, maxVal)
    return { val, y }
  })

  // X-axis ticks: show every 3rd year
  const xTicks = data.filter((_, i) => i % 3 === 0 || data[i].year === maxYear)

  function fmt(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`
    return `${n}`
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">19-Year Prescription Velocity</h3>
          <p className="text-xs text-gray-400 mt-0.5">{drugName} · national totals 2006–2024</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 bg-blue-700 inline-block rounded" />
            Prescriptions
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-0.5 bg-gray-400 inline-block rounded border-dashed border-t border-gray-400" />
            Patients
          </span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full flex-1"
        style={{ minHeight: 0 }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map(({ val, y }) => (
          <g key={val}>
            <line
              x1={PAD.left}
              y1={y}
              x2={PAD.left + INNER_W}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={10}
              fill="#9ca3af"
            >
              {fmt(val)}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Patients dashed line */}
        <path
          d={patientPath}
          fill="none"
          stroke="#9ca3af"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />

        {/* Prescriptions line */}
        <path d={prescPath} fill="none" stroke="#1d4ed8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots on prescriptions line */}
        {prescPoints.map(({ x, y, data: d }) => (
          <circle key={d.year} cx={x} cy={y} r={3} fill="#1d4ed8" />
        ))}

        {/* X-axis labels */}
        {xTicks.map((d) => (
          <text
            key={d.year}
            x={scaleX(d.year, minYear, maxYear)}
            y={PAD.top + INNER_H + 20}
            textAnchor="middle"
            fontSize={10}
            fill="#9ca3af"
          >
            {d.year}
          </text>
        ))}

        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + INNER_H} stroke="#e5e7eb" />
        <line x1={PAD.left} y1={PAD.top + INNER_H} x2={PAD.left + INNER_W} y2={PAD.top + INNER_H} stroke="#e5e7eb" />
      </svg>
    </div>
  )
}
