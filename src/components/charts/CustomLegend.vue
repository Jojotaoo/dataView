<template>
  <div class="custom-legend" :style="legendStyle">
    <div
      v-for="item in items"
      :key="item.name"
      class="legend-item"
      :class="{ inactive: hoveredName !== null && hoveredName !== item.name }"
      @mouseenter="onLegendEnter(item.name)"
      @mouseleave="onLegendLeave"
    >
      <div class="legend-left">
        <span class="legend-icon" :class="`icon-${icon}`" :style="{ backgroundColor: item.color }"></span>
        <span class="legend-text" :style="{ fontSize: `${fontSize}px`, color: textColor }">{{ item.name }}</span>
      </div>
      <div class="legend-right" :style="{ fontSize: `${fontSize}px`, color: textColor }">
        <span>{{ item.value }}{{ unit }}</span>
        <span class="legend-percent">({{ item.percent }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = withDefaults(defineProps<{
  data: Array<{ name: string; value?: number | string; percent?: string }>
  colorList: string[]
  chartInstance: any
  icon?: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond'
  fontSize?: number
  textColor?: string
  gridColumns?: number
  itemGap?: number
  position?: 'bottom' | 'left' | 'right' | 'top' | 'bottom-flow'
  unit?: string
}>(), {
  icon: 'circle',
  fontSize: 11,
  textColor: '#cdd6f4',
  gridColumns: 3,
  itemGap: 8,
  position: 'bottom',
  unit: '',
})

const hoveredName = ref<string | null>(null)

const items = computed(() =>
  props.data.map((d, i) => ({
    name: d.name,
    color: props.colorList[i % props.colorList.length] || '#89b4fa',
    value: d.value ?? '',
    percent: d.percent ?? '',
  }))
)

const legendStyle = computed(() => {
  const style: Record<string, string> = {
    display: 'grid',
    gridTemplateColumns: `repeat(${props.gridColumns}, 1fr)`,
    gap: `${props.itemGap}px`,
  }
  if (props.position === 'bottom') {
    style.position = 'absolute'
    style.bottom = '8px'
    style.left = '16px'
    style.right = '16px'
    style.zIndex = '10'
  } else if (props.position === 'top') {
    style.position = 'absolute'
    style.top = '8px'
    style.left = '16px'
    style.right = '16px'
    style.zIndex = '10'
  } else if (props.position === 'left') {
    style.position = 'absolute'
    style.top = '50%'
    style.left = '8px'
    style.transform = 'translateY(-50%)'
    style.gridTemplateColumns = '1fr'
    style.zIndex = '10'
  } else if (props.position === 'right') {
    style.position = 'absolute'
    style.top = '50%'
    style.right = '8px'
    style.transform = 'translateY(-50%)'
    style.gridTemplateColumns = '1fr'
    style.zIndex = '10'
  } else if (props.position === 'bottom-flow') {
    style.padding = '8px 16px'
  }
  return style
})

function setSeriesDataOpacity(targetName: string | null) {
  if (!props.chartInstance) return
  const opt = props.chartInstance.getOption()
  if (!opt.series?.[0]?.data) return

  const newData = opt.series[0].data.map((d: any) => ({
    name: d.name,
    value: d.value,
    itemStyle: {
      ...(d.itemStyle || {}),
      opacity: targetName !== null ? (d.name === targetName ? 1 : 0.3) : 1,
    },
  }))

  props.chartInstance.setOption({ series: [{ data: newData }] })
}

function onLegendEnter(name: string) {
  hoveredName.value = name
  setSeriesDataOpacity(name)
}

function onLegendLeave() {
  hoveredName.value = null
  setSeriesDataOpacity(null)
}

function onChartMouseOver(params: any) {
  if (params?.componentType === 'series' && params?.seriesType === 'pie') {
    hoveredName.value = params.name
  }
}

function onChartMouseOut(params: any) {
  if (params?.componentType === 'series' && params?.seriesType === 'pie') {
    hoveredName.value = null
  }
}

function bindEvents() {
  if (!props.chartInstance) return
  props.chartInstance.on('mouseover', onChartMouseOver)
  props.chartInstance.on('mouseout', onChartMouseOut)
}

function unbindEvents() {
  if (!props.chartInstance) return
  props.chartInstance.off('mouseover', onChartMouseOver)
  props.chartInstance.off('mouseout', onChartMouseOut)
}

watch(() => props.chartInstance, (inst) => {
  unbindEvents()
  if (inst) bindEvents()
})

onMounted(() => {
  bindEvents()
})

onUnmounted(() => {
  unbindEvents()
})
</script>

<style scoped>
.custom-legend {
  pointer-events: auto;
}
.legend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;
}
.legend-item:hover {
  opacity: 0.8;
}
.legend-item.inactive {
  opacity: 0.35;
}
.legend-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.legend-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.legend-percent {
  opacity: 0.6;
}
.legend-icon {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
}
.legend-icon.icon-circle {
  border-radius: 50%;
}
.legend-icon.icon-rect {
  border-radius: 0;
}
.legend-icon.icon-roundRect {
  border-radius: 2px;
}
.legend-icon.icon-triangle {
  width: 0;
  height: 0;
  background: none !important;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 10px solid currentColor;
}
.legend-icon.icon-diamond {
  transform: rotate(45deg);
  border-radius: 1px;
}
.legend-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
