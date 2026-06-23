<template>
  <div ref="chartRef" class="bar-chart" :style="{ backgroundColor: containerBg }"></div>
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

const seriesOption = computed((): SeriesOption => {
  const s = chartStyleRef.value.series
  const dims = optionRef.value.dataset?.dimensions
  const useColorList = s.colorList.length > 0
  return {
    type: 'bar',
    name: dims?.[1] ?? '',
    encode: { x: 0, y: 1 },
    barWidth: s.barWidth as any,
    itemStyle: {
      borderRadius: [s.barBorderRadius, s.barBorderRadius, 0, 0],
      ...(useColorList ? {} : {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: s.color },
          { offset: 1, color: s.colorEnd },
        ]),
      }),
    },
    label: s.showLabel
      ? {
          show: true,
          position: 'top',
          color: s.labelColor,
          fontSize: s.labelFontSize,
          formatter: (p: any) => (p.data?.[1] ?? p.value),
        }
      : { show: false },
  }
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
.bar-chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
