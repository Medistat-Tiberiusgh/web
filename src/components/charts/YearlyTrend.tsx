import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption, EChartsType } from 'echarts'
import { fmtPer1000 } from '../../lib/format'
import {
  chartTooltipOptions,
  formatChartTooltip,
  percentChange
} from '../../lib/echartsTooltip'
import EmptyChartState from './EmptyChartState'
import {
  COLOR_AXIS,
  COLOR_AXIS_LABEL,
  COLOR_GRID,
  COLOR_NATIONAL,
  COLOR_REGIONAL,
  COLOR_YEAR,
  FONT_LABEL,
  FONT_TICK
} from '../../theme'

type TrendChartPoint = { year: number; per1000: number }

export interface YearlyTrendProps {
  nationalData: TrendChartPoint[]
  regionalData?: TrendChartPoint[]
  regionName: string | null
  selectedYear: number | null
  onYearChange?: (year: number | null) => void
}

// Chart fills its parent — the actual height comes from the card slot in
// ChartsGridSection
const wrapperStyle: CSSProperties = { width: '100%', height: '100%' }

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function areaFadeGradient(color: string) {
  return {
    type: 'linear' as const,
    x: 0,
    y: 0,
    x2: 0,
    y2: 1,
    colorStops: [
      { offset: 0, color: hexToRgba(color, 0.12) },
      { offset: 1, color: hexToRgba(color, 0) }
    ]
  }
}

function lineSeries(name: string, values: (number | null)[], color: string) {
  return {
    name,
    type: 'line' as const,
    data: values,
    smooth: true,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: { color, width: 2.5 },
    itemStyle: { color },
    areaStyle: { color: areaFadeGradient(color) },
    emphasis: { scale: 1.5 }
  }
}

function selectedYearMarkLine(year: number | null) {
  const has = year != null
  return {
    silent: true,
    symbol: 'none',
    label: {
      show: true,
      position: 'insideEndTop' as const,
      color: COLOR_YEAR,
      fontSize: FONT_LABEL,
      fontWeight: 'bold' as const,
      formatter: has ? String(year) : ''
    },
    lineStyle: {
      color: COLOR_YEAR,
      width: 1.5,
      type: 'dashed' as const
    },
    data: has ? [{ xAxis: String(year) }] : []
  }
}

function pickValidYear(
  year: number | null,
  validYears: number[]
): number | null {
  if (year === null) return null
  if (!validYears.includes(year)) return null
  return year
}

function prepareTrendData(
  nationalData: TrendChartPoint[],
  regionalData: TrendChartPoint[] | undefined,
  selectedYear: number | null
) {
  const years = nationalData.map((d) => d.year)
  const nationalValues = nationalData.map((d) => d.per1000)
  const regionalValues = regionalData
    ? years.map(
        (y) => regionalData.find((d) => d.year === y)?.per1000 ?? null
      )
    : null
  return {
    years,
    nationalValues,
    regionalValues,
    hasRegional: !!regionalValues,
    lastIndex: years.length - 1,
    effectiveSelectedYear: pickValidYear(selectedYear, years)
  }
}

function buildSeries(
  prep: ReturnType<typeof prepareTrendData>,
  regionName: string | null
): EChartsOption['series'] {
  const series: EChartsOption['series'] = []

  if (prep.hasRegional && prep.regionalValues) {
    series.push(
      lineSeries(
        regionName ?? 'Regional',
        prep.regionalValues,
        COLOR_REGIONAL
      )
    )
  }

  series.push({
    ...lineSeries('National', prep.nationalValues, COLOR_NATIONAL),
    markLine: selectedYearMarkLine(prep.effectiveSelectedYear)
  })

  return series
}

type TooltipItem = {
  seriesName?: string
  value?: number | null
  marker?: string
  axisValue?: string | number
}

function regionalDiffNote(items: TooltipItem[]): string | undefined {
  const nationalItem = items.find((p) => p.seriesName === 'National')
  const regionalItem = items.find((p) => p.seriesName !== 'National')
  const nationalValue = nationalItem?.value
  const regionalValue = regionalItem?.value

  if (
    typeof nationalValue !== 'number' ||
    typeof regionalValue !== 'number' ||
    nationalValue <= 0
  ) {
    return undefined
  }

  const percent = percentChange(regionalValue, nationalValue)
  const direction = percent > 0 ? 'higher' : 'lower'
  const regionalLabel = regionalItem?.seriesName ?? 'Regional'
  return `${regionalLabel} ${Math.abs(percent).toFixed(0)}% ${direction} than national`
}

function formatTooltip(params: unknown): string {
  const items = (Array.isArray(params) ? params : [params]) as TooltipItem[]
  return formatChartTooltip({
    title: String(items[0]?.axisValue ?? ''),
    rows: items.map((p) => ({
      marker: p.marker,
      label: p.seriesName ?? '',
      value: typeof p.value === 'number' ? fmtPer1000(p.value) : '—'
    })),
    note: regionalDiffNote(items)
  })
}

function yearAtClick(
  chart: EChartsType,
  event: { offsetX: number; offsetY: number },
  nationalData: TrendChartPoint[]
): number | null {
  const point: [number, number] = [event.offsetX, event.offsetY]
  if (!chart.containPixel('grid', point)) return null
  const index = Math.round(
    chart.convertFromPixel({ xAxisIndex: 0 }, point[0])
  )
  return nationalData[index]?.year ?? null
}

function buildOption(
  nationalData: TrendChartPoint[],
  regionalData: TrendChartPoint[] | undefined,
  regionName: string | null,
  selectedYear: number | null
): EChartsOption {
  const prep = prepareTrendData(nationalData, regionalData, selectedYear)

  return {
    animationDurationUpdate: 0,
    grid: { left: 56, right: 16, top: 24, bottom: 32 },
    xAxis: {
      type: 'category',
      data: prep.years.map(String),
      boundaryGap: false,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: COLOR_AXIS } },
      axisLabel: {
        color: COLOR_AXIS_LABEL,
        fontSize: FONT_TICK,
        interval: (idx: number) => idx % 3 === 0 || idx === prep.lastIndex,
        margin: 10
      }
    },
    yAxis: {
      type: 'value',
      name: 'per 1,000 inhabitants',
      nameLocation: 'middle',
      nameGap: 40,
      nameTextStyle: { color: COLOR_AXIS_LABEL, fontSize: FONT_LABEL },
      axisLabel: {
        color: COLOR_AXIS_LABEL,
        fontSize: FONT_TICK,
        formatter: (v: number) => fmtPer1000(v)
      },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: COLOR_GRID } }
    },
    tooltip: {
      trigger: 'axis',
      formatter: formatTooltip,
      ...chartTooltipOptions
    },
    series: buildSeries(prep, regionName)
  }
}

export default function YearlyTrend({
  nationalData,
  regionalData,
  regionName,
  selectedYear,
  onYearChange
}: YearlyTrendProps) {
  const option = useMemo(
    () => buildOption(nationalData, regionalData, regionName, selectedYear),
    [nationalData, regionalData, regionName, selectedYear]
  )

  const [chart, setChart] = useState<EChartsType | null>(null)

  useEffect(() => {
    if (!chart) return
    const zrender = chart.getZr()
    const handler = (event: { offsetX: number; offsetY: number }) => {
      const year = yearAtClick(chart, event, nationalData)
      if (year === null) return
      onYearChange?.(selectedYear === year ? null : year)
    }
    zrender.on('click', handler)
    return () => zrender.off('click', handler)
  }, [chart, nationalData, selectedYear, onYearChange])

  if (nationalData.length === 0) {
    return <EmptyChartState message="No trend data available" />
  }

  return (
    <ReactECharts
      option={option}
      style={wrapperStyle}
      opts={{ renderer: 'svg' }}
      onChartReady={setChart}
    />
  )
}
