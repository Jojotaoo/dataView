<template>
  <div>
    <div class="section-title">滤镜与变换</div>
    <div class="prop-form">
      <div class="prop-group row">
        <label class="prop-label">启用滤镜</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.styles.filterShow" @change="toggleFilterShow()" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <template v-if="comp.styles.filterShow">
        <div class="prop-group">
          <label class="prop-label">不透明度 ({{ comp.styles.opacity }})</label>
          <input type="range" min="0" max="1" step="0.05" class="prop-range" :value="comp.styles.opacity" @input="updateStyle('opacity', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">饱和度 ({{ comp.styles.saturate }})</label>
          <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="comp.styles.saturate" @input="updateStyle('saturate', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">对比度 ({{ comp.styles.contrast }})</label>
          <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="comp.styles.contrast" @input="updateStyle('contrast', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">色相旋转 ({{ comp.styles.hueRotate }}deg)</label>
          <input type="range" min="0" max="360" step="1" class="prop-range" :value="comp.styles.hueRotate" @input="updateStyle('hueRotate', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">亮度 ({{ comp.styles.brightness }})</label>
          <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="comp.styles.brightness" @input="updateStyle('brightness', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
      </template>
      <div class="prop-group">
        <label class="prop-label">Z 轴旋转 ({{ comp.styles.rotateZ }}deg)</label>
        <input type="range" min="-180" max="180" step="1" class="prop-range" :value="comp.styles.rotateZ" @input="updateStyle('rotateZ', parseInt(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">X 轴旋转 ({{ comp.styles.rotateX }}deg)</label>
        <input type="range" min="-180" max="180" step="1" class="prop-range" :value="comp.styles.rotateX" @input="updateStyle('rotateX', parseInt(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">Y 轴旋转 ({{ comp.styles.rotateY }}deg)</label>
        <input type="range" min="-180" max="180" step="1" class="prop-range" :value="comp.styles.rotateY" @input="updateStyle('rotateY', parseInt(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">X 倾斜 ({{ comp.styles.skewX }}deg)</label>
        <input type="range" min="-90" max="90" step="1" class="prop-range" :value="comp.styles.skewX" @input="updateStyle('skewX', parseInt(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">Y 倾斜 ({{ comp.styles.skewY }}deg)</label>
        <input type="range" min="-90" max="90" step="1" class="prop-range" :value="comp.styles.skewY" @input="updateStyle('skewY', parseInt(($event.target as HTMLInputElement).value))" />
      </div>
      <div class="prop-group">
        <label class="prop-label">混合模式</label>
        <select class="prop-select" :value="comp.styles.blendMode" @change="updateStyle('blendMode', ($event.target as HTMLSelectElement).value)">
          <option v-for="m in blendModes" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '../../../stores/dashboard'
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'

const store = useDashboardStore()
const { comp } = useChartStyleEditor()

const blendModes = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light',
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
]

function updateStyle(key: string, value: number | string) {
  if (!store.selectedComponent) return
  store.updateComponentStyle(store.selectedComponent.id, key, value)
}

function toggleFilterShow() {
  if (!store.selectedComponent) return
  store.toggleComponentFilterShow(store.selectedComponent.id)
}
</script>

<style>
@import './shared-form-styles.css';
</style>
