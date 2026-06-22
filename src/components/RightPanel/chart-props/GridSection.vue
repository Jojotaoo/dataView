<template>
  <details class="style-section" :open="true">
    <summary class="style-summary">布局</summary>
    <div class="prop-grid">
      <div class="prop-group">
        <label class="prop-label">上边距</label>
        <input type="number" class="prop-input" :value="comp.chartStyle?.grid.top" @input="onChartStyle('grid.top', numVal($event))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">下边距</label>
        <input type="number" class="prop-input" :value="comp.chartStyle?.grid.bottom" @input="onChartStyle('grid.bottom', numVal($event))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">左边距</label>
        <input type="number" class="prop-input" :value="comp.chartStyle?.grid.left" @input="onChartStyle('grid.left', numVal($event))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">右边距</label>
        <input type="number" class="prop-input" :value="comp.chartStyle?.grid.right" @input="onChartStyle('grid.right', numVal($event))" />
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'
const { comp, onChartStyle, numVal } = useChartStyleEditor()
</script>

<style>
@import './shared-form-styles.css';
</style>
