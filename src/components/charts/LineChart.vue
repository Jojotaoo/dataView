<template>
  <div ref="chartRef" class="line-chart" :style="{ backgroundColor: containerBg }"></div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import * as echarts from 'echarts'
import type { SeriesOption } from 'echarts'
import { useECharts } from '../../composables/useECharts'
import { useInteractFilter } from '../../composables/useInteractFilter'
import type { ChartStyleConfig } from '../../types'
import { DEFAULT_CHART_STYLE } from '../../types'

const props = withDefaults(defineProps<{
  componentId?: string
  option?: Record<string, any>
  width?: number
  height?: number
  bgColor?: string
  chartStyle?: ChartStyleConfig
}>(), {
  componentId: '',
  option: () => ({}),
  width: 400,
  height: 300,
  bgColor: '#1e1e2e',
  chartStyle: undefined,
})

const optionRef = toRef(props, 'option')
const widthRef = toRef(props, 'width')
const heightRef = toRef(props, 'height')
const chartStyleRef = computed(() => props.chartStyle ?? DEFAULT_CHART_STYLE)

const componentIdRef = toRef(props, 'componentId')
const dimensions = computed(() => optionRef.value.dataset?.dimensions ?? [])
const source = computed(() => optionRef.value.dataset?.source ?? [])
const { filteredSource } = useInteractFilter(componentIdRef, dimensions, source)

const filteredOption = computed(() => {
  const ds = optionRef.value.dataset
  if (!ds) return optionRef.value
  return {
    ...optionRef.value,
    dataset: { ...ds, source: filteredSource.value },
  }
})

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const seriesOption = computed((): SeriesOption[] => {
  const s = chartStyleRef.value.series
  const dims = optionRef.value.dataset?.dimensions ?? []
  const useColorList = s.colorList.length > 0
  return dims.slice(1).map((dim: string, idx: number) => ({
    type: 'line',
    name: dim,
    encode: { x: 0, y: idx + 1 },
    smooth: s.smooth,
    symbol: s.symbol === 'none' ? 'none' : s.symbol,
    symbolSize: s.symbol === 'none' ? 0 : s.symbolSize,
    lineStyle: {
      width: s.lineWidth,
      ...(useColorList ? {} : { color: s.color }),
    },
    itemStyle: useColorList ? {} : {
      color: s.color,
    },
    areaStyle: s.showArea
      ? {
          color: useColorList
            ? hexToRgba(s.colorList[idx % s.colorList.length] ?? s.color, s.areaOpacityStart)
            : new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: hexToRgba(s.color, s.areaOpacityStart) },
                { offset: 1, color: hexToRgba(s.color, s.areaOpacityEnd) },
              ]),
        }
      : undefined,
    label: s.showLabel
      ? {
          show: true,
          position: 'top',
          color: s.labelColor,
          fontSize: s.labelFontSize,
          formatter: (p: any) => (p.data?.[idx + 1] ?? p.value),
        }
      : { show: false },
  }))
})

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

const { chartRef } = useECharts(filteredOption, widthRef, heightRef, chartStyleRef, seriesOption)
</script>

<style scoped>
.line-chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
