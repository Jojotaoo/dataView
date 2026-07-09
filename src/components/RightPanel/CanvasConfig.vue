<template>
  <div class="panel-content">
    <div class="section-title">项目信息</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">项目名称</label>
        <input type="text" class="prop-input" :value="store.editCanvasConfig.projectName" @input="store.updateCanvasConfig({ projectName: ($event.target as HTMLInputElement).value })" />
      </div>
    </div>

    <div class="section-title">画布尺寸</div>
    <div class="prop-grid">
      <div class="prop-group">
        <label class="prop-label">宽度 (px)</label>
        <input type="number" class="prop-input" :value="store.editCanvasConfig.width" @input="store.updateCanvasConfig({ width: Number(($event.target as HTMLInputElement).value) })" />
      </div>
      <div class="prop-group">
        <label class="prop-label">高度 (px)</label>
        <input type="number" class="prop-input" :value="store.editCanvasConfig.height" @input="store.updateCanvasConfig({ height: Number(($event.target as HTMLInputElement).value) })" />
      </div>
    </div>

    <div class="section-title">背景设置</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">背景颜色</label>
        <input type="color" class="prop-color" :value="store.editCanvasConfig.background" @input="store.updateCanvasConfig({ background: ($event.target as HTMLInputElement).value })" />
      </div>
      <div class="prop-group">
        <label class="prop-label">背景图片 URL</label>
        <input type="text" class="prop-input" placeholder="输入图片链接或留空" :value="store.editCanvasConfig.backgroundImage ?? ''" @input="store.updateCanvasConfig({ backgroundImage: ($event.target as HTMLInputElement).value || null })" />
      </div>
    </div>

    <div class="section-title">全局滤镜</div>
    <div class="prop-form">
      <div class="prop-group row">
        <label class="prop-label">启用滤镜</label>
        <label class="switch">
          <input type="checkbox" :checked="store.editCanvasConfig.filterShow" @change="store.updateCanvasConfig({ filterShow: !store.editCanvasConfig.filterShow })" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <template v-if="store.editCanvasConfig.filterShow">
        <div class="prop-group">
          <label class="prop-label">不透明度 ({{ store.editCanvasConfig.opacity }})</label>
          <input type="range" min="0" max="1" step="0.05" class="prop-range" :value="store.editCanvasConfig.opacity" @input="store.updateCanvasConfig({ opacity: parseFloat(($event.target as HTMLInputElement).value) })" />
        </div>
        <div class="prop-group">
          <label class="prop-label">饱和度 ({{ store.editCanvasConfig.saturate }})</label>
          <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="store.editCanvasConfig.saturate" @input="store.updateCanvasConfig({ saturate: parseFloat(($event.target as HTMLInputElement).value) })" />
        </div>
        <div class="prop-group">
          <label class="prop-label">对比度 ({{ store.editCanvasConfig.contrast }})</label>
          <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="store.editCanvasConfig.contrast" @input="store.updateCanvasConfig({ contrast: parseFloat(($event.target as HTMLInputElement).value) })" />
        </div>
        <div class="prop-group">
          <label class="prop-label">色相旋转 ({{ store.editCanvasConfig.hueRotate }}deg)</label>
          <input type="range" min="0" max="360" step="1" class="prop-range" :value="store.editCanvasConfig.hueRotate" @input="store.updateCanvasConfig({ hueRotate: parseInt(($event.target as HTMLInputElement).value) })" />
        </div>
        <div class="prop-group">
          <label class="prop-label">亮度 ({{ store.editCanvasConfig.brightness }})</label>
          <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="store.editCanvasConfig.brightness" @input="store.updateCanvasConfig({ brightness: parseFloat(($event.target as HTMLInputElement).value) })" />
        </div>
      </template>
      <div class="prop-group">
        <label class="prop-label">混合模式</label>
        <select class="prop-select" :value="store.editCanvasConfig.blendMode" @change="store.updateCanvasConfig({ blendMode: ($event.target as HTMLSelectElement).value })">
          <option v-for="m in blendModes" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '../../stores/dashboard'

const store = useDashboardStore()

const blendModes = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light',
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
]
</script>

<style scoped>
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #89b4fa;
  margin: 16px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #313244;
  user-select: none;
}
.section-title:first-child { margin-top: 0; }
.prop-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.prop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.prop-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.prop-group.row {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}
.prop-label {
  font-size: 11px;
  color: #a6adc8;
  font-weight: 500;
}
.prop-input {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.prop-input:focus { border-color: #89b4fa; }
.prop-select {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  cursor: pointer;
}
.prop-color {
  width: 100%;
  height: 32px;
  border: 1px solid #45475a;
  border-radius: 6px;
  background: #313244;
  cursor: pointer;
  padding: 2px;
}
.prop-range {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #45475a;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.prop-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: #89b4fa;
  border-radius: 50%;
  cursor: pointer;
}
.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
}
.switch input { opacity: 0; width: 0; height: 0; }
.switch-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #45475a;
  border-radius: 20px;
  transition: 0.2s;
}
.switch-slider::before {
  content: '';
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background: #cdd6f4;
  border-radius: 50%;
  transition: 0.2s;
}
.switch input:checked + .switch-slider { background: #89b4fa; }
.switch input:checked + .switch-slider::before { transform: translateX(16px); }
</style>
