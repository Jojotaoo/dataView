<template>
  <div class="panel-content">
    <div class="section-title">基本信息</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">组件名称</label>
        <div class="prop-value-static">{{ comp.chartConfig.title }}</div>
      </div>
      <div class="prop-group">
        <label class="prop-label">组件类型</label>
        <div class="prop-value-static">{{ comp.key }}</div>
      </div>
    </div>

    <div class="section-title">位置与尺寸</div>
    <div class="prop-grid">
      <div class="prop-group">
        <label class="prop-label">X (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.x" @input="updateAttr('x', $event)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">Y (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.y" @input="updateAttr('y', $event)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">宽度 (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.w" @input="updateAttr('w', $event)" />
      </div>
      <div class="prop-group">
        <label class="prop-label">高度 (px)</label>
        <input type="number" class="prop-input" :value="comp.attr.h" @input="updateAttr('h', $event)" />
      </div>
    </div>

    <div class="section-title">状态控制</div>
    <div class="prop-form">
      <div class="prop-group row">
        <label class="prop-label">锁定</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.status.lock" @change="toggleStatus('lock')" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="prop-group row">
        <label class="prop-label">隐藏</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.status.hide" @change="toggleStatus('hide')" />
          <span class="switch-slider"></span>
        </label>
      </div>
      <div class="prop-group row">
        <label class="prop-label">预览裁剪</label>
        <label class="switch">
          <input type="checkbox" :checked="comp.preview.overFlowHidden" @change="togglePreviewOverflow()" />
          <span class="switch-slider"></span>
        </label>
      </div>
    </div>

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

    <div class="section-title">图表配置</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">标题</label>
        <input type="text" class="prop-input" :value="comp.option.title" @input="updateOption('title', ($event.target as HTMLInputElement).value)" />
      </div>
    </div>
    <div class="section-title">数据过滤</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">过滤表达式</label>
        <textarea class="prop-textarea" rows="3" placeholder="data.filter(item => item.value > 100)" :value="comp.filter" @input="updateFilter(($event.target as HTMLTextAreaElement).value)"></textarea>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

const blendModes = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light',
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
]

function updateAttr(key: string, event: Event) {
  if (!store.selectedComponent) return
  const value = Number((event.target as HTMLInputElement).value)
  if (isNaN(value)) return
  store.updateComponentAttr(store.selectedComponent.id, key as any, value)
}

function updateStyle(key: string, value: number | string) {
  if (!store.selectedComponent) return
  store.updateComponentStyle(store.selectedComponent.id, key, value)
}

function updateOption(key: string, value: any) {
  if (!store.selectedComponent) return
  store.updateComponentOption(store.selectedComponent.id, key, value)
}

function updateFilter(value: string) {
  if (!store.selectedComponent) return
  store.updateComponentFilter(store.selectedComponent.id, value)
}

function toggleStatus(key: 'lock' | 'hide') {
  if (!store.selectedComponent) return
  store.toggleComponentStatus(store.selectedComponent.id, key)
}

function togglePreviewOverflow() {
  if (!store.selectedComponent) return
  store.toggleComponentPreviewOverflow(store.selectedComponent.id)
}

function toggleFilterShow() {
  if (!store.selectedComponent) return
  store.toggleComponentFilterShow(store.selectedComponent.id)
}
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
.prop-value-static {
  font-size: 12px;
  color: #cdd6f4;
  padding: 6px 0;
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
.prop-textarea {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  resize: vertical;
  width: 100%;
}
.prop-textarea:focus { border-color: #89b4fa; }
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
.add-btn {
  padding: 4px 8px;
  background: #313244;
  border: 1px dashed #45475a;
  border-radius: 4px;
  color: #6c7086;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.add-btn:hover {
  background: #45475a;
  color: #cdd6f4;
  border-color: #89b4fa;
}
</style>
