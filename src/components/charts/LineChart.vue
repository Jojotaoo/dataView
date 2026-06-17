<template>
  <div ref="chartRef" class="line-chart" :style="{ backgroundColor: bgColor }"></div>
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

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const seriesOption = computed((): SeriesOption => {
  const s = chartStyleRef.value.series
  const dims = optionRef.value.dataset?.dimensions
  const useColorList = s.colorList.length > 0
  return {
    type: 'line',
    name: dims?.[1] ?? '',
    encode: { x: 0, y: 1 },
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
            ? hexToRgba(s.colorList[0] ?? s.color, s.areaOpacityStart)
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
          formatter: (p: any) => (p.data?.[1] ?? p.value),
        }
      : { show: false },
  }
})

const { chartRef } = useECharts(optionRef, widthRef, heightRef, chartStyleRef, seriesOption)
</script>

<style scoped>
.line-chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
