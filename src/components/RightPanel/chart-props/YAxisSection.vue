<template>
  <details class="style-section">
    <summary class="style-summary">Y 轴</summary>
    <div class="prop-form">
      <div class="prop-group row">
        <label class="prop-label">显示 Y 轴</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.chartStyle?.yAxis.show" @change="onChartStyle('yAxis.show', ($event.target as HTMLInputElement).checked)" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="prop-group">
        <label class="prop-label">名称</label>
        <input type="text" class="prop-input" :value="comp.chartStyle?.yAxis.name" @input="onChartStyle('yAxis.name', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">标签字号</label>
        <input type="number" class="prop-input" :value="comp.chartStyle?.yAxis.labelFontSize" @input="onChartStyle('yAxis.labelFontSize', numVal($event))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">最小值</label>
        <input type="number" class="prop-input" :value="comp.chartStyle?.yAxis.min" @input="onChartStyle('yAxis.min', maybeNull($event))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">最大值</label>
        <input type="number" class="prop-input" :value="comp.chartStyle?.yAxis.max" @input="onChartStyle('yAxis.max', maybeNull($event))" />
      </div>
      <div class="prop-group row">
        <label class="prop-label">显示分割线</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.chartStyle?.yAxis.splitLineShow" @change="onChartStyle('yAxis.splitLineShow', ($event.target as HTMLInputElement).checked)" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="prop-group">
        <label class="prop-label">分割线颜色</label>
        <input type="color" class="prop-color" :value="comp.chartStyle?.yAxis.splitLineColor" @input="onChartStyle('yAxis.splitLineColor', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">标签颜色</label>
        <input type="color" class="prop-color" :value="comp.chartStyle?.yAxis.labelColor" @input="onChartStyle('yAxis.labelColor', ($event.target as HTMLInputElement).value)" />
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'
const { comp, onChartStyle, numVal, maybeNull } = useChartStyleEditor()
</script>

<style>
@import './shared-form-styles.css';
</style>
