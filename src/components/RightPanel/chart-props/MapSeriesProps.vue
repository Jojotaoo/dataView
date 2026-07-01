<template>
  <div>
    <details class="style-section" :open="true">
      <summary class="style-summary">区域样式</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">区域填充色</label>
          <input type="color" class="prop-color" :value="comp.chartStyle?.series.mapRegionColor" @input="onChartStyle('series.mapRegionColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">边界颜色</label>
          <input type="color" class="prop-color" :value="comp.chartStyle?.series.mapRegionBorderColor" @input="onChartStyle('series.mapRegionBorderColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">悬浮高亮色</label>
          <input type="color" class="prop-color" :value="comp.chartStyle?.series.mapRegionHoverColor" @input="onChartStyle('series.mapRegionHoverColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">选中颜色</label>
          <input type="color" class="prop-color" :value="comp.chartStyle?.series.mapSelectColor" @input="onChartStyle('series.mapSelectColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group row">
          <label class="prop-label">显示区域名称</label>
          <label class="switch">
            <input type="checkbox" :checked="comp.chartStyle?.series.mapLabelShow" @change="onChartStyle('series.mapLabelShow', ($event.target as HTMLInputElement).checked)" />
            <span class="switch-slider"></span>
          </label>
        </div>
        <div class="prop-group">
          <label class="prop-label">标签颜色</label>
          <input type="color" class="prop-color" :value="comp.chartStyle?.series.mapLabelColor" @input="onChartStyle('series.mapLabelColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">标签字号 ({{ comp.chartStyle?.series.mapLabelFontSize }}px)</label>
          <input type="range" min="8" max="20" step="1" class="prop-range" :value="comp.chartStyle?.series.mapLabelFontSize" @input="onChartStyle('series.mapLabelFontSize', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">色阶 (visualMap)</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group row">
          <label class="prop-label">显示色阶</label>
          <label class="switch">
            <input type="checkbox" :checked="comp.chartStyle?.series.mapVisualMapShow" @change="onChartStyle('series.mapVisualMapShow', ($event.target as HTMLInputElement).checked)" />
            <span class="switch-slider"></span>
          </label>
        </div>
        <div class="prop-group">
          <label class="prop-label">数据最小值 ({{ comp.chartStyle?.series.mapVisualMin }})</label>
          <input type="range" min="0" max="100" step="1" class="prop-range" :value="comp.chartStyle?.series.mapVisualMin" @input="onChartStyle('series.mapVisualMin', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">数据最大值 ({{ comp.chartStyle?.series.mapVisualMax }})</label>
          <input type="range" min="50" max="500" step="10" class="prop-range" :value="comp.chartStyle?.series.mapVisualMax" @input="onChartStyle('series.mapVisualMax', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">标记点 (markPoint)</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group row">
          <label class="prop-label">显示标记点</label>
          <label class="switch">
            <input type="checkbox" :checked="comp.chartStyle?.series.mapMarkPointShow" @change="onChartStyle('series.mapMarkPointShow', ($event.target as HTMLInputElement).checked)" />
            <span class="switch-slider"></span>
          </label>
        </div>
        <div class="prop-group">
          <label class="prop-label">标记点大小 ({{ comp.chartStyle?.series.mapMarkPointSymbolSize }}px)</label>
          <input type="range" min="6" max="24" step="1" class="prop-range" :value="comp.chartStyle?.series.mapMarkPointSymbolSize" @input="onChartStyle('series.mapMarkPointSymbolSize', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">标记点颜色</label>
          <input type="color" class="prop-color" :value="comp.chartStyle?.series.mapMarkPointColor" @input="onChartStyle('series.mapMarkPointColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group row">
          <label class="prop-label">显示标记标签</label>
          <label class="switch">
            <input type="checkbox" :checked="comp.chartStyle?.series.mapMarkPointLabelShow" @change="onChartStyle('series.mapMarkPointLabelShow', ($event.target as HTMLInputElement).checked)" />
            <span class="switch-slider"></span>
          </label>
        </div>
      </div>
    </details>
    <details class="style-section">
      <summary class="style-summary">缩略图 (mini-map)</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group row">
          <label class="prop-label">显示缩略图</label>
          <label class="switch">
            <input type="checkbox" :checked="comp.chartStyle?.series.mapMiniMapShow" @change="onChartStyle('series.mapMiniMapShow', ($event.target as HTMLInputElement).checked)" />
            <span class="switch-slider"></span>
          </label>
        </div>
      </div>
    </details>
    <details class="style-section">
      <summary class="style-summary">Tooltip 维度单位</summary>
      <div class="prop-form" style="padding: 8px;">
        <div v-for="(entry, idx) in unitEntries" :key="idx" class="prop-group" style="display:flex;gap:6px;align-items:center;">
          <input type="text" class="prop-input" style="flex:1;" placeholder="维度名" :value="entry[0]" @input="onDimChange(idx, ($event.target as HTMLInputElement).value)" />
          <input type="text" class="prop-input" style="flex:1;" placeholder="单位后缀" :value="entry[1]" @input="onUnitChange(idx, ($event.target as HTMLInputElement).value)" />
          <button class="cell-remove" @click="removeUnit(idx)">✕</button>
        </div>
        <button class="add-btn" @click="addUnit">+ 添加映射</button>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../../../stores/dashboard'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

const unitEntries = computed(() => {
  const units = comp.chartStyle?.series.mapTooltipDimensionUnits || {}
  return Object.entries(units) as [string, string][]
})

function onChartStyle(path: string, value: any) {
  if (!store.selectedComponent) return
  store.updateChartStyle(store.selectedComponent.id, path, value)
}

function onDimChange(idx: number, newDim: string) {
  const units = { ...(comp.chartStyle?.series.mapTooltipDimensionUnits || {}) }
  const entries = Object.entries(units)
  const [, unit] = entries[idx]
  delete units[entries[idx][0]]
  if (newDim) units[newDim] = unit
  onChartStyle('series.mapTooltipDimensionUnits', units)
}

function onUnitChange(idx: number, newUnit: string) {
  const units = { ...(comp.chartStyle?.series.mapTooltipDimensionUnits || {}) }
  const entries = Object.entries(units)
  const [dim] = entries[idx]
  units[dim] = newUnit
  onChartStyle('series.mapTooltipDimensionUnits', units)
}

function addUnit() {
  const units = { ...(comp.chartStyle?.series.mapTooltipDimensionUnits || {}) }
  units[`维度${Object.keys(units).length + 1}`] = ''
  onChartStyle('series.mapTooltipDimensionUnits', units)
}

function removeUnit(idx: number) {
  const units = { ...(comp.chartStyle?.series.mapTooltipDimensionUnits || {}) }
  const entries = Object.entries(units)
  delete units[entries[idx][0]]
  onChartStyle('series.mapTooltipDimensionUnits', units)
}
</script>

<style>
@import './shared-form-styles.css';
</style>
<style scoped>
.cell-remove {
  flex: 0 0 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: 1px solid #45475a;
  border-radius: 4px;
  color: #6c7086;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.15s;
}
.cell-remove:hover { background: #f38ba8; color: #1e1e2e; }
.add-btn {
  padding: 4px 8px;
  background: #313244;
  border: 1px dashed #45475a;
  border-radius: 4px;
  color: #6c7086;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 4px;
  width: 100%;
}
.add-btn:hover { background: #45475a; color: #cdd6f4; border-color: #89b4fa; }
</style>
