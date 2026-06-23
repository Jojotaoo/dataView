<template>
  <div ref="chartRef" class="pie-chart" :style="{ backgroundColor: containerBg }"></div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
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

const seriesOption = computed((): SeriesOption => {
  const s = chartStyleRef.value.series
  const ds = optionRef.value.dataset ?? { dimensions: [], source: [] }

  const outerRadius = s.pieRadius > 0 ? '70%' : '70%'
  const innerRadius = s.pieRadius > 0 ? s.pieRadius + '%' : '0%'

  return {
    type: 'pie',
    name: ds.dimensions?.[1] ?? '',
    radius: [innerRadius, outerRadius],
    center: ['50%', '55%'],
    roseType: s.pieRoseType ? 'area' : undefined,
    data: filteredSource.value.map((item: any) => ({
      name: item?.[0] ?? '',
      value: item?.[1] ?? 0,
    })),
    label: {
      show: s.showLabel,
      position: s.pieLabelPosition,
      color: s.labelColor,
      fontSize: s.labelFontSize,
    },
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
    itemStyle: {
      borderRadius: 4,
      borderColor: 'transparent',
      borderWidth: 2,
    },
  }
})

const { chartRef } = useECharts(filteredOption, widthRef, heightRef, chartStyleRef, seriesOption, 'pie')
</script>

<style scoped>
.pie-chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
