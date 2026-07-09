<template>
  <div>
    <div class="section-title">位置与尺寸</div>
    <div class="prop-grid">
      <div class="prop-group">
        <label class="prop-label">X (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.x" @input="updateAttr('x', $event)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">Y (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.y" @input="updateAttr('y', $event)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">宽度 (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.w" @input="updateAttr('w', $event)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">高度 (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.h" @input="updateAttr('h', $event)" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '../../../stores/dashboard'
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'

const store = useDashboardStore()
const { comp } = useChartStyleEditor()

function updateAttr(key: string, event: Event) {
  if (!store.selectedComponent) return
  const value = Number((event.target as HTMLInputElement).value)
  if (isNaN(value)) return
  store.updateComponentAttr(store.selectedComponent.id, key as any, value)
}
</script>

<style>
@import './shared-form-styles.css';
</style>
