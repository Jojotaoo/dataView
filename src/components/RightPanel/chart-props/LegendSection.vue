<template>
  <details class="style-section">
    <summary class="style-summary">图例</summary>
    <div class="prop-form">
      <div class="prop-group row">
        <label class="prop-label">显示图例</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.chartStyle?.legend.show" @change="onChartStyle('legend.show', ($event.target as HTMLInputElement).checked)" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="prop-group">
        <label class="prop-label">排列方向</label>
        <select class="prop-select" :value="comp.chartStyle?.legend.orient" @change="onChartStyle('legend.orient', ($event.target as HTMLSelectElement).value)">
          <option value="horizontal">水平</option>
          <option value="vertical">垂直</option>
        </select>
      </div>
      <div class="prop-label" style="margin-top: 4px;">位置</div>
      <div class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">水平</label>
          <select class="prop-select" :value="typeof comp.chartStyle?.legend.left === 'string' && !comp.chartStyle?.legend.left.endsWith('%') ? comp.chartStyle?.legend.left : ''" @change="onChartStyle('legend.left', ($event.target as HTMLSelectElement).value || undefined)">
            <option value="">自定义</option>
            <option value="left">左</option>
            <option value="center">居中</option>
            <option value="right">右</option>
          </select>
          <div class="prop-input-group">
            <input type="number" class="prop-input" placeholder="值" :value="posNumVal(comp.chartStyle?.legend.left)" @input="onPosChange('legend.left', ($event.target as HTMLInputElement).value, posUnit(comp.chartStyle?.legend.left))" />
            <select class="prop-select-sm" :value="posUnit(comp.chartStyle?.legend.left)" @change="onPosUnitChange('legend.left', comp.chartStyle?.legend.left, ($event.target as HTMLSelectElement).value)">
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>
        <div class="prop-group">
          <label class="prop-label">垂直</label>
          <select class="prop-select" :value="typeof comp.chartStyle?.legend.top === 'string' && !comp.chartStyle?.legend.top.endsWith('%') ? comp.chartStyle?.legend.top : ''" @change="onChartStyle('legend.top', ($event.target as HTMLSelectElement).value || undefined)">
            <option value="">自定义</option>
            <option value="top">上</option>
            <option value="middle">居中</option>
            <option value="bottom">下</option>
          </select>
          <div class="prop-input-group">
            <input type="number" class="prop-input" placeholder="值" :value="posNumVal(comp.chartStyle?.legend.top)" @input="onPosChange('legend.top', ($event.target as HTMLInputElement).value, posUnit(comp.chartStyle?.legend.top))" />
            <select class="prop-select-sm" :value="posUnit(comp.chartStyle?.legend.top)" @change="onPosUnitChange('legend.top', comp.chartStyle?.legend.top, ($event.target as HTMLSelectElement).value)">
              <option value="px">px</option>
              <option value="%">%</option>
            </select>
          </div>
        </div>
      </div>
      <div class="prop-group">
        <label class="prop-label">字号</label>
        <input type="number" class="prop-input" :value="comp.chartStyle?.legend.fontSize" @input="onChartStyle('legend.fontSize', numVal($event))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">图标形状</label>
        <select class="prop-select" :value="comp.chartStyle?.legend.icon" @change="onChartStyle('legend.icon', ($event.target as HTMLSelectElement).value)">
          <option value="circle">圆</option>
          <option value="rect">方块</option>
          <option value="roundRect">圆角方块</option>
          <option value="triangle">三角</option>
          <option value="diamond">菱形</option>
        </select>
      </div>
      <div class="prop-group">
        <label class="prop-label">文字颜色</label>
        <input type="color" class="prop-color" :value="comp.chartStyle?.legend.textColor" @input="onChartStyle('legend.textColor', ($event.target as HTMLInputElement).value)" />
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

<style scoped>
.save-theme-btn {
  width: 100%;
  padding: 6px 0;
  background: #89b4fa;
  border: none;
  border-radius: 6px;
  color: #1e1e2e;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.save-theme-btn:hover {
  background: #b4d0fb;
}
.prop-input-group {
  display: flex;
  gap: 4px;
}
.prop-input-group .prop-input {
  flex: 1;
  min-width: 0;
}
.prop-select-sm {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 4px 4px;
  font-size: 11px;
  color: #cdd6f4;
  outline: none;
  cursor: pointer;
  width: 44px;
  flex-shrink: 0;
}
.prop-value-static {
  font-size: 12px;
  color: #cdd6f4;
  padding: 6px 0;
}

</style>
