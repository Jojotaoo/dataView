<template>
  <div ref="chartRef" class="line-chart" :style="{ backgroundColor: bgColor }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'

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

const chartRef = ref<HTMLDivElement>()
const chartInstance = shallowRef<echarts.ECharts>()

function initChart() {
  if (!chartRef.value) return
  chartInstance.value?.dispose()
  chartInstance.value = echarts.init(chartRef.value, undefined, { renderer: 'canvas' })
  updateChart()
}

function updateChart() {
  if (!chartInstance.value) return
  const ds = props.option.dataset ?? { dimensions: [], source: [] }
  const chartOption: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    dataset: [
      {
        dimensions: ds.dimensions ?? [],
        source: ds.source ?? [],
      },
    ],
    title: {
      text: props.option.title ?? '',
      textStyle: { color: '#cdd6f4', fontSize: 14, fontWeight: 600 },
      left: 'center',
      top: 8,
    },
    grid: {
      left: 40,
      right: 20,
      top: 40,
      bottom: 30,
    },
    xAxis: {
      type: 'category',
      axisLine: { lineStyle: { color: '#45475a' } },
      axisLabel: { color: '#a6adc8', fontSize: 11 },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#313244' } },
      axisLabel: { color: '#a6adc8', fontSize: 11 },
    },
    series: [
      {
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
      },
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#313244',
      borderColor: '#45475a',
      textStyle: { color: '#cdd6f4', fontSize: 12 },
    },
  }
  chartInstance.value.setOption(chartOption)
}

function handleResize() {
  chartInstance.value?.resize()
}

const resizeObserver = new ResizeObserver(handleResize)

onMounted(() => {
  initChart()
  if (chartRef.value) {
    resizeObserver.observe(chartRef.value)
  }
})

onUnmounted(() => {
  resizeObserver.disconnect()
  chartInstance.value?.dispose()
})

watch(() => [props.width, props.height], () => {
  requestAnimationFrame(() => chartInstance.value?.resize())
})

watch(() => props.option, updateChart, { deep: true })
</script>

<style scoped>
.line-chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
