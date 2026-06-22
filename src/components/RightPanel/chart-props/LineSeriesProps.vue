<template>
  <div>
    <div class="prop-group row">
      <label class="prop-label">平滑曲线</label>
      <label class="switch">
        <input type="checkbox" :checked="comp.chartStyle?.series.smooth" @change="onChartStyle('series.smooth', ($event.target as HTMLInputElement).checked)" />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="prop-group">
      <label class="prop-label">数据点形状</label>
      <select class="prop-select" :value="comp.chartStyle?.series.symbol" @change="onChartStyle('series.symbol', ($event.target as HTMLSelectElement).value)">
        <option value="circle">圆</option>
        <option value="rect">方块</option>
        <option value="roundRect">圆角方块</option>
        <option value="triangle">三角</option>
        <option value="diamond">菱形</option>
        <option value="none">无</option>
      </select>
    </div>
    <div class="prop-group">
      <label class="prop-label">数据点大小</label>
      <input type="number" class="prop-input" :value="comp.chartStyle?.series.symbolSize" @input="onChartStyle('series.symbolSize', numVal($event))" />
    </div>
    <div class="prop-group">
      <label class="prop-label">线条粗细</label>
      <input type="number" class="prop-input" :value="comp.chartStyle?.series.lineWidth" @input="onChartStyle('series.lineWidth', numVal($event))" />
    </div>
    <div class="prop-group row">
      <label class="prop-label">面积填充</label>
      <label class="switch">
        <input type="checkbox" :checked="comp.chartStyle?.series.showArea" @change="onChartStyle('series.showArea', ($event.target as HTMLInputElement).checked)" />
        <span class="switch-slider"></span>
      </label>
    </div>
    <template v-if="comp.chartStyle?.series.showArea">
      <div class="prop-group">
        <label class="prop-label">面积起始透明度 ({{ comp.chartStyle?.series.areaOpacityStart }})</label>
        <input type="range" min="0" max="1" step="0.05" class="prop-range" :value="comp.chartStyle?.series.areaOpacityStart" @input="onChartStyle('series.areaOpacityStart', parseFloat(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">面积结束透明度 ({{ comp.chartStyle?.series.areaOpacityEnd }})</label>
        <input type="range" min="0" max="1" step="0.05" class="prop-range" :value="comp.chartStyle?.series.areaOpacityEnd" @input="onChartStyle('series.areaOpacityEnd', parseFloat(($event.target as HTMLInputElement).value))" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../../../stores/dashboard'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

function onChartStyle(path: string, value: any) {
  if (!store.selectedComponent) return
  store.updateChartStyle(store.selectedComponent.id, path, value)
}

function numVal(event: Event) {
  return Number((event.target as HTMLInputElement).value)
}
</script>

<style>
@import './shared-form-styles.css';
</style>
