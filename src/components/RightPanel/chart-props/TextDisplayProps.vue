<template>
  <div class="chart-style-panel">
    <details class="style-section" :open="true">
      <summary class="style-summary">文本内容</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">文本内容</label>
          <textarea class="prop-textarea" rows="3" v-model="textContent"></textarea>
          <span class="prop-hint">支持 <code>{{字段名}}</code> 引用数据源字段</span>
        </div>
        <div class="prop-group">
          <label class="prop-label">字号 ({{ comp.props?.fontSize ?? 32 }}px)</label>
          <input type="range" min="12" max="72" step="1" class="prop-range" :value="comp.props?.fontSize ?? 32" @input="onTextProp('fontSize', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">字重</label>
          <select class="prop-select" :value="comp.props?.fontWeight ?? 'bold'" @change="onTextProp('fontWeight', ($event.target as HTMLSelectElement).value)">
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="300">300</option>
            <option value="400">400</option>
            <option value="500">500</option>
            <option value="600">600</option>
            <option value="700">700</option>
            <option value="800">800</option>
            <option value="900">900</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">对齐</label>
          <select class="prop-select" :value="comp.props?.textAlign ?? 'center'" @change="onTextProp('textAlign', ($event.target as HTMLSelectElement).value)">
            <option value="left">左对齐</option>
            <option value="center">居中</option>
            <option value="right">右对齐</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">行高 ({{ comp.props?.lineHeight ?? 1.5 }})</label>
          <input type="range" min="1" max="3" step="0.1" class="prop-range" :value="comp.props?.lineHeight ?? 1.5" @input="onTextProp('lineHeight', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">字间距 ({{ comp.props?.letterSpacing ?? 0 }}px)</label>
          <input type="range" min="0" max="20" step="1" class="prop-range" :value="comp.props?.letterSpacing ?? 0" @input="onTextProp('letterSpacing', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">内边距 ({{ comp.props?.padding ?? 12 }}px)</label>
          <input type="range" min="0" max="48" step="1" class="prop-range" :value="comp.props?.padding ?? 12" @input="onTextProp('padding', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">颜色</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">颜色模式</label>
          <select class="prop-select" :value="comp.props?.colorMode ?? 'solid'" @change="onTextProp('colorMode', ($event.target as HTMLSelectElement).value)">
            <option value="solid">纯色</option>
            <option value="gradient">渐变色</option>
          </select>
        </div>
        <template v-if="(comp.props?.colorMode ?? 'solid') === 'solid'">
          <div class="prop-group">
            <label class="prop-label">文本颜色</label>
            <input type="color" class="prop-color" :value="comp.props?.textColor ?? '#cdd6f4'" @input="onTextProp('textColor', ($event.target as HTMLInputElement).value)" />
          </div>
        </template>
        <template v-else>
          <div class="prop-group">
            <label class="prop-label">起始色</label>
            <input type="color" class="prop-color" :value="comp.props?.gradientStart ?? '#89b4fa'" @input="onTextProp('gradientStart', ($event.target as HTMLInputElement).value)" />
          </div>
          <div class="prop-group">
            <label class="prop-label">结束色</label>
            <input type="color" class="prop-color" :value="comp.props?.gradientEnd ?? '#cba6f7'" @input="onTextProp('gradientEnd', ($event.target as HTMLInputElement).value)" />
          </div>
          <div class="prop-group">
            <label class="prop-label">渐变方向</label>
            <select class="prop-select" :value="comp.props?.gradientDirection ?? 'to right'" @change="onTextProp('gradientDirection', ($event.target as HTMLSelectElement).value)">
              <option value="to right">水平</option>
              <option value="to bottom">垂直</option>
              <option value="to bottom right">对角</option>
              <option value="to top right">对角</option>
            </select>
          </div>
        </template>
        <div class="prop-group">
          <label class="prop-label">背景色</label>
          <input type="color" class="prop-color" :value="comp.props?.bgColor === 'transparent' ? '#1e1e2e' : (comp.props?.bgColor ?? '#1e1e2e')" @input="onTextProp('bgColor', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../../../stores/dashboard'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)
const textContent = computed({
  get: () => comp.value?.props?.text ?? '文本内容',
  set: (val: string) => onTextProp('text', val),
})

function onTextProp(key: string, value: any) {
  if (!store.selectedComponent) return
  const props = { ...(store.selectedComponent.props ?? {}), [key]: value }
  store.updateComponentProps(store.selectedComponent.id, props)
}
</script>

<style>
@import './shared-form-styles.css';
.prop-hint {
  display: block;
  font-size: 10px;
  color: var(--ctp-surface1);
  margin-top: 4px;
}
.prop-hint code {
  background: var(--ctp-surface0);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
  color: var(--ctp-blue);
}
</style>
