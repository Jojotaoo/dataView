<template>
  <div>
    <div class="prop-group">
      <label class="prop-label">柱宽度</label>
      <input type="text" class="prop-input" :value="comp.chartStyle?.series.barWidth" @input="onChartStyle('series.barWidth', ($event.target as HTMLInputElement).value)" />
    </div>
    <div class="prop-group">
      <label class="prop-label">圆角</label>
      <input type="number" class="prop-input" :value="comp.chartStyle?.series.barBorderRadius" @input="onChartStyle('series.barBorderRadius', numVal($event))" />
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

function numVal(event: Event) {
  return Number((event.target as HTMLInputElement).value)
}
</script>

<style>
@import './shared-form-styles.css';
</style>
