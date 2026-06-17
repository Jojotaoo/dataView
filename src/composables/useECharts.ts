import { ref, onMounted, onUnmounted, watch, shallowRef, type Ref } from 'vue'
import * as echarts from 'echarts'
import type { SeriesOption } from 'echarts'
import type { ChartStyleConfig } from '../types'
import { DEFAULT_CHART_STYLE } from '../types'

export function useECharts(
  option: Ref<Record<string, any>>,
  width: Ref<number>,
  height: Ref<number>,
  chartStyle: Ref<ChartStyleConfig>,
  seriesOption: Ref<SeriesOption>,
) {
  const chartRef = ref<HTMLDivElement>()
  const chartInstance = shallowRef<echarts.ECharts>()

  function buildOption(): echarts.EChartsOption {
    const cs = chartStyle.value ?? DEFAULT_CHART_STYLE
    const ds = option.value.dataset ?? { dimensions: [], source: [] }

    const hasTitle = cs.titleStyle.show && !!option.value.title
    const titleTopPx = typeof cs.titleStyle.top === 'number' ? cs.titleStyle.top : 8
    const titleBottom = hasTitle ? titleTopPx + cs.titleStyle.fontSize + 8 : 0

    const hasLegend = cs.legend.show
    const legendTopPx = typeof cs.legend.top === 'number' ? cs.legend.top : 38
    const legendBottom = hasLegend ? legendTopPx + 24 : 0

    const gridTop = Math.max(cs.grid.top, titleBottom, legendBottom)

    const result: any = {
      backgroundColor: cs.backgroundColor,
      dataset: [
        {
          dimensions: ds.dimensions ?? [],
          source: ds.source ?? [],
        },
      ],
      grid: {
        left: cs.grid.left,
        right: cs.grid.right,
        top: gridTop,
        bottom: cs.grid.bottom,
      },
      series: [seriesOption.value],
    }

    if (hasTitle) {
      result.title = {
        text: option.value.title,
        textStyle: { color: cs.titleStyle.color, fontSize: cs.titleStyle.fontSize, fontWeight: 600 },
        left: cs.titleStyle.left,
        top: cs.titleStyle.top,
      }
    }

    if (hasLegend) {
      result.legend = {
        orient: cs.legend.orient,
        left: cs.legend.left,
        top: cs.legend.top,
        textStyle: { fontSize: cs.legend.fontSize, color: '#cdd6f4' },
        icon: cs.legend.icon,
      }
    }

    if (cs.xAxis.show) {
      result.xAxis = {
        type: 'category',
        name: cs.xAxis.name || undefined,
        axisLine: { lineStyle: { color: '#45475a' } },
        axisLabel: { color: '#a6adc8', fontSize: cs.xAxis.labelFontSize, rotate: cs.xAxis.labelRotate },
        axisTick: { alignWithLabel: true },
      }
    }

    if (cs.yAxis.show) {
      result.yAxis = {
        type: 'value',
        name: cs.yAxis.name || undefined,
        min: cs.yAxis.min ?? undefined,
        max: cs.yAxis.max ?? undefined,
        splitLine: cs.yAxis.splitLineShow ? { lineStyle: { color: '#313244' } } : { show: false },
        axisLabel: { color: '#a6adc8', fontSize: cs.yAxis.labelFontSize },
      }
    }

    if (cs.tooltip.show && cs.tooltip.trigger !== 'none') {
      result.tooltip = {
        trigger: cs.tooltip.trigger,
        backgroundColor: '#313244',
        borderColor: '#45475a',
        textStyle: { color: '#cdd6f4', fontSize: 12 },
      }
    }

    return result
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

  function updateChart() {
    if (!chartInstance.value) return
    chartInstance.value.setOption(buildOption(), { notMerge: true })
  }

  watch(() => option.value, updateChart, { deep: true })
  watch(() => seriesOption.value, updateChart, { deep: true })
  watch(() => JSON.stringify(chartStyle.value), updateChart)

  return { chartRef }
}
