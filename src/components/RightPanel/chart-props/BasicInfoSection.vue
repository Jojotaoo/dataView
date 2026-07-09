<template>
  <div>
    <div class="section-title">基本信息</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">组件名称</label>
        <input
          type="text"
          class="prop-input"
          :value="comp.chartConfig.title"
          @input="onTitleChange(($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="prop-group">
        <label class="prop-label">组件类型</label>
        <div class="prop-value-static">{{ comp.key }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'
import { useDashboardStore } from '../../../stores/dashboard'

const store = useDashboardStore()
const { comp } = useChartStyleEditor()

function onTitleChange(value: string) {
  if (comp.value) {
    store.updateComponentTitle(comp.value.id, value)
  }
}
</script>

<style>
@import './shared-form-styles.css';
</style>
