<template>
  <div ref="chartRef" class="bar-chart" :style="{ backgroundColor: bgColor }"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import * as echarts from 'echarts'

const props = withDefaults(defineProps<{
  title?: string
  width?: number
  height?: number
  bgColor?: string
  data?: { label: string; value: number }[]
}>(), {
  title: '柱状图',
  width: 400,
  height: 300,
  bgColor: '#1e1e2e',
  data: () => [],
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
  chartInstance.value.setOption({
    backgroundColor: 'transparent',
    title: {
      text: props.title,
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
      data: props.data.map(d => d.label),
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
        type: 'bar',
        data: props.data.map(d => d.value),
        barWidth: '50%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#89b4fa' },
            { offset: 1, color: '#45475a' },
          ]),
        },
        label: {
          show: true,
          position: 'top',
          color: '#cdd6f4',
          fontSize: 11,
        },
      },
    ],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#313244',
      borderColor: '#45475a',
      textStyle: { color: '#cdd6f4', fontSize: 12 },
    },
  })
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

watch(() => [props.title, props.data, props.bgColor], updateChart, { deep: true })
</script>

<style scoped>
.bar-chart {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>
