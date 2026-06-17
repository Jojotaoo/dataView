<template>
  <div ref="chartRef" class="bar-chart" :style="{ backgroundColor: bgColor }"></div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import * as echarts from 'echarts'
import type { SeriesOption } from 'echarts'
import { useECharts } from '../../composables/useECharts'
import type { ChartStyleConfig } from '../../types'
import { DEFAULT_CHART_STYLE } from '../../types'

const props = withDefaults(defineProps<{
  option?: Record<string, any>
  width?: number
  height?: number
  bgColor?: string
  chartStyle?: ChartStyleConfig
}>(), {
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

const seriesOption = computed((): SeriesOption => {
  const s = chartStyleRef.value.series
  const dims = optionRef.value.dataset?.dimensions
  return {
    type: 'bar',
    name: dims?.[1] ?? '',
    encode: { x: 0, y: 1 },
    barWidth: s.barWidth as any,
    itemStyle: {
      borderRadius: [s.barBorderRadius, s.barBorderRadius, 0, 0],
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#89b4fa' },
        { offset: 1, color: '#45475a' },
      ]),
    },
    label: s.showLabel
      ? {
          show: true,
          position: 'top',
          color: '#cdd6f4',
          fontSize: s.labelFontSize,
          formatter: (p: any) => (p.data?.[1] ?? p.value),
        }
      : { show: false },
  }
})

const { chartRef } = useECharts(optionRef, widthRef, heightRef, chartStyleRef, seriesOption)
</script>

<style scoped>
.bar-chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
