<template>
  <div class="pie-grid-chart" :style="{ backgroundColor: containerBg }">
    <div class="chart-area">
      <div ref="chartRef" class="pie-chart"></div>
      <div v-if="chartStyle?.series.subTitle" :class="['center-text', { fontSize: chartStyle.series.labelFontSize }]">
        <div class="total-label">{{ totalValue }}</div>
        <div class="sub-title">{{ chartStyle.series.subTitle }}</div>
      </div>
    </div>
    <CustomLegend
      v-if="chartStyle?.legend.show && chartStyle?.legend.layoutMode === 'grid'"
      :data="legendData"
      :color-list="colorList"
      :chart-instance="chartInstance"
      :icon="chartStyle.legend.icon"
      :font-size="chartStyle.legend.fontSize"
      :text-color="chartStyle.legend.textColor"
      :grid-columns="chartStyle.legend.gridColumns"
      :item-gap="chartStyle.legend.itemGap"
      :unit="chartStyle.legend.unit || ''"
      position="bottom-flow"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import type { SeriesOption } from 'echarts'
import { useECharts } from '../../composables/useECharts'
import { useInteractFilter } from '../../composables/useInteractFilter'
import type { ChartStyleConfig } from '../../types'
import { DEFAULT_CHART_STYLE } from '../../types'
import CustomLegend from './CustomLegend.vue'

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
    legend: { show: false },
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

const filteredData = computed(() =>
  filteredSource.value.map((item: any) => ({ name: item?.[0] ?? '' }))
)

const legendData = computed(() => {
  const total = filteredSource.value.reduce((sum: number, item: any) => sum + (Number(item?.[1]) || 0), 0)
  return filteredSource.value.map((item: any) => ({
    name: item?.[0] ?? '',
    value: item?.[1] ?? 0,
    percent: total > 0 ? ((Number(item?.[1]) / total) * 100).toFixed(1) : '0',
  }))
})

const colorList = computed(() => chartStyleRef.value.series.colorList)

const totalValue = computed(() =>
  filteredSource.value.reduce((sum: number, item: any) => sum + (Number(item?.[1]) || 0), 0)
)

const seriesOption = computed((): SeriesOption => {
  const s = chartStyleRef.value.series
  const ds = optionRef.value.dataset ?? { dimensions: [], source: [] }

  const outerRadius = s.pieRadius > 0 ? '70%' : '70%'
  const innerRadius = s.pieRadius > 0 ? s.pieRadius + '%' : '0%'

  return {
    type: 'pie',
    name: ds.dimensions?.[1] ?? '',
    radius: [innerRadius, outerRadius],
    center: ['50%', '50%'],
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
      // formatter: ['{a|{c}}','{b|{b}}'].join('\n'),
      // rich: {
      //   a: {
      //     fontSize: s.labelFontSize,
      //     color: s.labelColor,
      //     fontWeight: 900,
      //   },
      //   b: {
      //     fontSize: s.labelFontSize / 2,
      //     color: 'gray',
      //     lineHeight: 18,
      //     padding: [s.labelFontSize / 5, 0, 0, 0],
      //   }
      // }
    //   formatter: [
    //     '{a|{b} ({d}%)}',
    //     '{b|这段文本采用样式b}这段用默认样式{x|这段用样式x}'
    // ].join('\n'),

    // rich: {
    //     a: {
    //         color: 'red',
    //         lineHeight: 10
    //     },
    //     b: {
    //         backgroundColor: {
    //             image: 'xxx/xxx.jpg'
    //         },
    //         height: 40
    //     },
    //     x: {
    //         fontSize: 18,
    //         fontFamily: 'Microsoft YaHei',
    //         borderColor: '#449933',
    //         borderRadius: 4
    //     },
    // }
    },
    emphasis: {
      focus: 'self',
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    },
    blur: {
      itemStyle: {
        opacity: 0.3,
      },
    },
    itemStyle: {
      borderRadius: 4,
      borderColor: 'transparent',
      borderWidth: 2,
    },
  }
})

const { chartRef, chartInstance } = useECharts(filteredOption, widthRef, heightRef, chartStyleRef, seriesOption, 'pie')
</script>

<style scoped>
.pie-grid-chart {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}
.chart-area {
  flex: 1;
  position: relative;
  min-height: 0;
}
.pie-chart {
  width: 100%;
  height: 100%;
}
.center-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}
.total-label {
  font-size: 14px;
  font-weight: 900;
  color: #cdd6f4;
}
.sub-title {
  font-size: 11px;
  color: #a6adc8;
  margin-top: 4px;
}
</style>
