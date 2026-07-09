<template>
  <div>
    <div class="section-title">图表配置</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">标题</label>
        <input type="text" class="prop-input" :value="comp.option.title" @input="updateOption('title', ($event.target as HTMLInputElement).value)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '../../../stores/dashboard'
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'

const store = useDashboardStore()
const { comp } = useChartStyleEditor()

function updateOption(key: string, value: any) {
  if (!store.selectedComponent) return
  store.updateComponentOption(store.selectedComponent.id, key, value)
}
</script>

<style>
@import './shared-form-styles.css';
</style>
