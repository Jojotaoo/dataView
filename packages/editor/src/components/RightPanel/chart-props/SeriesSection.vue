<template>
  <details class="style-section">
    <summary class="style-summary">系列</summary>
    <div class="prop-form">
      <component :is="seriesComponent" v-if="seriesComponent" />
      <div class="prop-group row">
        <label class="prop-label">显示标签</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.chartStyle?.series.showLabel" @change="onChartStyle('series.showLabel', ($event.target as HTMLInputElement).checked)" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="prop-group">
        <label class="prop-label">标签字号</label>
        <input type="number" class="prop-input" :value="comp.chartStyle?.series.labelFontSize" @input="onChartStyle('series.labelFontSize', numVal($event))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">系列主色</label>
        <input type="color" class="prop-color" :value="comp.chartStyle?.series.color" @input="onChartStyle('series.color', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">标签颜色</label>
        <input type="color" class="prop-color" :value="comp.chartStyle?.series.labelColor" @input="onChartStyle('series.labelColor', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">调色板</label>
        <div class="palette-editor">
          <div v-for="(color, idx) in (comp.chartStyle?.series.colorList ?? [])" :key="idx" class="palette-item">
            <input type="color" class="prop-color palette-color" :value="color" @input="onPaletteColor(idx, ($event.target as HTMLInputElement).value)" />
            <button class="palette-remove" @click="removePaletteColor(idx)" :disabled="(comp.chartStyle?.series.colorList?.length ?? 0) <= 1">×</button>
          </div>
          <button class="palette-add" @click="addPaletteColor" :disabled="(comp.chartStyle?.series.colorList?.length ?? 0) >= 10">+</button>
        </div>
      </div>
    </div>
  </details>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'
import BarSeriesProps from './BarSeriesProps.vue'
import LineSeriesProps from './LineSeriesProps.vue'
import PieSeriesProps from './PieSeriesProps.vue'
import MapSeriesProps from './MapSeriesProps.vue'
import ScrollListProps from './ScrollListProps.vue'
import TextDisplayProps from './TextDisplayProps.vue'

const { comp, onChartStyle, numVal, onPaletteColor, addPaletteColor, removePaletteColor } = useChartStyleEditor()

const seriesComponentMap: Record<string, any> = {
  BarCommon: BarSeriesProps,
  LineCommon: LineSeriesProps,
  PieCommon: PieSeriesProps,
  PieGrid: PieSeriesProps,
  HeilongjiangMap: MapSeriesProps,
  ScrollList: ScrollListProps,
  TextDisplay: TextDisplayProps,
}
const seriesComponent = computed(() => seriesComponentMap[comp.value?.key ?? ''])
</script>

<style>
@import './shared-form-styles.css';
</style>
<style scoped>
  .palette-editor {
    display: flex;
    flex-direction: row;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
  }
  .palette-editor .palette-item {
    flex: 0 0 50px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .palette-editor .palette-color {
    flex: 1;
  }
  .palette-editor .palette-remove {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #45475a;
    border-radius: 4px;
    color: #6c7086;
    cursor: pointer;
    transition: all 0.15s;
  }
  .palette-editor .palette-remove:hover {
    background: #45475a;
    color: #cdd6f4;
    border-color: #89b4fa;
  }
  .palette-editor .palette-add {
    width: 20px;
    height: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #45475a;
    border-radius: 4px;
    color: #6c7086;
    cursor: pointer;
    transition: all 0.15s;
  }
  
</style>
