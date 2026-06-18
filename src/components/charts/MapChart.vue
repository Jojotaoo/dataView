<template>
  <div class="map-chart" :style="{ backgroundColor: bgColor }">
    <div ref="chartRef" class="map-chart-canvas"></div>
    <button v-if="isZoomed" class="map-back-btn" @click="handleResetView">
      ← 返回全省
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'
import type { SeriesOption } from 'echarts'
import type { ChartStyleConfig } from '../../types'
import { DEFAULT_CHART_STYLE } from '../../types'
import GeoJSON from '../../assets/maps/heilongjiang.json'

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

const chartRef = ref<HTMLDivElement>()
const chartInstance = shallowRef<echarts.ECharts>()
const mapReady = ref(false)
const isZoomed = ref(false)
const currentCity = ref('')
const cityCenterMap = ref(new Map<string, number[]>())

const seriesOption = computed(() => ({}))

function buildOption(): any {
  const cs = chartStyleRef.value ?? DEFAULT_CHART_STYLE
  const ds = optionRef.value.dataset ?? { dimensions: [], source: [] }
  const source: any[] = ds.source ?? []
  const s = cs.series

  const result: any = {
    backgroundColor: cs.backgroundColor,
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
        const val = params.value ?? '-'
        return `<b>${params.name}</b><br/>数值: ${val}`
      },
    }
  }

  result.geo = {
    map: props.geoKey,
    roam: true,
    scaleLimit: { min: 1, max: 10 },
    label: {
      show: s.mapLabelShow,
      color: s.mapLabelColor,
      fontSize: s.mapLabelFontSize,
    },
    itemStyle: {
      areaColor: s.mapRegionColor,
      borderColor: s.mapRegionBorderColor,
      borderWidth: 1,
    },
    emphasis: {
      itemStyle: {
        areaColor: s.mapRegionHoverColor,
        borderColor: '#cdd6f4',
        borderWidth: 2,
      },
      label: {
        color: '#cdd6f4',
      },
    },
  }

  result.series = [{
    type: 'map',
    map: props.geoKey,
    geoIndex: 0,
    data: source.map((item: any) => ({
      name: item?.[0] ?? '',
      value: item?.[1] ?? 0,
    })),
    markPoint: {
      symbol: 'circle',
      symbolSize: 10,
      data: GeoJSON.features.map((item) => ({ name: item.properties.name, coord: item.properties.center })),
      itemStyle: {
        color: '#cdd6f4',
        borderColor: '#cdd6f4',
        borderWidth: 1,
      }
    }
  } as SeriesOption]

  return result
}

function handleMapClick(params: any) {
  if (params.seriesType !== 'map') return
  const name = params.name as string
  const center = cityCenterMap.value.get(name)
  if (!center) return

  chartInstance.value?.setOption({
    geo: { center, zoom: 4 },
    animationDurationUpdate: 800,
    animationEasingUpdate: 'cubicInOut',
  })
  isZoomed.value = true
  currentCity.value = name
}

function handleResetView() {
  chartInstance.value?.setOption({
    geo: { center: undefined, zoom: 1 },
    animationDurationUpdate: 800,
    animationEasingUpdate: 'cubicInOut',
  })
  isZoomed.value = false
  currentCity.value = ''
}

function initChart() {
  if (!chartRef.value || !mapReady.value) return
  chartInstance.value?.dispose()
  chartInstance.value = echarts.init(chartRef.value, undefined, { renderer: 'canvas' })
  chartInstance.value.setOption(buildOption())
  chartInstance.value.on('click', handleMapClick)
}

function handleResize() {
  chartInstance.value?.resize()
}

const resizeObserver = new ResizeObserver(handleResize)

onMounted(async () => {
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }

  try {
    if (!echarts.getMap(props.geoKey)) {
      // const geoModule = await import(`../../assets/maps/${props.geoKey}.json`)
      const geoModule = GeoJSON
      const geoJson = geoModule
      echarts.registerMap(props.geoKey, geoJson)

      const features: any[] = geoJson.features ?? []
      const map = new Map<string, number[]>()
      features.forEach((f: any) => {
        if (f.properties?.name && f.properties?.center) {
          map.set(f.properties.name, f.properties.center)
        }
      })
      cityCenterMap.value = map
    }
    mapReady.value = true
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

function updateChart() {
  if (!chartInstance.value || !mapReady.value) return
  chartInstance.value.setOption(buildOption(), { notMerge: true })
}

watch(() => optionRef.value, updateChart, { deep: true })
watch(() => seriesOption.value, updateChart, { deep: true })
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
