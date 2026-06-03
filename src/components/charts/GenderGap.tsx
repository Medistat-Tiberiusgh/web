import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import { fmtPer1000 } from '../../lib/format'
import {
  COLOR_AXIS,
  COLOR_AXIS_LABEL,
  COLOR_FEMALE,
  COLOR_GRID,
  COLOR_MALE,
  FONT_TICK
} from '../../theme'
import {
  chartTooltipOptions,
  formatChartTooltip,
  percentGap
} from '../../lib/echartsTooltip'
import EmptyChartState from './EmptyChartState'

type GenderChartPoint = {
  year: number
  genderId: number
  per1000: number
}

export interface GenderGapProps {
  nationalData: GenderChartPoint[]
  regionalData?: GenderChartPoint[]
}

// Chart fills its parent — actual height comes from the parent component
const wrapperStyle: CSSProperties = { width: '100%', height: '100%' }

const MALE_GENDER_ID = 1

function pickPrimaryData(
  nationalData: GenderChartPoint[],
  regionalData: GenderChartPoint[] | undefined
): GenderChartPoint[] {
  if (regionalData && regionalData.length > 0) return regionalData
  return nationalData
}

type GenderByYear = Map<number, { men: number | null; women: number | null }>

function buildGenderByYear(data: GenderChartPoint[]): GenderByYear {
  const byYear: GenderByYear = new Map()
  for (const point of data) {
    const entry = byYear.get(point.year) ?? { men: null, women: null }
    const field = point.genderId === MALE_GENDER_ID ? 'men' : 'women'
    entry[field] = point.per1000
    byYear.set(point.year, entry)
  }
  return byYear
}

function sortedYears(byYear: GenderByYear): number[] {
  return Array.from(byYear.keys()).sort((a, b) => a - b)
}

function valuesByYear(
  years: number[],
  byYear: GenderByYear,
  gender: 'men' | 'women'
): (number | null)[] {
  return years.map((year) => byYear.get(year)![gender])
}

// Men bars extend left from 0 so the chart reads as a tornado
function negateOrKeepNull(value: number | null): number | null {
  return value === null ? null : -value
}

function symmetricAxisMax(
  menData: (number | null)[],
  womenData: (number | null)[]
): number {
  let max = 0
  for (const value of [...menData, ...womenData]) {
    if (value === null) continue
    const magnitude = Math.abs(value)
    if (magnitude > max) max = magnitude
  }
  return max
}

function prepareGenderGapData(
  nationalData: GenderChartPoint[],
  regionalData: GenderChartPoint[] | undefined
) {
  const primaryData = pickPrimaryData(nationalData, regionalData)
  const byYear = buildGenderByYear(primaryData)
  const years = sortedYears(byYear)
  const womenData = valuesByYear(years, byYear, 'women')
  const menData = valuesByYear(years, byYear, 'men').map(negateOrKeepNull)
  const maxAbsValue = symmetricAxisMax(menData, womenData)

  return {
    years,
    menData,
    womenData,
    maxAbsValue
  }
}

type GenderTooltipItem = {
  seriesName?: string
  value?: number | null
  marker?: string
  axisValue?: string | number
}

function absoluteOrNull(item: GenderTooltipItem | undefined): number | null {
  if (typeof item?.value !== 'number') return null
  return Math.abs(item.value)
}

// Statistic significant
const SIMILAR_RATE_THRESHOLD_PERCENT = 5

function genderGapNote(items: GenderTooltipItem[]): string | undefined {
  const men = absoluteOrNull(items.find((p) => p.seriesName === 'Men'))
  const women = absoluteOrNull(items.find((p) => p.seriesName === 'Women'))

  if (men === null || women === null || men <= 0 || women <= 0) return undefined

  const percent = percentGap(men, women)

  if (percent < SIMILAR_RATE_THRESHOLD_PERCENT) {
    return 'Similar rates for both genders'
  }

  const higher = men > women ? 'men' : 'women'
  return `Dispensed to ${higher} ${percent.toFixed(0)}% more`
}

function formatGenderTooltip(params: unknown): string {
  const items = (
    Array.isArray(params) ? params : [params]
  ) as GenderTooltipItem[]
  const visibleItems = items.filter((p) => typeof p.value === 'number')
  if (visibleItems.length === 0) return ''

  return formatChartTooltip({
    title: String(visibleItems[0]?.axisValue ?? ''),
    rows: visibleItems.map((p) => ({
      marker: p.marker,
      label: p.seriesName ?? '',
      value: fmtPer1000(Math.abs(p.value as number))
    })),
    note: genderGapNote(visibleItems)
  })
}

function buildSeries(
  prep: ReturnType<typeof prepareGenderGapData>
): EChartsOption['series'] {
  return [
    {
      name: 'Men',
      type: 'bar',
      stack: 'genders',
      data: prep.menData,
      itemStyle: { color: COLOR_MALE, borderRadius: 2 }
    },
    {
      name: 'Women',
      type: 'bar',
      stack: 'genders',
      data: prep.womenData,
      itemStyle: { color: COLOR_FEMALE, borderRadius: 2 }
    }
  ]
}

function buildOption(
  nationalData: GenderChartPoint[],
  regionalData: GenderChartPoint[] | undefined
): EChartsOption {
  const prep = prepareGenderGapData(nationalData, regionalData)

  return {
    animationDurationUpdate: 0,
    grid: { left: 56, right: 16, top: 16, bottom: 32 },
    xAxis: {
      type: 'value',
      min: -prep.maxAbsValue,
      max: prep.maxAbsValue,
      axisLabel: {
        color: COLOR_AXIS_LABEL,
        fontSize: FONT_TICK,
        formatter: (v: number) => fmtPer1000(Math.abs(v))
      },
      axisLine: { lineStyle: { color: COLOR_AXIS } },
      splitLine: { lineStyle: { color: COLOR_GRID } }
    },
    yAxis: {
      type: 'category',
      data: prep.years.map(String),
      inverse: true,
      axisLabel: { color: COLOR_AXIS_LABEL, fontSize: FONT_TICK },
      axisLine: { lineStyle: { color: COLOR_AXIS } },
      axisTick: { show: false }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: formatGenderTooltip,
      ...chartTooltipOptions
    },
    series: buildSeries(prep)
  }
}

export default function GenderGap({
  nationalData,
  regionalData
}: GenderGapProps) {
  const option = useMemo(
    () => buildOption(nationalData, regionalData),
    [nationalData, regionalData]
  )

  if (nationalData.length === 0) {
    return <EmptyChartState message="No gender data available" />
  }

  return (
    <ReactECharts
      option={option}
      style={wrapperStyle}
      opts={{ renderer: 'svg' }}
    />
  )
}
