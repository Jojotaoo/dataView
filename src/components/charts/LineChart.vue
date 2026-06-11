<template>
  <div ref="chartRef" class="line-chart" :style="{ backgroundColor: bgColor }"></div>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import * as echarts from 'echarts'
import { useECharts } from '../../composables/useECharts'

const props = withDefaults(defineProps<{
  option?: Record<string, any>
  width?: number
  height?: number
  bgColor?: string
}>(), {
  option: () => ({}),
  width: 400,
  height: 300,
  bgColor: '#1e1e2e',
})

const optionRef = toRef(props, 'option')
const widthRef = toRef(props, 'width')
const heightRef = toRef(props, 'height')

const seriesOption: echarts.SeriesOption = {
  type: 'line',
  encode: { x: 0, y: 1 },
  smooth: true,
  symbol: 'circle',
  symbolSize: 8,
  lineStyle: {
    width: 3,
    color: '#89b4fa',
  },
  itemStyle: {
    color: '#89b4fa',
  },
  areaStyle: {
    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: 'rgba(137, 180, 250, 0.4)' },
      { offset: 1, color: 'rgba(137, 180, 250, 0.02)' },
    ]),
  },
  label: {
    show: true,
    position: 'top',
    color: '#cdd6f4',
    fontSize: 11,
    formatter: (p: any) => (p.data?.[1] ?? p.value),
  },
}

const { chartRef } = useECharts(optionRef, widthRef, heightRef, seriesOption)
</script>

<style scoped>
.line-chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
