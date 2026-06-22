<template>
  <details class="style-section">
    <summary class="style-summary">X 轴</summary>
    <div class="prop-form">
      <div class="prop-group row">
        <label class="prop-label">显示 X 轴</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.chartStyle?.xAxis.show" @change="onChartStyle('xAxis.show', ($event.target as HTMLInputElement).checked)" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="prop-group">
        <label class="prop-label">名称</label>
        <input type="text" class="prop-input" :value="comp.chartStyle?.xAxis.name" @input="onChartStyle('xAxis.name', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">标签字号</label>
        <input type="number" class="prop-input" :value="comp.chartStyle?.xAxis.labelFontSize" @input="onChartStyle('xAxis.labelFontSize', numVal($event))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">标签旋转 ({{ comp.chartStyle?.xAxis.labelRotate }})</label>
        <input type="range" min="-90" max="90" step="1" class="prop-range" :value="comp.chartStyle?.xAxis.labelRotate" @input="onChartStyle('xAxis.labelRotate', parseInt(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">轴线颜色</label>
        <input type="color" class="prop-color" :value="comp.chartStyle?.xAxis.lineColor" @input="onChartStyle('xAxis.lineColor', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">标签颜色</label>
        <input type="color" class="prop-color" :value="comp.chartStyle?.xAxis.labelColor" @input="onChartStyle('xAxis.labelColor', ($event.target as HTMLInputElement).value)" />
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
