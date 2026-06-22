<template>
  <div class="prop-group" style="margin-top: 8px;">
    <label class="prop-label">图表背景色</label>
    <div class="prop-color-row">
      <input type="color" class="prop-color" :value="comp.chartStyle?.backgroundColor" @input="onChartStyle('backgroundColor', ($event.target as HTMLInputElement).value)" />
      <span class="prop-color-text">{{ comp.chartStyle?.backgroundColor }}</span>
    </div>
  </div>
  <div class="prop-group">
    <label class="prop-label">背景透明度</label>
    <div class="prop-input-group">
      <input type="range" min="0" max="1" step="0.05" class="prop-range" :value="comp.chartStyle?.backgroundOpacity ?? 1" @input="onChartStyle('backgroundOpacity', Number(($event.target as HTMLInputElement).value))" />
      <span class="prop-range-value">{{ Math.round((comp.chartStyle?.backgroundOpacity ?? 1) * 100) }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'
const { comp, onChartStyle } = useChartStyleEditor()
</script>

<style>
@import './shared-form-styles.css';
.prop-color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.prop-color-text {
  font-size: 11px;
  color: var(--ctp-surface1);
  font-family: monospace;
}
.prop-range {
  flex: 1;
  accent-color: var(--ctp-accent);
  height: 4px;
}
.prop-range-value {
  font-size: 11px;
  color: var(--ctp-surface1);
  min-width: 36px;
  text-align: right;
}
</style>
