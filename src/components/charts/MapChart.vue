<template>
  <div class="map-chart" :style="{ backgroundColor: containerBg }">
    <div ref="chartRef" class="map-chart-canvas"></div>
    <button v-if="isZoomed" class="map-back-btn" @click="handleResetView">
      ← 返回全省
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, onMounted, onUnmounted, watch, shallowRef, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ChartStyleConfig } from '../../types'
import { DEFAULT_CHART_STYLE } from '../../types'
import GeoJSON from '../../assets/maps/heilongjiang.json'
import { useInteractDispatch } from '../../composables/useInteractDispatch'

const props = withDefaults(defineProps<{
  componentId?: string
  option?: Record<string, any>
  width?: number
  height?: number
  bgColor?: string
  chartStyle?: ChartStyleConfig
  geoKey?: string
}>(), {
  componentId: '',
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

const containerBg = computed(() => {
  const cs = chartStyleRef.value
  if (cs.backgroundOpacity < 1 && cs.backgroundColor !== 'transparent') {
    const h = cs.backgroundColor.replace('#', '')
    const r = parseInt(h.substring(0, 2), 16)
    const g = parseInt(h.substring(2, 4), 16)
    const b = parseInt(h.substring(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${cs.backgroundOpacity})`
  }
  return props.bgColor || cs.backgroundColor
})

const chartRef = ref<HTMLDivElement>()
const chartInstance = shallowRef<echarts.ECharts>()

const componentIdRef = toRef(props, 'componentId')
const { dispatch } = useInteractDispatch(componentIdRef)
const mapReady = ref(false)
const isZoomed = ref(false)
const currentCity = ref('')
const cityCenterMap = ref(new Map<string, number[]>())

const DEFAULT_CENTER: [number, number] = [126.5, 47.5]
const DEFAULT_ZOOM = 1.2

function buildOption(): any {
  const cs = chartStyleRef.value ?? DEFAULT_CHART_STYLE
  const ds = optionRef.value.dataset ?? { dimensions: [], source: [] }
  const source: any[] = ds.source ?? []
  const s = cs.series

  const result: any = {
    backgroundColor: cs.backgroundOpacity < 1 ? 'transparent' : cs.backgroundColor,
  }

  if (cs.titleStyle.show && optionRef.value.title) {
    result.title = {
      text: optionRef.value.title,
      textStyle: { color: cs.titleStyle.color, fontSize: cs.titleStyle.fontSize, fontWeight: 600 },
      left: cs.titleStyle.left,
      top: cs.titleStyle.top,
    }
  }

  if (cs.tooltip.show && cs.tooltip.trigger !== 'none') {
    result.tooltip = {
      trigger: 'item',
      backgroundColor: cs.tooltip.backgroundColor,
      borderColor: cs.tooltip.borderColor,
      textStyle: { color: cs.tooltip.textColor, fontSize: 12 },
      formatter: (params: any) => {
        if (params.seriesType !== 'map') return ''
        if (params.data && params.data.coord) {
          return `<b>${params.name}</b><br/>数值: ${params.data.value ?? '--'}`
        }
        const val = params.value ?? '-'
        return `<b>${params.name}</b><br/>数值: ${val}`
      },
    }
  }

  if (s.mapVisualMapShow) {
    result.visualMap = {
      min: s.mapVisualMin,
      max: s.mapVisualMax,
      text: ['高', '低'],
      textStyle: { color: s.mapLabelColor },
      inRange: { color: s.mapVisualColors },
      show: true,
      calculable: true,
      itemWidth: 18,
      itemHeight: 120,
      left: 'left',
      bottom: 30,
    }
  }

  result.series = [{
    type: 'map',
    map: props.geoKey,
    roam: true,
    scaleLimit: { min: 1, max: 10 },
    selectedMode: 'single',
    label: {
      show: s.mapLabelShow,
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
        backgroundColor: 'rgba(30,30,46,0.7)',
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
  }]

  return result
}

function initChart() {
  if (!chartRef.value || !mapReady.value) return
  chartInstance.value?.dispose()
  chartInstance.value = echarts.init(chartRef.value, undefined, { renderer: 'canvas' })
  chartInstance.value.setOption(buildOption())
  chartInstance.value.on('click', handleMapClick)
}

function updateChart() {
  if (!chartInstance.value || !mapReady.value) return
  chartInstance.value.setOption(buildOption(), { notMerge: true })
}

function handleResize() {
  chartInstance.value?.resize()
}

function handleMapClick(params: any) {
  if (params.seriesType !== 'map') return
  const name = params.name as string
  const center = cityCenterMap.value.get(name)
  if (!center) return

  if (currentCity.value === name) {
    updateChart()
    currentCity.value = ''
    isZoomed.value = false
  } else {
    chartInstance.value?.setOption({
      series: [{ center, zoom: 5.5, animationDurationUpdate: 800 }],
    })
    currentCity.value = name
    isZoomed.value = true
  }
  dispatch('click', { name, value: params.value })
}

function handleResetView() {
  updateChart()
  isZoomed.value = false
  currentCity.value = ''
}

const resizeObserver = new ResizeObserver(handleResize)

onMounted(async () => {
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }

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

    mapReady.value = true
    await nextTick()
    initChart()
  } catch (e) {
    console.warn(`[MapChart] GeoJSON for "${props.geoKey}" not found.`, e)
  }
})

onUnmounted(() => {
  resizeObserver.disconnect()
  chartInstance.value?.dispose()
})

watch(() => [widthRef.value, heightRef.value], () => {
  requestAnimationFrame(() => chartInstance.value?.resize())
})

watch(() => optionRef.value, updateChart, { deep: true })
watch(() => JSON.stringify(chartStyleRef.value), updateChart)
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
