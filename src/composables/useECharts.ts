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
  seriesType: 'axis' | 'pie' | 'geo' = 'axis',
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

    const isPie = seriesType === 'pie'
    const isGeo = seriesType === 'geo'

    const result: any = {
      backgroundColor: cs.backgroundColor,
      color: cs.series.colorList.length > 0 ? cs.series.colorList : undefined,
      series: [seriesOption.value],
    }

    if (!isPie && !isGeo) {
      result.dataset = [
        {
          dimensions: ds.dimensions ?? [],
          source: ds.source ?? [],
        },
      ]
      result.grid = {
        left: cs.grid.left,
        right: cs.grid.right,
        top: gridTop,
        bottom: cs.grid.bottom,
      }
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
        textStyle: { fontSize: cs.legend.fontSize, color: cs.legend.textColor },
        icon: cs.legend.icon,
      }
    }

    if (!isPie && !isGeo && cs.xAxis.show) {
      result.xAxis = {
        type: 'category',
        name: cs.xAxis.name || undefined,
        axisLine: { lineStyle: { color: cs.xAxis.lineColor } },
        axisLabel: { color: cs.xAxis.labelColor, fontSize: cs.xAxis.labelFontSize, rotate: cs.xAxis.labelRotate },
        axisTick: { alignWithLabel: true },
      }
    }

    if (!isPie && !isGeo && cs.yAxis.show) {
      result.yAxis = {
        type: 'value',
        name: cs.yAxis.name || undefined,
        min: cs.yAxis.min ?? undefined,
        max: cs.yAxis.max ?? undefined,
        splitLine: cs.yAxis.splitLineShow ? { lineStyle: { color: cs.yAxis.splitLineColor } } : { show: false },
        axisLabel: { color: cs.yAxis.labelColor, fontSize: cs.yAxis.labelFontSize },
      }
    }

    if (cs.tooltip.show && cs.tooltip.trigger !== 'none') {
      result.tooltip = {
        trigger: (isPie || isGeo) ? 'item' : cs.tooltip.trigger,
        backgroundColor: cs.tooltip.backgroundColor,
        borderColor: cs.tooltip.borderColor,
        textStyle: { color: cs.tooltip.textColor, fontSize: 12 },
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
