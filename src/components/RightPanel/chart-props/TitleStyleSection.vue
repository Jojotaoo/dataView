<template>
  <details class="style-section">
    <summary class="style-summary">标题样式</summary>
    <div class="prop-form">
      <div class="prop-group row">
        <label class="prop-label">显示标题</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.chartStyle?.titleStyle.show" @change="onChartStyle('titleStyle.show', ($event.target as HTMLInputElement).checked)" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="prop-group">
        <label class="prop-label">字号</label>
        <input type="number" class="prop-input" :value="comp.chartStyle?.titleStyle.fontSize" @input="onChartStyle('titleStyle.fontSize', numVal($event))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">颜色</label>
        <input type="text" class="prop-input" :value="comp.chartStyle?.titleStyle.color" @input="onChartStyle('titleStyle.color', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-label" style="margin-top: 4px;">位置</div>
      <div class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">水平</label>
          <select class="prop-select" :value="typeof comp.chartStyle?.titleStyle.left === 'string' && !comp.chartStyle?.titleStyle.left.endsWith('%') ? comp.chartStyle?.titleStyle.left : ''" @change="onChartStyle('titleStyle.left', ($event.target as HTMLSelectElement).value || undefined)">
            <option value="">自定义</option>
            <option value="left">左</option>
            <option value="center">居中</option>
            <option value="right">右</option>
          </select>
          <div class="prop-input-group">
            <input type="number" class="prop-input" placeholder="值" :value="posNumVal(comp.chartStyle?.titleStyle.left)" @input="onPosChange('titleStyle.left', ($event.target as HTMLInputElement).value, posUnit(comp.chartStyle?.titleStyle.left))" />
            <select class="prop-select-sm" :value="posUnit(comp.chartStyle?.titleStyle.left)" @change="onPosUnitChange('titleStyle.left', comp.chartStyle?.titleStyle.left, ($event.target as HTMLSelectElement).value)">
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>
        <div class="prop-group">
          <label class="prop-label">垂直</label>
          <select class="prop-select" :value="typeof comp.chartStyle?.titleStyle.top === 'string' && !comp.chartStyle?.titleStyle.top.endsWith('%') ? comp.chartStyle?.titleStyle.top : ''" @change="onChartStyle('titleStyle.top', ($event.target as HTMLSelectElement).value || undefined)">
            <option value="">自定义</option>
            <option value="top">上</option>
            <option value="middle">居中</option>
            <option value="bottom">下</option>
          </select>
          <div class="prop-input-group">
            <input type="number" class="prop-input" placeholder="值" :value="posNumVal(comp.chartStyle?.titleStyle.top)" @input="onPosChange('titleStyle.top', ($event.target as HTMLInputElement).value, posUnit(comp.chartStyle?.titleStyle.top))" />
            <select class="prop-select-sm" :value="posUnit(comp.chartStyle?.titleStyle.top)" @change="onPosUnitChange('titleStyle.top', comp.chartStyle?.titleStyle.top, ($event.target as HTMLSelectElement).value)">
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'
const { comp, onChartStyle, numVal, posUnit, posNumVal, onPosChange, onPosUnitChange } = useChartStyleEditor()
</script>

<style>
@import './shared-form-styles.css';
</style>
