<template>
  <div class="map-chart" :style="{ backgroundColor: containerBg }">
    <div ref="chartRef" class="map-chart-canvas"></div>
    <div v-if="currentCity" ref="minimapRef" class="map-minimap" @click="handleResetView">
      <div ref="minimapChartRef" class="minimap-chart-canvas" @click="handleResetView"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef, onMounted, onUnmounted, watch, shallowRef, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ChartStyleConfig } from '../../types'
import { DEFAULT_CHART_STYLE } from '../../types'
import GeoJSON from '../../assets/maps/heilongjiang.json'
import { useInteractDispatch } from '../../composables/useInteractDispatch'
import { useInteractClear } from '../../composables/useInteractClear'

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
const minimapChartRef = ref<HTMLDivElement>()
const minimapInstance = shallowRef<echarts.ECharts>()

const componentIdRef = toRef(props, 'componentId')
const { dispatch } = useInteractDispatch(componentIdRef)
const { clearTargetInteractions } = useInteractClear()
const mapReady = ref(false)
const isZoomed = ref(false)
const currentCity = ref('')
const cityCenterMap = ref(new Map<string, number[]>())
const cityZoomMap = ref(new Map<string, number>())
const breathTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const DEFAULT_CENTER: [number, number] = [126.5, 47.5]
const DEFAULT_ZOOM = 1.2

function formatTooltipValue(val: any, dim: string): string {
  if (val === null || val === undefined || val === '') return '--'
  const num = Number(val)
  if (isNaN(num)) return String(val)
  const formatted = num.toLocaleString()
  const unit = chartStyleRef.value.series.mapTooltipDimensionUnits?.[dim]
  return unit ? formatted + unit : formatted
}

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
      backgroundColor: 'rgba(0,32,71,0.92)',
      borderColor: 'rgba(0,200,255,0.4)',
      borderWidth: 1,
      borderRadius: 6,
      padding: [12, 16],
      textStyle: { color: '#ffffff', fontSize: 12 },
      extraCssText: 'box-shadow: 0 4px 20px rgba(0,200,255,0.1); backdrop-filter: blur(8px);',
      minWidth: 180,
      formatter: (params: any) => {
        if (params.seriesType !== 'map') return ''
        const row = params.data?.fullRow
        const dims = ds.dimensions ?? []
        if (!row || !dims.length) return ''
        let html = `<div style="border-bottom: 1px solid rgba(0,200,255,0.2); margin-bottom: 8px; padding-bottom: 6px;">`
        dims.forEach((dim: string, idx: number) => {
          const val = row[idx] ?? '--'
          const formatted = formatTooltipValue(val, dim)
          if (idx === 0) {
            html += `<span style="color: #00c8ff; font-size: 14px; font-weight: 600;">${dim}：${formatted}</span>`
          }
        })
        html += `</div>`
        dims.forEach((dim: string, idx: number) => {
          if (idx === 0) return
          const val = row[idx] ?? '--'
          const formatted = formatTooltipValue(val, dim)
          html += `<div style="color: rgba(255,255,255,0.7); font-size: 12px; line-height: 1.8;">${dim}：${formatted}</div>`
        })
        return html
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
    roam: false, // 不允许缩放控制，设置为不允许缩放
    scaleLimit: { min: 1, max: 10 },
    selectedMode: 'single',
    zoom: 1.2,
    label: {
      show: s.mapLabelShow,
      color: s.mapLabelColor,
      fontSize: s.mapLabelFontSize,
      fontWeight: s.mapLabelFontWeight ?? 500,
      position: 'top' as const,
      distance: 10,
    },
    select: {
      label: { show: false, color: s.mapSelectLabelColor, fontWeight: 700, fontSize: (s.mapLabelFontSize ?? 11) + 1 },
      itemStyle: {
        areaColor: s.mapSelectColor,
        borderColor: s.mapSelectBorderColor,
        borderWidth: s.mapSelectBorderWidth,
        shadowBlur: s.mapSelectShadowBlur,
        shadowColor: s.mapSelectShadowColor,
        shadowOffsetY: 0,
        shadowOffsetX: 0,
      },
    },
    emphasis: {
      label: { show: false, fontSize: s.mapEmphasisLabelFontSize ?? 12, fontWeight: 700, color: s.mapEmphasisLabelColor },
      itemStyle: {
        areaColor: s.mapRegionHoverColor,
        borderColor: s.mapHoverBorderColor,
        borderWidth: s.mapHoverBorderWidth,
        shadowBlur: s.mapHoverShadowBlur,
        shadowColor: s.mapHoverShadowColor,
      },
    },
    itemStyle: {
      // areaColor: s.mapRegionColor,
      areaColor: {
        type: 'linear',
        x: 0,      // 起始点百分比（左下）
        y: 0.5,
        x2: 0,     // 结束点百分比（右上）
        y2: 0,
        colorStops: [
            { offset: 0, color: 'rgba(8,39,73,1)' }, // 0% 处为深蓝
            { offset: 1, color: 'rgba(34,69,104,1)' }  // 100% 处为浅蓝
        ],
        global: false // 是否使用像素坐标，通常设为false
      }, //s.mapRegionColor,
      borderColor: s.mapRegionBorderColor,
      borderWidth: 1,
    },
    data: source.map((item: any) => {
      const name = item?.[0] ?? ''
      const isActive = currentCity.value && name === currentCity.value
      const isDimmed = currentCity.value && name !== currentCity.value
      return {
        name,
        value: item?.[1] ?? 0,
        fullRow: item,
        selected: isActive ? true : undefined,
        itemStyle: isDimmed ? {
          areaColor: 'rgba(8,22,42,0.9)',
          borderColor: 'rgba(0,60,120,0.15)',
          borderWidth: 1,
        } : undefined,
      }
    }),
    markPoint: s.mapMarkPointShow ? (() => {
      const zoomScale = currentCity.value
        ? Math.min(2.5, (cityZoomMap.value.get(currentCity.value) ?? 2.5) / DEFAULT_ZOOM)
        : 1
      const baseSize = s.mapMarkPointSymbolSize * zoomScale
      const baseFontSize = Math.round(s.mapMarkPointLabelFontSize * zoomScale)
      const activeMul = 1.15
      return {
        symbol: 'circle',
        symbolSize: baseSize,
        z: 100,
        itemStyle: {
          color: s.mapMarkPointColor,
          borderColor: 'rgba(255,255,255,0.3)',
          borderWidth: 1,
          shadowBlur: 8,
          shadowColor: 'rgba(0,128,255,0.4)',
          shadowOffsetY: 2,
        },
        emphasis: {
          itemStyle: {
            color: '#00c8ff',
            shadowBlur: 12,
            shadowColor: 'rgba(0,200,255,0.5)',
          },
          label: {
            color: '#00c8ff',
            fontWeight: 700,
          },
        },
        label: {
          show: s.mapMarkPointLabelShow,
          formatter: '{b}',
          position: 'top',
          fontSize: baseFontSize,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.75)',
          padding: [2, 6],
          borderRadius: 4,
          distance: 12,
        },
        data: GeoJSON.features.map((item: any) => {
          const isActive = item.properties.name === currentCity.value
          const isDimmed = currentCity.value && !isActive
          return {
            name: item.properties.name,
            coord: item.properties.center,
            symbolSize: isActive ? baseSize * activeMul : undefined,
            itemStyle: isDimmed ? {
              color: 'rgba(0,128,255,0.05)',
            } : undefined,
            label: isActive ? {
              fontSize: Math.round(baseFontSize * activeMul),
              color: '#00c8ff',
              fontWeight: 700,
              textShadowColor: 'rgba(0,0,0)',
              textShadowBlur: 4,
              textShadowOffsetX: 1,
              textShadowOffsetY: 1,
            } : (isDimmed ? {
              color: 'rgba(255,255,255,0.04)',
            } : undefined),
          }
        }),
      }
    })() : undefined,
  }]

  if (currentCity.value) {
    const zoom = cityZoomMap.value.get(currentCity.value)
    const center = cityCenterMap.value.get(currentCity.value)
    if (zoom && center) {
      result.series[0].center = center
      result.series[0].zoom = zoom
      result.series[0].animationDurationUpdate = 800
    }
  }

  return result
}

function getCityFeature(name: string): any {
  return (GeoJSON as any).features.find((f: any) => f.properties?.name === name)
}

function computeCityZoom(name: string): number {
  const feature = getCityFeature(name)
  if (!feature?.geometry?.coordinates) return 2.5
  const multiPolygon = feature.geometry.coordinates as number[][][][]
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity
  multiPolygon.forEach((polygon: any[][]) => {
    const ring = polygon[0]
    if (!ring) return
    ring.forEach((p: number[]) => {
      minLng = Math.min(minLng, p[0]); maxLng = Math.max(maxLng, p[0])
      minLat = Math.min(minLat, p[1]); maxLat = Math.max(maxLat, p[1])
    })
  })
  if (!isFinite(minLng)) return 2.5
  const w = Math.max(maxLng - minLng, 0.5), h = Math.max(maxLat - minLat, 0.5)
  const zx = 13.5 / (w / 0.55), zy = 10.2 / (h / 0.55)
  return Math.min(8, Math.max(1.3, Math.round(Math.min(zx, zy) * 10) / 10))
}

function buildBreathGraphicElements(name: string): any[] {
  const feature = getCityFeature(name)
  if (!feature || !chartInstance.value) return []

  const ci = chartInstance.value
  const multiPolygon = feature.geometry?.coordinates as number[][][][] | undefined
  if (!multiPolygon) return []

  const elements: any[] = []
  const zoomScale = Math.min(2.5, (cityZoomMap.value.get(name) ?? 2.5) / DEFAULT_ZOOM)

  multiPolygon.forEach((polygon: any[][], polyIdx: number) => {
    const outerRing = polygon[0]
    if (!outerRing || !outerRing.length) return

    const points = outerRing.map((p: number[]) => ci.convertToPixel({ seriesIndex: 0 }, [p[0], p[1]]) as number[])

    elements.push({
      id: `breath-poly-${polyIdx}`,
      type: 'polygon',
      z: 100,
      silent: true,
      shape: { points },
      style: {
        fill: 'transparent',
        stroke: '#00c8ff',
        lineWidth: 2 * zoomScale,
        shadowBlur: Math.round(8 * zoomScale),
        shadowColor: 'rgba(0,128,255,0.45)',
      },
      keyframeAnimation: {
        loop: true,
        duration: 500,
        keyframes: [
          {
            percent: 0,
            style: {
              lineWidth: Math.round(4 * zoomScale),
              shadowBlur: Math.round(8 * zoomScale),
              shadowColor: 'rgba(0,128,255,0.45)',
            },
          },
          {
            percent: 0.5,
            style: {
              lineWidth: Math.round(4 * zoomScale),
              shadowBlur: Math.round(30 * zoomScale),
              shadowColor: 'rgba(0,200,255,0.6)',
            },
          },
          {
            percent: 1,
            style: {
              lineWidth: Math.round(4 * zoomScale),
              shadowBlur: Math.round(40 * zoomScale),
              shadowColor: '#00c8ff',
            },
          },
        ],
      },
    })
  })

  const center = cityCenterMap.value.get(name)
  if (center) {
    const px = ci.convertToPixel({ seriesIndex: 0 }, [center[0], center[1]]) as number[] | null
    if (px) {
      const [cx, cy] = px
      const RIPPLE_R = Math.round(4 * zoomScale)
      const RIPPLE_R_MAX = Math.round(20 * zoomScale)

      for (let i = 0; i < 3; i++) {
        elements.push({
          id: `breath-ripple-${i}`,
          type: 'circle',
          z: 101,
          silent: true,
          shape: { cx, cy, r: RIPPLE_R },
          style: {
            fill: 'none',
            stroke: `rgba(0,200,255,${(0.8 - i * 0.15).toFixed(2)})`,
            lineWidth: (1.5 - i * 0.5) * zoomScale,
          },
          keyframeAnimation: {
            loop: true,
            duration: 2000,
            delay: i * 600,
            keyframes: [
              {
                percent: 0,
                shape: { r: RIPPLE_R },
                style: { lineWidth: (1.5 - i * 0.5) * zoomScale, stroke: `rgba(0,200,255,${(0.8 - i * 0.15).toFixed(2)})` },
              },
              {
                percent: 1,
                shape: { r: RIPPLE_R_MAX },
                style: { lineWidth: 0.3, stroke: 'rgba(0,200,255,0)' },
              },
            ],
          },
        })
      }

      elements.push({
        id: 'breath-pulse-dot',
        type: 'circle',
        z: 102,
        silent: true,
        shape: { cx, cy, r: Math.round(4 * zoomScale) },
        style: {
          fill: '#00c8ff',
          shadowBlur: Math.round(8 * zoomScale),
          shadowColor: 'rgba(0,200,255,0.5)',
        },
        keyframeAnimation: {
          loop: true,
          duration: 1500,
          keyframes: [
            { percent: 0, shape: { r: Math.round(4 * zoomScale) }, style: { opacity: 1, shadowBlur: Math.round(8 * zoomScale), shadowColor: 'rgba(0,200,255,0.5)' } },
            { percent: 0.5, shape: { r: Math.round(5 * zoomScale) }, style: { opacity: 0.8, shadowBlur: Math.round(12 * zoomScale), shadowColor: 'rgba(0,200,255,0.8)' } },
            { percent: 1, shape: { r: Math.round(4 * zoomScale) }, style: { opacity: 1, shadowBlur: Math.round(8 * zoomScale), shadowColor: 'rgba(0,200,255,0.5)' } },
          ],
        },
      })
    }
  }

  return elements
}

function applyBreath(name: string, delayMs = 0) {
  removeBreath()
  if (!name || !chartInstance.value) return

  const inject = () => {
    const elements = buildBreathGraphicElements(name)
    if (elements.length) {
      chartInstance.value?.setOption({ graphic: { elements } })
    }
  }

  if (delayMs > 0) {
    breathTimer.value = setTimeout(inject, delayMs)
  } else {
    inject()
  }
}

function removeBreath() {
  if (breathTimer.value !== null) {
    clearTimeout(breathTimer.value)
    breathTimer.value = null
  }
  chartInstance.value?.setOption({ graphic: { elements: [] } }, { replaceMerge: ['graphic'] })
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
  if (currentCity.value) {
    applyBreath(currentCity.value)
  }
  updateMinimap()
}

function handleResize() {
  chartInstance.value?.resize()
}

function handleMapClick(params: any) {
  if (params.seriesType !== 'map') return
  const name = params.name as string
  const center = cityCenterMap.value.get(name)
  if (!center) return

  clearTargetInteractions(componentIdRef.value)

  if (currentCity.value === name) {
    currentCity.value = ''
    removeBreath()
    updateChart()
    isZoomed.value = false
    return
  } else {
    currentCity.value = name
    updateChart()
    applyBreath(name, 800)
    isZoomed.value = true
  }
  dispatch('click', { name, value: params.value })
}

function handleResetView() {
  currentCity.value = ''
  removeBreath()
  updateChart()
  isZoomed.value = false
  clearTargetInteractions(componentIdRef.value)
}

function buildMinimapOption(): any {
  const cs = chartStyleRef.value ?? DEFAULT_CHART_STYLE
  const s = cs.series
  const source: any[] = (optionRef.value.dataset?.source ?? [])

  const isActive = (n: string) => currentCity.value && n === currentCity.value
  const isDimmed = (n: string) => currentCity.value && n !== currentCity.value

  const series: any = {
    type: 'map',
    map: props.geoKey,
    roam: false,
    selectedMode: false,
    zoom: DEFAULT_ZOOM,
    animation: false,
    animationDurationUpdate: 0,
    label: { show: false },
    itemStyle: {
      areaColor: {
        type: 'linear', x: 0, y: 0.5, x2: 0, y2: 0,
        colorStops: [
          { offset: 0, color: 'rgba(8,39,73,1)' },
          { offset: 1, color: 'rgba(34,69,104,1)' },
        ],
        global: false,
      },
      borderColor: s.mapRegionBorderColor,
      borderWidth: 0.5,
    },
    data: source.map((item: any) => {
      const name = item?.[0] ?? ''
      const isThisActive = isActive(name)
      return {
        name,
        value: item?.[1] ?? 0,
        itemStyle: isDimmed(name) ? {
          areaColor: 'rgba(8,22,42,0.9)',
          borderColor: 'rgba(0,60,120,0.15)',
          borderWidth: 0.5,
        } : (isThisActive ? {
          areaColor: s.mapSelectColor,
          borderColor: s.mapSelectBorderColor,
          borderWidth: s.mapSelectBorderWidth,
          shadowBlur: s.mapSelectShadowBlur,
          shadowColor: s.mapSelectShadowColor,
          shadowOffsetY: 0,
          shadowOffsetX: 0,
        } : undefined),
      }
    }),
    markPoint: s.mapMarkPointShow ? {
      symbol: 'circle',
      symbolSize: 5,
      z: 100,
      itemStyle: { color: s.mapMarkPointColor },
      data: GeoJSON.features.map((item: any) => ({
        name: item.properties.name,
        coord: item.properties.center,
        symbolSize: isActive(item.properties.name) ? 7 : undefined,
        itemStyle: isDimmed(item.properties.name) ? { color: 'rgba(0,128,255,0.05)' } : undefined,
      })),
    } : undefined,
  }

  return { backgroundColor: 'transparent', series: [series] }
}

function initMinimap() {
  if (!minimapChartRef.value) return
  minimapInstance.value?.dispose()
  minimapInstance.value = echarts.init(minimapChartRef.value, undefined, { renderer: 'canvas' })
  minimapInstance.value.setOption(buildMinimapOption())
  minimapInstance.value.on('click', () => {
    handleResetView()
  })
}

function updateMinimap() {
  if (!minimapInstance.value || !mapReady.value) return
  minimapInstance.value.setOption(buildMinimapOption(), { notMerge: true })
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

    const zm = new Map<string, number>()
    features.forEach((f: any) => {
      if (f.properties?.name) zm.set(f.properties.name, computeCityZoom(f.properties.name))
    })
    cityZoomMap.value = zm

    mapReady.value = true
    await nextTick()
    initChart()
  } catch (e) {
    console.warn(`[MapChart] GeoJSON for "${props.geoKey}" not found.`, e)
  }
})

onUnmounted(() => {
  removeBreath()
  resizeObserver.disconnect()
  chartInstance.value?.dispose()
  minimapInstance.value?.dispose()
})

watch(() => [widthRef.value, heightRef.value], () => {
  requestAnimationFrame(() => chartInstance.value?.resize())
})

watch(() => optionRef.value, updateChart, { deep: true })
watch(() => JSON.stringify(chartStyleRef.value), updateChart)

watch(currentCity, async (val) => {
  if (val) {
    await nextTick()
    if (!minimapInstance.value) {
      initMinimap()
    } else {
      updateMinimap()
    }
  } else {
    minimapInstance.value?.dispose()
    minimapInstance.value = undefined
  }
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
.map-minimap {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 180px;
  height: 135px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(0,200,255,0.25);
  box-shadow: 0 4px 20px rgba(0,0,0,0.5);
  background: rgba(8,22,42,0.92);
  z-index: 10;
}
.minimap-chart-canvas {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
