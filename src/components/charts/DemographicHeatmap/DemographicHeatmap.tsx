import { useMemo } from 'react'
import type { CSSProperties } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import type { DemographicCell } from '../../../types'
import EmptyChartState from '../EmptyChartState'
import { fmtPer1000 } from '../../../lib/format'
import {
  chartTooltipOptions,
  colorDot,
  formatChartTooltip,
  percentGap
} from '../../../lib/echartsTooltip'
import {
  COLOR_AGE_BAND,
  COLOR_AGE_LABEL,
  COLOR_FEMALE,
  COLOR_HEATMAP_CELL_BORDER,
  COLOR_HEATMAP_MEN_HIGH,
  COLOR_HEATMAP_MEN_LOW,
  COLOR_HEATMAP_TEXT_DARK,
  COLOR_HEATMAP_TEXT_LIGHT,
  COLOR_HEATMAP_WOMEN_HIGH,
  COLOR_HEATMAP_WOMEN_LOW,
  COLOR_MALE,
  FONT_HEATMAP,
  FONT_GENDER_HEADER
} from '../../../theme'

interface Props {
  data: DemographicCell[]
  regionalData?: DemographicCell[]
  highlightAgeBand?: number | null
}

const MALE_GENDER_ID = 1
const SIMILAR_RATE_THRESHOLD_PERCENT = 5
// Above this fraction of the max value, switch cell text to light for readability
const CELL_TEXT_LIGHT_THRESHOLD = 0.55

// Chart fills its parent — actual height comes from the parent component
const wrapperStyle: CSSProperties = { width: '100%', height: '100%' }

type AgeGenderRow = {
  id: number
  name: string
  men: number | null
  women: number | null
}

function buildAgeGenderRows(cells: DemographicCell[]): AgeGenderRow[] {
  const map = new Map<number, AgeGenderRow>()
  for (const cell of cells) {
    const entry = map.get(cell.ageGroupId) ?? {
      id: cell.ageGroupId,
      name: cell.ageGroupName,
      men: null,
      women: null
    }
    const field = cell.genderId === MALE_GENDER_ID ? 'men' : 'women'
    entry[field] = cell.per1000
    map.set(cell.ageGroupId, entry)
  }
  return [...map.values()].sort((a, b) => a.id - b.id)
}

function pickPrimaryRows(
  nationalRows: AgeGenderRow[],
  regionalRows: AgeGenderRow[]
): AgeGenderRow[] {
  if (regionalRows.length === 0) return nationalRows
  const regionalById = new Map(regionalRows.map((row) => [row.id, row]))
  return nationalRows.map(
    (national) =>
      regionalById.get(national.id) ?? {
        id: national.id,
        name: national.name,
        men: null,
        women: null
      }
  )
}

function findMaxValue(rows: AgeGenderRow[]): number {
  let max = 0
  for (const row of rows) {
    if (row.men !== null && row.men > max) max = row.men
    if (row.women !== null && row.women > max) max = row.women
  }
  return max > 0 ? max : 1
}

function gapNote(men: number | null, women: number | null): string | undefined {
  if (men === null || women === null) return undefined
  if (men <= 0 || women <= 0) return undefined

  const percent = percentGap(men, women)
  if (percent < SIMILAR_RATE_THRESHOLD_PERCENT) return undefined

  const higher = men > women ? 'men' : 'women'
  return `Dispensed to ${higher} ${percent.toFixed(0)}% more`
}

function cellTextColor(value: number, maxValue: number): string {
  const intensity = value / maxValue
  return intensity > CELL_TEXT_LIGHT_THRESHOLD
    ? COLOR_HEATMAP_TEXT_LIGHT
    : COLOR_HEATMAP_TEXT_DARK
}

function cellLabelFormatter(params: unknown): string {
  const value = (params as { value: unknown[] }).value[2]
  return typeof value === 'number' && value > 0 ? fmtPer1000(value) : '—'
}

function heatmapColumnData(
  rows: AgeGenderRow[],
  field: 'men' | 'women',
  xIndex: 0 | 1,
  maxValue: number
) {
  return rows.map((row, yIndex) => {
    const value = row[field]
    return {
      value: [xIndex, yIndex, value ?? 0],
      label: {
        color:
          value !== null
            ? cellTextColor(value, maxValue)
            : COLOR_HEATMAP_TEXT_DARK
      }
    }
  })
}

function buildOption(
  data: DemographicCell[],
  regionalData: DemographicCell[] | undefined,
  highlightAgeBand: number | null | undefined
): EChartsOption {
  const nationalRows = buildAgeGenderRows(data)
  const regionalRows = buildAgeGenderRows(regionalData ?? [])
  const primaryRows = pickPrimaryRows(nationalRows, regionalRows)
  const maxValue = findMaxValue([...nationalRows, ...regionalRows])

  const highlightedName =
    highlightAgeBand != null
      ? (primaryRows.find((row) => row.id === highlightAgeBand)?.name ?? null)
      : null

  const menData = heatmapColumnData(primaryRows, 'men', 0, maxValue)
  const womenData = heatmapColumnData(primaryRows, 'women', 1, maxValue)

  return {
    animationDurationUpdate: 0,
    grid: { left: 56, right: 8, top: 32, bottom: 8 },
    xAxis: {
      type: 'category',
      data: ['Men', 'Women'],
      position: 'top',
      axisLine: { show: false },
      axisTick: { show: false },
      splitArea: { show: false },
      axisLabel: {
        fontSize: FONT_GENDER_HEADER,
        fontWeight: 'bold',
        formatter: (value: string) =>
          value === 'Men' ? `{men|${value}}` : `{women|${value}}`,
        rich: {
          men: { color: COLOR_MALE, fontWeight: 'bold' },
          women: { color: COLOR_FEMALE, fontWeight: 'bold' }
        }
      }
    },
    yAxis: {
      type: 'category',
      data: primaryRows.map((row) => row.name),
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      splitArea: { show: false },
      axisLabel: {
        fontSize: FONT_HEATMAP,
        color: COLOR_AGE_LABEL,
        formatter: (value: string) =>
          value === highlightedName ? `{highlight|${value}}` : value,
        rich: {
          highlight: { color: COLOR_AGE_BAND, fontWeight: 'bold' }
        }
      }
    },
    visualMap: [
      {
        seriesIndex: 0,
        min: 0,
        max: maxValue,
        inRange: { color: [COLOR_HEATMAP_MEN_LOW, COLOR_HEATMAP_MEN_HIGH] },
        show: false
      },
      {
        seriesIndex: 1,
        min: 0,
        max: maxValue,
        inRange: { color: [COLOR_HEATMAP_WOMEN_LOW, COLOR_HEATMAP_WOMEN_HIGH] },
        show: false
      }
    ],
    series: [
      {
        name: 'Men',
        type: 'heatmap',
        data: menData,
        label: {
          show: true,
          fontSize: FONT_HEATMAP,
          fontWeight: 600,
          formatter: cellLabelFormatter
        },
        itemStyle: {
          borderColor: COLOR_HEATMAP_CELL_BORDER,
          borderWidth: 1
        }
      },
      {
        name: 'Women',
        type: 'heatmap',
        data: womenData,
        label: {
          show: true,
          fontSize: FONT_HEATMAP,
          fontWeight: 600,
          formatter: cellLabelFormatter
        },
        itemStyle: {
          borderColor: COLOR_HEATMAP_CELL_BORDER,
          borderWidth: 1
        },
        markArea: highlightedName
          ? {
              silent: true,
              itemStyle: { color: COLOR_AGE_BAND, opacity: 0.12 },
              data: [[{ yAxis: highlightedName }, { yAxis: highlightedName }]]
            }
          : undefined
      }
    ],
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const value = (params as { value: (number | string)[] }).value
        const yIdx = value[1] as number
        const row = primaryRows[yIdx]
        if (!row) return ''
        return formatChartTooltip({
          title: row.name,
          rows: [
            {
              marker: colorDot(COLOR_MALE),
              label: 'Men',
              value: row.men !== null ? fmtPer1000(row.men) : '—'
            },
            {
              marker: colorDot(COLOR_FEMALE),
              label: 'Women',
              value: row.women !== null ? fmtPer1000(row.women) : '—'
            }
          ],
          note: gapNote(row.men, row.women)
        })
      },
      ...chartTooltipOptions
    }
  }
}

export default function DemographicHeatmap({
  data,
  regionalData,
  highlightAgeBand
}: Props) {
  const option = useMemo(
    () => buildOption(data, regionalData, highlightAgeBand),
    [data, regionalData, highlightAgeBand]
  )

  if (data.length === 0) {
    return <EmptyChartState message="No demographic data available" />
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
