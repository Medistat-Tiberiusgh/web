import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import type { AgeSplitPoint } from '../../../types'
import EmptyChartState from '../EmptyChartState'
import { fmtPer1000 } from '../../../lib/format'
import {
  chartTooltipOptions,
  colorDot,
  formatChartTooltip,
  percentChange
} from '../../../lib/echartsTooltip'
import {
  COLOR_AGE_BAND,
  COLOR_AGE_LABEL,
  COLOR_AXIS,
  COLOR_AXIS_LABEL,
  COLOR_GRID,
  COLOR_NATIONAL,
  COLOR_REGIONAL,
  FONT_TICK
} from '../../../theme'

interface Props {
  data: AgeSplitPoint[]
  regionalData?: AgeSplitPoint[]
  latestYear: number | null
  selectedYear?: number | null
  regionName?: string | null
  filterAgeBand?: string | null
}

// Chart fills its parent — actual height comes from the parent component
const wrapperStyle: CSSProperties = { width: '100%', height: '100%' }

// Below this magnitude the trend is treated as flat (no clear direction)
const TREND_FLAT_THRESHOLD_PERCENT = 5

const NATIONAL_SERIES_NAME = 'National'
const DEFAULT_REGIONAL_SERIES_NAME = 'Regional'

type AgeBandRow = {
  id: number
  name: string
  national: number | null
  regional: number | null
  trendArrow: string
  trendLabel: string
  trendFromRegional: boolean
}

type YearLookup = Map<number, Map<number, number>>

function buildLookup(points: AgeSplitPoint[]): YearLookup {
  const map: YearLookup = new Map()
  for (const point of points) {
    if (!map.has(point.ageGroupId)) map.set(point.ageGroupId, new Map())
    map.get(point.ageGroupId)!.set(point.year, point.per1000)
  }
  return map
}

function uniqueYears(points: AgeSplitPoint[]): number[] {
  return [...new Set(points.map((p) => p.year))].sort((a, b) => a - b)
}

function uniqueAgeGroups(points: AgeSplitPoint[]): [number, string][] {
  const byId = new Map<number, string>()
  for (const point of [...points].sort((a, b) => a.ageGroupId - b.ageGroupId)) {
    byId.set(point.ageGroupId, point.ageGroupName)
  }
  return [...byId.entries()]
}

function valuesAcrossYears(
  id: number,
  years: number[],
  lookup: YearLookup
): number[] {
  return years
    .map((year) => lookup.get(id)?.get(year) ?? null)
    .filter((value): value is number => value !== null)
}

function trendArrowFor(percent: number | null): string {
  if (percent === null) return '→'
  if (percent > TREND_FLAT_THRESHOLD_PERCENT) return '↑'
  if (percent < -TREND_FLAT_THRESHOLD_PERCENT) return '↓'
  return '→'
}

function buildTrend(
  series: number[],
  firstYear: number | null
): { arrow: string; label: string } {
  if (series.length < 2 || firstYear === null) return { arrow: '→', label: '' }
  const first = series[0]
  const last = series.at(-1)!
  if (first <= 0) return { arrow: '→', label: '' }
  const percent = percentChange(last, first)
  const arrow = trendArrowFor(percent)
  const sign = percent > 0 ? '+' : ''
  return {
    arrow,
    label: `${sign}${percent.toFixed(0)}% since '${String(firstYear).slice(2)}`
  }
}

function pickEffectiveYear(
  years: number[],
  latestYear: number | null
): number | null {
  if (years.length === 0) return null
  if (latestYear != null && years.includes(latestYear)) return latestYear
  return years.at(-1) ?? null
}

function pickRowYear(
  allYears: number[],
  regionalYears: number[],
  latestYear: number | null
): number | null {
  const sharedYears =
    regionalYears.length > 0
      ? allYears.filter((year) => regionalYears.includes(year))
      : allYears
  const yearPool = sharedYears.length > 0 ? sharedYears : allYears
  return pickEffectiveYear(yearPool, latestYear)
}

type RowContext = {
  effectiveYear: number | null
  trendYears: number[]
  firstTrendYear: number | null
  nationalLookup: YearLookup
  regionalLookup: YearLookup
  hasRegional: boolean
}

function buildRowFor(
  id: number,
  name: string,
  context: RowContext
): AgeBandRow {
  const national =
    context.nationalLookup.get(id)?.get(context.effectiveYear ?? -1) ?? null
  const regional =
    context.regionalLookup.get(id)?.get(context.effectiveYear ?? -1) ?? null

  // Trend uses the primary data source (regional if available, else national)
  const nationalSeries = valuesAcrossYears(
    id,
    context.trendYears,
    context.nationalLookup
  )
  const regionalSeries = valuesAcrossYears(
    id,
    context.trendYears,
    context.regionalLookup
  )
  const trendFromRegional = context.hasRegional && regionalSeries.length > 0
  const primarySeries = trendFromRegional ? regionalSeries : nationalSeries

  const { arrow, label } = buildTrend(primarySeries, context.firstTrendYear)
  return {
    id,
    name,
    national,
    regional,
    trendArrow: arrow,
    trendLabel: label,
    trendFromRegional
  }
}

function buildRows(
  data: AgeSplitPoint[],
  regionalData: AgeSplitPoint[] | undefined,
  latestYear: number | null,
  selectedYear: number | null | undefined
): AgeBandRow[] {
  const ageGroups = uniqueAgeGroups(data)
  const allYears = uniqueYears(data)
  const nationalLookup = buildLookup(data)
  const regionalLookup = buildLookup(regionalData ?? [])
  const hasRegional = (regionalData ?? []).length > 0
  const regionalYears = hasRegional ? uniqueYears(regionalData ?? []) : []

  const effectiveYear = pickRowYear(allYears, regionalYears, latestYear)
  const trendYears = selectedYear
    ? allYears.filter((year) => year <= selectedYear)
    : allYears
  const firstTrendYear = trendYears.at(0) ?? null

  const context: RowContext = {
    effectiveYear,
    trendYears,
    firstTrendYear,
    nationalLookup,
    regionalLookup,
    hasRegional
  }
  return ageGroups.map(([id, name]) => buildRowFor(id, name, context))
}

function seriesColor(seriesName: string, regionalSeriesName: string): string {
  return seriesName === regionalSeriesName ? COLOR_REGIONAL : COLOR_NATIONAL
}

function formatPer1000OrDash(value: number): string {
  return typeof value === 'number' && value > 0 ? fmtPer1000(value) : '—'
}

// Names the source so the user knows the % change is for the region they picked
function trendNote(
  row: AgeBandRow,
  regionalSeriesName: string
): string | undefined {
  if (!row.trendLabel) return undefined
  const source = row.trendFromRegional ? regionalSeriesName : NATIONAL_SERIES_NAME
  return `${row.trendArrow} ${source}: ${row.trendLabel}`
}

function tooltipFormatter(
  rows: AgeBandRow[],
  regionalSeriesName: string
): (params: unknown) => string {
  return (params) => {
    const items = params as {
      axisValue: string
      value: number
      seriesName: string
    }[]
    if (items.length === 0) return ''

    const ageBandName = items[0].axisValue
    const row = rows.find((r) => r.name === ageBandName)
    if (!row) return ''

    return formatChartTooltip({
      title: ageBandName,
      rows: items.map((item) => ({
        marker: colorDot(seriesColor(item.seriesName, regionalSeriesName)),
        label: item.seriesName,
        value: formatPer1000OrDash(item.value)
      })),
      note: trendNote(row, regionalSeriesName)
    })
  }
}

function buildOption(
  rows: AgeBandRow[],
  hasRegional: boolean,
  regionName: string | null,
  filterAgeBand: string | null
): EChartsOption {
  const regionalSeriesName = regionName ?? DEFAULT_REGIONAL_SERIES_NAME

  const categories = rows.map((r) => r.name)

  const series: EChartsOption['series'] = []
  if (hasRegional) {
    series.push({
      name: regionalSeriesName,
      type: 'bar',
      data: rows.map((r) => r.regional),
      itemStyle: { color: COLOR_REGIONAL, borderRadius: [0, 3, 3, 0] }
    })
  }
  series.push({
    name: NATIONAL_SERIES_NAME,
    type: 'bar',
    data: rows.map((r) => r.national),
    itemStyle: { color: COLOR_NATIONAL, borderRadius: [0, 3, 3, 0] }
  })

  return {
    animationDurationUpdate: 0,
    grid: { left: 60, right: 16, top: 8, bottom: 24 },
    xAxis: {
      type: 'value',
      axisLabel: {
        color: COLOR_AXIS_LABEL,
        fontSize: FONT_TICK,
        formatter: (v: number) => fmtPer1000(v)
      },
      axisLine: { lineStyle: { color: COLOR_AXIS } },
      splitLine: { lineStyle: { color: COLOR_GRID } }
    },
    yAxis: {
      type: 'category',
      data: categories,
      inverse: true,
      axisLine: { lineStyle: { color: COLOR_AXIS } },
      axisTick: { show: false },
      axisLabel: {
        fontSize: FONT_TICK,
        formatter: (value: string) =>
          filterAgeBand === value ? `{filtered|${value}}` : `{label|${value}}`,
        rich: {
          label: { color: COLOR_AGE_LABEL, fontSize: FONT_TICK },
          filtered: {
            color: COLOR_AGE_BAND,
            fontSize: FONT_TICK,
            fontWeight: 'bold'
          }
        }
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: tooltipFormatter(rows, regionalSeriesName),
      ...chartTooltipOptions
    },
    series
  }
}

export default function AgeBandTrends({
  data,
  regionalData,
  latestYear,
  selectedYear,
  regionName,
  filterAgeBand
}: Props) {
  const hasRegional = (regionalData ?? []).length > 0

  const option = useMemo(() => {
    const rows = buildRows(data, regionalData, latestYear, selectedYear)
    return buildOption(
      rows,
      hasRegional,
      regionName ?? null,
      filterAgeBand ?? null
    )
  }, [
    data,
    regionalData,
    latestYear,
    selectedYear,
    regionName,
    filterAgeBand,
    hasRegional
  ])

  if (data.length === 0) {
    return <EmptyChartState message="No age band data available" />
  }

  return (
    <ReactECharts
      option={option}
      style={wrapperStyle}
      opts={{ renderer: 'svg' }}
      notMerge
    />
  )
}
