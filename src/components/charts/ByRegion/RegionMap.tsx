import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import ReactECharts from 'echarts-for-react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { geoMercator } from 'd3-geo'
import type { RegionalStat } from '../../../types'
import { fmtPer1000 } from '../../../lib/format'
import { mixColor } from '../../../lib/color'
import {
  chartTooltipOptions,
  formatChartTooltip
} from '../../../lib/echartsTooltip'
import EmptyChartState from '../EmptyChartState'
import {
  COLOR_REGIONAL,
  COLOR_MAP_BORDER,
  COLOR_MAP_NO_DATA,
  COLOR_MAP_HOVER_BORDER,
  COLOR_MAP_BELOW_LOW,
  COLOR_MAP_BELOW_HIGH,
  COLOR_MAP_ABOVE_LOW,
  COLOR_MAP_ABOVE_HIGH
} from '../../../theme'

// Only the slice of the GeoJSON we read; each county feature carries the
// regionId and display name in its properties.
type CountyFeature = {
  properties: { regionId?: number; name?: string } | null
}
type CountyCollection = { features: CountyFeature[] }

interface Props {
  regions: RegionalStat[]
  nationalAverage: number | null
  selectedRegionId: number | null
  hoveredRegionId: number | null
  onHoverRegion: (regionId: number | null) => void
  onRegionClick: (regionId: number, regionName: string) => void
}

// The registered map shares one name across instances; the GeoJSON shape is
// identical every time, so re-registering is harmless.
const MAP_NAME = 'sweden-counties'

// Mercator keeps Sweden's true shape; without it ECharts' default scaling
// squeezes the country. ECharts fits the projected coordinates to the box.
const mercator = geoMercator()
const swedenProjection = {
  project: (point: number[]) =>
    mercator(point as [number, number]) ?? [0, 0],
  unproject: (point: number[]) =>
    mercator.invert?.(point as [number, number]) ?? [0, 0]
}

// Chart fills its parent — actual size comes from the parent component
const wrapperStyle: CSSProperties = { width: '100%', height: '100%' }

// Diverging color scale centered on the national average:
// below average → slate scale, above average → orange scale.
function divergingColor(
  value: number,
  centerValue: number,
  min: number,
  max: number
): string {
  if (value < centerValue) {
    const ratio =
      centerValue === min ? 0 : (centerValue - value) / (centerValue - min)
    return mixColor(COLOR_MAP_BELOW_LOW, COLOR_MAP_BELOW_HIGH, ratio)
  }
  const ratio =
    max === centerValue ? 0 : (value - centerValue) / (max - centerValue)
  return mixColor(COLOR_MAP_ABOVE_LOW, COLOR_MAP_ABOVE_HIGH, ratio)
}

type MapDatum = {
  name: string
  value: number
  regionId: number
  itemStyle: object
  emphasis: object
}

// ECharts hands the data item back on pointer events; no-data counties have none
type MapMouseParams = { data?: MapDatum }

function buildMapData(
  regions: RegionalStat[],
  nationalAverage: number | null,
  selectedRegionId: number | null,
  nameByRegionId: Map<number, string>
): MapDatum[] {
  const values = regions.map((region) => region.per1000)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const center = nationalAverage ?? (min + max) / 2

  return regions.map((region) => {
    const areaColor = divergingColor(region.per1000, center, min, max)
    const isSelected = region.regionId === selectedRegionId
    return {
      name: nameByRegionId.get(region.regionId) ?? region.regionName,
      value: region.per1000,
      regionId: region.regionId,
      itemStyle: {
        areaColor,
        borderColor: isSelected ? COLOR_REGIONAL : COLOR_MAP_BORDER,
        borderWidth: isSelected ? 2.5 : 0.8
      },
      // Keep the diverging fill on hover; only the outline changes
      emphasis: {
        itemStyle: {
          areaColor,
          borderColor: COLOR_MAP_HOVER_BORDER,
          borderWidth: 2
        }
      }
    }
  })
}

function mapTooltip(
  params: unknown,
  rankByRegionId: Map<number, number>,
  total: number
): string {
  const datum = (params as MapMouseParams).data
  if (!datum) return ''

  const rank = rankByRegionId.get(datum.regionId)
  return formatChartTooltip({
    title: datum.name,
    rows: [
      { label: 'per 1,000', value: fmtPer1000(datum.value) },
      ...(rank ? [{ label: 'Rank', value: `#${rank} / ${total}` }] : [])
    ]
  })
}

function buildOption(
  mapData: MapDatum[],
  rankByRegionId: Map<number, number>,
  total: number
): EChartsOption {
  return {
    animationDurationUpdate: 0,
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => mapTooltip(params, rankByRegionId, total),
      ...chartTooltipOptions
    },
    series: [
      {
        type: 'map',
        map: MAP_NAME,
        projection: swedenProjection,
        roam: false,
        selectedMode: false,
        layoutCenter: ['50%', '50%'],
        layoutSize: '100%',
        label: { show: false },
        // Counties without data for the current selection
        itemStyle: {
          areaColor: COLOR_MAP_NO_DATA,
          borderColor: COLOR_MAP_BORDER,
          borderWidth: 0.8
        },
        emphasis: {
          label: { show: false },
          itemStyle: { borderColor: COLOR_MAP_HOVER_BORDER, borderWidth: 2 }
        },
        data: mapData
      }
    ]
  }
}

export default function RegionMap({
  regions,
  nationalAverage,
  selectedRegionId,
  hoveredRegionId,
  onHoverRegion,
  onRegionClick
}: Props) {
  const chartRef = useRef<ReactECharts>(null)
  const [geoJson, setGeoJson] = useState<CountyCollection | null>(null)

  useEffect(() => {
    async function loadMap() {
      const response = await fetch('/sweden-counties.geojson')
      const collection = (await response.json()) as CountyCollection
      echarts.registerMap(
        MAP_NAME,
        collection as Parameters<typeof echarts.registerMap>[1]
      )
      setGeoJson(collection)
    }
    loadMap()
  }, [])

  const nameByRegionId = useMemo(() => {
    const lookup = new Map<number, string>()
    for (const feature of geoJson?.features ?? []) {
      const properties = feature.properties
      if (properties?.regionId != null && properties.name) {
        lookup.set(properties.regionId, properties.name)
      }
    }
    return lookup
  }, [geoJson])

  const rankByRegionId = useMemo(() => {
    const sorted = [...regions].sort((a, b) => b.per1000 - a.per1000)
    return new Map(sorted.map((region, index) => [region.regionId, index + 1]))
  }, [regions])

  const option = useMemo(() => {
    const mapData = buildMapData(
      regions,
      nationalAverage,
      selectedRegionId,
      nameByRegionId
    )
    return buildOption(mapData, rankByRegionId, regions.length)
  }, [
    regions,
    nationalAverage,
    selectedRegionId,
    nameByRegionId,
    rankByRegionId
  ])

  // Reflect a hover coming from the ranking list onto the map
  useEffect(() => {
    const chart = chartRef.current?.getEchartsInstance()
    if (!chart) return
    chart.dispatchAction({ type: 'downplay', seriesIndex: 0 })
    if (hoveredRegionId === null) return
    const name = nameByRegionId.get(hoveredRegionId)
    if (name) chart.dispatchAction({ type: 'highlight', seriesIndex: 0, name })
  }, [hoveredRegionId, nameByRegionId])

  const onEvents = useMemo(
    () => ({
      mouseover: (params: MapMouseParams) => {
        if (params.data?.regionId != null) onHoverRegion(params.data.regionId)
      },
      mouseout: () => onHoverRegion(null),
      click: (params: MapMouseParams) => {
        if (params.data?.regionId != null) {
          onRegionClick(params.data.regionId, params.data.name)
        }
      }
    }),
    [onHoverRegion, onRegionClick]
  )

  if (regions.length === 0) {
    return (
      <EmptyChartState
        message={
          geoJson ? 'Select a medication to see the map' : 'Loading map…'
        }
      />
    )
  }
  if (!geoJson) {
    return <EmptyChartState message="Loading map…" />
  }

  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      style={wrapperStyle}
      opts={{ renderer: 'svg' }}
      onEvents={onEvents}
      notMerge
    />
  )
}
