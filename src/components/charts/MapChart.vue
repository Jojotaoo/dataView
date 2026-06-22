<template>
  <div class="map-chart" :style="{ backgroundColor: bgColor }">
    <div ref="chartRef" class="map-chart-canvas"></div>
    <!-- <div ref="miniMapRef" class="map-mini-map"></div> -->
    <button v-if="isZoomed" class="map-back-btn" @click="handleResetView">
      ← 返回全省
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, onMounted, onUnmounted, shallowRef, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { SeriesOption } from 'echarts'
import type { ChartStyleConfig } from '../../types'
import { DEFAULT_CHART_STYLE } from '../../types'
import GeoJSON from '../../assets/maps/heilongjiang.json'
import { useECharts } from '../../composables/useECharts'

const props = withDefaults(defineProps<{
  option?: Record<string, any>
  width?: number
  height?: number
  bgColor?: string
  chartStyle?: ChartStyleConfig
  geoKey?: string
}>(), {
  option: () => ({}),
  width: 400,
  height: 300,
  bgColor: '#1e1e2e',
  chartStyle: undefined,
  geoKey: 'heilongjiang',
})

const optionRef = toRef(props, 'option')
const widthRef = toRef(props, 'width')
const heightRef = toRef(props, 'height')
const chartStyleRef = computed(() => props.chartStyle ?? DEFAULT_CHART_STYLE)

const miniMapRef = ref<HTMLDivElement>()
const miniChartInstance = shallowRef<echarts.ECharts>()
const isZoomed = ref(false)
const currentCity = ref('')
const cityCenterMap = ref(new Map<string, number[]>())
const zoomState = ref<{ center?: [number, number], zoom?: number, animationDurationUpdate?: number }>({})

const DEFAULT_CENTER: [number, number] = [126.5, 47.5]
const DEFAULT_ZOOM = 1.2

const seriesOption = computed((): SeriesOption => {
  const cs = chartStyleRef.value ?? DEFAULT_CHART_STYLE
  const s = cs.series
  const ds = optionRef.value.dataset ?? { dimensions: [], source: [] }
  const source: any[] = ds.source ?? []

  return {
    type: 'map',
    map: props.geoKey,
    roam: true,
    scaleLimit: { min: 1, max: 10 },
    selectedMode: 'single',
    ...zoomState.value,
    label: {
      show: false,
      color: s.mapLabelColor,
      fontSize: s.mapLabelFontSize,
    },
    select: {
      label: { color: s.mapSelectLabelColor, fontWeight: 'bold' },
      itemStyle: { areaColor: s.mapSelectColor },
    },
    emphasis: {
      label: { show: true, fontSize: 13, fontWeight: 'bold', color: '#000' },
      itemStyle: { areaColor: s.mapRegionHoverColor, borderColor: '#cdd6f4', borderWidth: 2 },
    },
    itemStyle: {
      areaColor: s.mapRegionColor,
      borderColor: s.mapRegionBorderColor,
      borderWidth: 1.2,
      shadowBlur: 4,
      shadowColor: 'rgba(0,0,0,0.06)',
      shadowOffsetY: 2,
    },
    data: source.map((item: any) => ({
      name: item?.[0] ?? '',
      value: item?.[1] ?? 0,
    })),
    markPoint: s.mapMarkPointShow ? {
      symbol: 'circle',
      symbolSize: s.mapMarkPointSymbolSize,
      itemStyle: {
        color: s.mapMarkPointColor,
        borderColor: '#fff',
        borderWidth: 2,
        shadowBlur: 6,
        shadowColor: 'rgba(0,0,0,0.3)',
      },
      label: {
        show: s.mapMarkPointLabelShow,
        formatter: '{b}',
        position: 'top',
        fontSize: s.mapMarkPointLabelFontSize,
        fontWeight: 'bold',
        color: s.mapLabelColor,
        padding: [2, 6],
        borderRadius: 4,
        borderColor: s.mapRegionBorderColor,
        borderWidth: 0.5,
        distance: 8,
      },
      data: GeoJSON.features.map((item: any) => ({
        name: item.properties.name,
        coord: item.properties.center,
      })),
    } : undefined,
  }
})

function tooltipFormatter(params: any): string {
  if (params.seriesType !== 'map') return ''
  if (params.data && params.data.coord) {
    return `<b>${params.name}</b><br/>数值: ${params.data.value ?? '--'}`
  }
  const val = params.value ?? '-'
  return `<b>${params.name}</b><br/>数值: ${val}`
}

const { chartRef, chartInstance } = useECharts(
  optionRef, widthRef, heightRef, chartStyleRef, seriesOption, 'geo', tooltipFormatter
)

function handleMapClick(params: any) {
  if (params.seriesType !== 'map') return
  const name = params.name as string
  const center = cityCenterMap.value.get(name)
  if (!center) return

  if (currentCity.value === name) {
    zoomState.value = {}
    currentCity.value = ''
    isZoomed.value = false
  } else {
    zoomState.value = { center: center as [number, number], zoom: 5.5, animationDurationUpdate: 800 }
    currentCity.value = name
    isZoomed.value = true
  }
}

function handleResetView() {
  zoomState.value = {}
  isZoomed.value = false
  currentCity.value = ''
}

function updateMiniMapRect() {
  if (!chartInstance.value || !miniChartInstance.value) return
  if (!chartStyleRef.value?.series.mapMiniMapShow) return

  const width = chartInstance.value.getWidth()
  const height = chartInstance.value.getHeight()
  if (width === 0 || height === 0) return

  const topLeft = chartInstance.value.convertFromPixel('series', [0, 0])
  const topRight = chartInstance.value.convertFromPixel('series', [width, 0])
  const bottomLeft = chartInstance.value.convertFromPixel('series', [0, height])
  const bottomRight = chartInstance.value.convertFromPixel('series', [width, height])

  if (!topLeft || !topRight || !bottomLeft || !bottomRight) return

  const lons = [topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]]
  const lats = [topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]]
  const lonMin = Math.min(...lons)
  const lonMax = Math.max(...lons)
  const latMin = Math.min(...lats)
  const latMax = Math.max(...lats)

  const p1 = miniChartInstance.value.convertToPixel('series', [lonMin, latMin])
  const p2 = miniChartInstance.value.convertToPixel('series', [lonMax, latMax])
  if (!p1 || !p2) return

  const x = Math.min(p1[0], p2[0])
  const y = Math.min(p1[1], p2[1])
  const rectWidth = Math.abs(p2[0] - p1[0])
  const rectHeight = Math.abs(p2[1] - p1[1])

  miniChartInstance.value.setOption({
    graphic: [{
      id: 'viewRect',
      type: 'rect',
      shape: { x, y, width: rectWidth, height: rectHeight },
      style: {
        fill: 'rgba(255, 80, 80, 0.15)',
        stroke: '#e74c3c',
        lineWidth: 2,
        lineDash: [4, 4],
      },
      z: 100,
      silent: true,
    }],
  })
}

let miniMapDebounceTimer: ReturnType<typeof setTimeout> | null = null
function debouncedUpdateMiniMapRect() {
  if (miniMapDebounceTimer) clearTimeout(miniMapDebounceTimer)
  miniMapDebounceTimer = setTimeout(updateMiniMapRect, 100)
}

onMounted(async () => {
  try {
    if (!echarts.getMap(props.geoKey)) {
      echarts.registerMap(props.geoKey, GeoJSON)
    }

    const features: any[] = GeoJSON.features ?? []
    const map = new Map<string, number[]>()
    features.forEach((f: any) => {
      if (f.properties?.name && f.properties?.center) {
        map.set(f.properties.name, f.properties.center)
      }
    })
    cityCenterMap.value = map

    await nextTick()

    const instance = chartInstance.value
    if (instance) {
      instance.on('click', handleMapClick)
      instance.on('mapRoam', debouncedUpdateMiniMapRect)
    }
  } catch (e) {
    console.warn(`[MapChart] GeoJSON for "${props.geoKey}" not found.`, e)
  }
})

onUnmounted(() => {
  miniChartInstance.value?.dispose()
  if (miniMapDebounceTimer) clearTimeout(miniMapDebounceTimer)
})
</script>

<style scoped>
.map-chart {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
.map-chart-canvas {
  width: 100%;
  height: 100%;
}
.map-mini-map {
  position: absolute;
  right: 16px;
  bottom: 16px;
  width: 150px;
  height: 120px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 10;
  pointer-events: none;
  overflow: hidden;
}
.map-mini-map :deep(canvas) {
  border-radius: 8px;
}
.map-back-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 12px;
  background: rgba(49, 50, 68, 0.9);
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 12px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.map-back-btn:hover {
  background: rgba(137, 180, 250, 0.9);
  color: #1e1e2e;
  border-color: #89b4fa;
}
</style>
