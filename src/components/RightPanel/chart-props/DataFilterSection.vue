<template>
  <div>
    <div class="section-title">数据过滤</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">过滤表达式</label>
        <textarea class="prop-textarea" rows="3" placeholder="data.filter(item => item.value > 100)" :value="comp.filter" @input="updateFilter(($event.target as HTMLTextAreaElement).value)"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '../../../stores/dashboard'
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'

const store = useDashboardStore()
const { comp } = useChartStyleEditor()

function updateFilter(value: string) {
  if (!store.selectedComponent) return
  store.updateComponentFilter(store.selectedComponent.id, value)
}
</script>

<style>
@import './shared-form-styles.css';
</style>
