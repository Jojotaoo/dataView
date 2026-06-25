<template>
  <div class="chart-style-panel">
    <details class="style-section" :open="true">
      <summary class="style-summary">列表容器</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">背景色</label>
          <input type="color" class="prop-color" :value="rp.bgColor ?? '#ffffff'" @input="onProp('bgColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">圆角 ({{ rp.borderRadius ?? 12 }}px)</label>
          <input type="range" min="0" max="30" step="1" class="prop-range" :value="rp.borderRadius ?? 12" @input="onProp('borderRadius', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">边框色</label>
          <input type="color" class="prop-color" :value="rp.borderColor ?? '#e8ecf1'" @input="onProp('borderColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">最大高度 ({{ rp.maxHeight ?? 500 }}px)</label>
          <input type="range" min="200" max="1000" step="10" class="prop-range" :value="rp.maxHeight ?? 500" @input="onProp('maxHeight', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">列表项</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">内边距</label>
          <input type="text" class="prop-input" :value="rp.itemPadding ?? '16px 24px'" @input="onProp('itemPadding', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">分隔线颜色</label>
          <input type="color" class="prop-color" :value="rp.itemBorderColor ?? '#f0f2f5'" @input="onProp('itemBorderColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">悬停背景色</label>
          <input type="color" class="prop-color" :value="rp.itemHoverBg ?? '#fafbfc'" @input="onProp('itemHoverBg', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">圆点 + 徽章</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">圆点尺寸 ({{ rp.dotSize ?? 10 }}px)</label>
          <input type="range" min="6" max="20" step="1" class="prop-range" :value="rp.dotSize ?? 10" @input="onProp('dotSize', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">徽章背景透明度 ({{ rp.badgeOpacity ?? 0.3 }})</label>
          <input type="range" min="0.1" max="0.6" step="0.05" class="prop-range" :value="rp.badgeOpacity ?? 0.3" @input="onProp('badgeOpacity', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">风险类型</summary>
      <div class="prop-form" style="padding: 8px;">
        <div v-for="(rt, idx) in riskTypesList" :key="idx" class="risk-type-row">
          <input type="color" class="prop-color risk-type-color" :value="rt.color" @input="updateTypeColor(idx, ($event.target as HTMLInputElement).value)" />
          <input type="text" class="prop-input" style="flex:1" :value="rt.name" @input="updateTypeName(idx, ($event.target as HTMLInputElement).value)" placeholder="匹配数据值（如：高、中、低）" />
          <button class="remove-type-btn" @click="removeType(idx)">✕</button>
        </div>
        <button class="add-type-btn" @click="addType">+ 添加风险类型</button>
        <div class="prop-group" style="margin-top: 8px;">
          <label class="prop-label">默认颜色（未匹配时）</label>
          <input type="color" class="prop-color" :value="rp.defaultColor ?? '#b0bec5'" @input="onProp('defaultColor', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">公司名称 + 副标题</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">名称字号 ({{ rp.nameFontSize ?? 15 }}px)</label>
          <input type="range" min="10" max="24" step="1" class="prop-range" :value="rp.nameFontSize ?? 15" @input="onProp('nameFontSize', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">名称字重</label>
          <select class="prop-select" :value="rp.nameFontWeight ?? 600" @change="onProp('nameFontWeight', parseInt(($event.target as HTMLSelectElement).value))">
            <option :value="400">400</option>
            <option :value="500">500</option>
            <option :value="600">600</option>
            <option :value="700">700</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">名称颜色</label>
          <input type="color" class="prop-color" :value="rp.nameColor ?? '#1d2a3a'" @input="onProp('nameColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">副标题字号 ({{ rp.subFontSize ?? 13 }}px)</label>
          <input type="range" min="10" max="18" step="1" class="prop-range" :value="rp.subFontSize ?? 13" @input="onProp('subFontSize', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">副标题颜色</label>
          <input type="color" class="prop-color" :value="rp.subColor ?? '#6b7a8a'" @input="onProp('subColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">时间颜色</label>
          <input type="color" class="prop-color" :value="rp.timeColor ?? '#8c9aa8'" @input="onProp('timeColor', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">页脚</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group row">
          <label class="prop-label">显示页脚</label>
          <label class="switch">
            <input type="checkbox" :checked="rp.showFooter ?? true" @change="onProp('showFooter', ($event.target as HTMLInputElement).checked)" />
            <span class="switch-slider"></span>
          </label>
        </div>
        <div class="prop-group">
          <label class="prop-label">页脚背景色</label>
          <input type="color" class="prop-color" :value="rp.footerBg ?? '#fafbfc'" @input="onProp('footerBg', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">页脚文字色</label>
          <input type="color" class="prop-color" :value="rp.footerColor ?? '#8c9aa8'" @input="onProp('footerColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">页脚字号 ({{ rp.footerFontSize ?? 13 }}px)</label>
          <input type="range" min="10" max="18" step="1" class="prop-range" :value="rp.footerFontSize ?? 13" @input="onProp('footerFontSize', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">对齐方式</label>
          <select class="prop-select" :value="rp.footerAlign ?? 'right'" @change="onProp('footerAlign', ($event.target as HTMLSelectElement).value)">
            <option value="left">左对齐</option>
            <option value="center">居中</option>
            <option value="right">右对齐</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">滚动速度 ({{ rp.scrollSpeed ?? 30 }})</label>
          <input type="range" min="10" max="100" step="1" class="prop-range" :value="rp.scrollSpeed ?? 30" @input="onProp('scrollSpeed', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">可见行数 ({{ rp.visibleRows ?? 5 }})</label>
          <input type="range" min="3" max="15" step="1" class="prop-range" :value="rp.visibleRows ?? 5" @input="onProp('visibleRows', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../../../stores/dashboard'

const rp = computed(() => store.selectedComponent?.props ?? {})

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

const riskTypesList = computed(() => comp.value?.props?.riskTypes ?? [])

function onProp(key: string, value: any) {
  if (!store.selectedComponent) return
  const props = { ...(store.selectedComponent.props ?? {}), [key]: value }
  store.updateComponentProps(store.selectedComponent.id, props)
}

function addType() {
  const list = [...riskTypesList.value, { name: '', color: '#8c9aa8' }]
  onProp('riskTypes', list)
}

function removeType(idx: number) {
  const list = riskTypesList.value.filter((_: any, i: number) => i !== idx)
  onProp('riskTypes', list)
}

function updateTypeName(idx: number, name: string) {
  const list = riskTypesList.value.map((t: any, i: number) => i === idx ? { ...t, name } : t)
  onProp('riskTypes', list)
}

function updateTypeColor(idx: number, color: string) {
  const list = riskTypesList.value.map((t: any, i: number) => i === idx ? { ...t, color } : t)
  onProp('riskTypes', list)
}
</script>

<style>
@import './shared-form-styles.css';

.risk-type-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.risk-type-color {
  flex: 1;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  padding: 2px;
}

.remove-type-btn {
  background: none;
  border: 1px solid #45475a;
  color: #6c7086;
  cursor: pointer;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s;
}

.remove-type-btn:hover {
  background: #f38ba8;
  color: #1e1e2e;
  border-color: #f38ba8;
}

.add-type-btn {
  display: block;
  width: 100%;
  padding: 6px;
  background: #313244;
  border: 1px dashed #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.add-type-btn:hover {
  background: #45475a;
  border-color: #89b4fa;
}
</style>