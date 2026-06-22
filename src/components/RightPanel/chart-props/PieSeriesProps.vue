<template>
  <div>
    <div class="prop-group">
      <label class="prop-label">内半径 ({{ comp.chartStyle?.series.pieRadius }}%)</label>
      <input type="range" min="0" max="70" step="1" class="prop-range" :value="comp.chartStyle?.series.pieRadius" @input="onChartStyle('series.pieRadius', parseInt(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="prop-group row">
      <label class="prop-label">玫瑰模式</label>
      <label class="switch">
        <input type="checkbox" :checked="comp.chartStyle?.series.pieRoseType" @change="onChartStyle('series.pieRoseType', ($event.target as HTMLInputElement).checked)" />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="prop-group">
      <label class="prop-label">标签位置</label>
      <select class="prop-select" :value="comp.chartStyle?.series.pieLabelPosition" @change="onChartStyle('series.pieLabelPosition', ($event.target as HTMLSelectElement).value)">
        <option value="outside">外侧</option>
        <option value="inside">内部</option>
        <option value="center">中心</option>
      </select>
    </div>
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
</script>

<style>
@import './shared-form-styles.css';
</style>
