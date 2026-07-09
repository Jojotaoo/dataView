<template>
  <details class="style-section">
    <summary class="style-summary">Tooltip</summary>
    <div class="prop-form">
      <div class="prop-group row">
        <label class="prop-label">显示 Tooltip</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.chartStyle?.tooltip.show" @change="onChartStyle('tooltip.show', ($event.target as HTMLInputElement).checked)" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="prop-group">
        <label class="prop-label">触发方式</label>
        <select class="prop-select" :value="comp.chartStyle?.tooltip.trigger" @change="onChartStyle('tooltip.trigger', ($event.target as HTMLSelectElement).value)">
          <option value="axis">坐标轴</option>
          <option value="item">数据项</option>
          <option value="none">无</option>
        </select>
      </div>
      <div class="prop-group">
        <label class="prop-label">背景色</label>
        <input type="color" class="prop-color" :value="comp.chartStyle?.tooltip.backgroundColor" @input="onChartStyle('tooltip.backgroundColor', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">边框色</label>
        <input type="color" class="prop-color" :value="comp.chartStyle?.tooltip.borderColor" @input="onChartStyle('tooltip.borderColor', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">文字颜色</label>
        <input type="color" class="prop-color" :value="comp.chartStyle?.tooltip.textColor" @input="onChartStyle('tooltip.textColor', ($event.target as HTMLInputElement).value)" />
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'
const { comp, onChartStyle } = useChartStyleEditor()
</script>

<style>
@import './shared-form-styles.css';
</style>
