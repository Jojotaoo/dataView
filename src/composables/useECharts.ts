import { ref, onMounted, onUnmounted, watch, shallowRef, type Ref } from 'vue'
import * as echarts from 'echarts'
import type { SeriesOption } from 'echarts'

export function useECharts(option: Ref<Record<string, any>>, width: Ref<number>, height: Ref<number>, seriesOption: SeriesOption) {
  const chartRef = ref<HTMLDivElement>()
  const chartInstance = shallowRef<echarts.ECharts>()

  function buildOption(): echarts.EChartsOption {
    const ds = option.value.dataset ?? { dimensions: [], source: [] }
    return {
      backgroundColor: 'transparent',
      dataset: [
        {
          dimensions: ds.dimensions ?? [],
          source: ds.source ?? [],
        },
      ],
      title: {
        text: option.value.title ?? '',
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
      series: [seriesOption],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#313244',
        borderColor: '#45475a',
        textStyle: { color: '#cdd6f4', fontSize: 12 },
      },
    }
  }

  function initChart() {
    if (!chartRef.value) return
    chartInstance.value?.dispose()
    chartInstance.value = echarts.init(chartRef.value, undefined, { renderer: 'canvas' })
    chartInstance.value.setOption(buildOption())
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

  watch(() => [width.value, height.value], () => {
    requestAnimationFrame(() => chartInstance.value?.resize())
  })

  watch(() => option.value, () => {
    if (chartInstance.value) {
      chartInstance.value.setOption(buildOption())
    }
  }, { deep: true })

  return { chartRef }
}
