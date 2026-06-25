<template>
  <div class="chart-style-panel">
    <details class="style-section" :open="true">
      <summary class="style-summary">卡片样式</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">背景色</label>
          <input type="color" class="prop-color" :value="cardBgColor" @input="onProp('cardBgColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">圆角 ({{ cardBorderRadius }}px)</label>
          <input type="range" min="0" max="60" step="1" class="prop-range" :value="cardBorderRadius" @input="onProp('cardBorderRadius', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">边框宽度 ({{ cardBorderWidth }}px)</label>
          <input type="range" min="0" max="10" step="1" class="prop-range" :value="cardBorderWidth" @input="onProp('cardBorderWidth', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">边框颜色</label>
          <input type="color" class="prop-color" :value="cardBorderColor" @input="onProp('cardBorderColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">内边距</label>
          <input type="text" class="prop-input" :value="cardPadding" @input="onProp('cardPadding', ($event.target as HTMLInputElement).value)" placeholder="例: 40px 48px" />
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">主标题</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">标题文本</label>
          <input type="text" class="prop-input" :value="titleText" @input="onProp('titleText', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">字号 ({{ titleFontSize }}px)</label>
          <input type="range" min="12" max="72" step="1" class="prop-range" :value="titleFontSize" @input="onProp('titleFontSize', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">字重</label>
          <select class="prop-select" :value="titleFontWeight" @change="onProp('titleFontWeight', parseInt(($event.target as HTMLSelectElement).value))">
            <option :value="400">400</option>
            <option :value="500">500</option>
            <option :value="600">600</option>
            <option :value="700">700</option>
            <option :value="800">800</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">颜色</label>
          <input type="color" class="prop-color" :value="titleColor" @input="onProp('titleColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">行高 ({{ titleLineHeight }})</label>
          <input type="range" min="1" max="2" step="0.1" class="prop-range" :value="titleLineHeight" @input="onProp('titleLineHeight', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">装饰条</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">显示装饰条</label>
          <select class="prop-select" :value="showDecorator ? '1' : '0'" @change="onProp('showDecorator', ($event.target as HTMLSelectElement).value === '1')">
            <option value="1">显示</option>
            <option value="0">隐藏</option>
          </select>
        </div>
        <template v-if="showDecorator">
          <div class="prop-group">
            <label class="prop-label">颜色</label>
            <input type="color" class="prop-color" :value="decoratorColor" @input="onProp('decoratorColor', ($event.target as HTMLInputElement).value)" />
          </div>
          <div class="prop-group">
            <label class="prop-label">宽度 ({{ decoratorWidth }}px)</label>
            <input type="range" min="2" max="16" step="1" class="prop-range" :value="decoratorWidth" @input="onProp('decoratorWidth', parseInt(($event.target as HTMLInputElement).value))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">高度 ({{ decoratorHeight }}px)</label>
            <input type="range" min="12" max="60" step="1" class="prop-range" :value="decoratorHeight" @input="onProp('decoratorHeight', parseInt(($event.target as HTMLInputElement).value))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">圆角 ({{ decoratorRadius }}px)</label>
            <input type="range" min="0" max="8" step="1" class="prop-range" :value="decoratorRadius" @input="onProp('decoratorRadius', parseInt(($event.target as HTMLInputElement).value))" />
          </div>
        </template>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">副标题</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">显示副标题</label>
          <select class="prop-select" :value="showSubtitle ? '1' : '0'" @change="onProp('showSubtitle', ($event.target as HTMLSelectElement).value === '1')">
            <option value="1">显示</option>
            <option value="0">隐藏</option>
          </select>
        </div>
        <template v-if="showSubtitle">
          <div class="prop-group">
            <label class="prop-label">副标题文本</label>
            <input type="text" class="prop-input" :value="subText" @input="onProp('subText', ($event.target as HTMLInputElement).value)" />
          </div>
          <div class="prop-group">
            <label class="prop-label">字号 ({{ subFontSize }}px)</label>
            <input type="range" min="10" max="36" step="1" class="prop-range" :value="subFontSize" @input="onProp('subFontSize', parseInt(($event.target as HTMLInputElement).value))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">颜色</label>
            <input type="color" class="prop-color" :value="subColor" @input="onProp('subColor', ($event.target as HTMLInputElement).value)" />
          </div>
          <div class="prop-group">
            <label class="prop-label">上边距 ({{ subMarginTop }}px)</label>
            <input type="range" min="0" max="32" step="1" class="prop-range" :value="subMarginTop" @input="onProp('subMarginTop', parseInt(($event.target as HTMLInputElement).value))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">左边距 ({{ subPaddingLeft }}px)</label>
            <input type="range" min="0" max="48" step="1" class="prop-range" :value="subPaddingLeft" @input="onProp('subPaddingLeft', parseInt(($event.target as HTMLInputElement).value))" />
          </div>
        </template>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../../../stores/dashboard'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

const cardBgColor = computed(() => comp.value?.props?.cardBgColor ?? '#ffffff')
const cardBorderRadius = computed(() => comp.value?.props?.cardBorderRadius ?? 16)
const cardBorderWidth = computed(() => comp.value?.props?.cardBorderWidth ?? 1)
const cardBorderColor = computed(() => comp.value?.props?.cardBorderColor ?? '#e8ecf1')
const cardPadding = computed(() => comp.value?.props?.cardPadding ?? '40px 48px')

const titleText = computed(() => comp.value?.props?.titleText ?? '标题')
const titleFontSize = computed(() => comp.value?.props?.titleFontSize ?? 32)
const titleFontWeight = computed(() => comp.value?.props?.titleFontWeight ?? 600)
const titleColor = computed(() => comp.value?.props?.titleColor ?? '#1d2a3a')
const titleLineHeight = computed(() => comp.value?.props?.titleLineHeight ?? 1.3)

const showDecorator = computed(() => comp.value?.props?.showDecorator ?? true)
const decoratorColor = computed(() => comp.value?.props?.decoratorColor ?? '#e34d59')
const decoratorWidth = computed(() => comp.value?.props?.decoratorWidth ?? 6)
const decoratorHeight = computed(() => comp.value?.props?.decoratorHeight ?? 32)
const decoratorRadius = computed(() => comp.value?.props?.decoratorRadius ?? 3)

const showSubtitle = computed(() => comp.value?.props?.showSubtitle ?? false)
const subText = computed(() => comp.value?.props?.subText ?? '')
const subFontSize = computed(() => comp.value?.props?.subFontSize ?? 16)
const subColor = computed(() => comp.value?.props?.subColor ?? '#8c9aa8')
const subMarginTop = computed(() => comp.value?.props?.subMarginTop ?? 8)
const subPaddingLeft = computed(() => comp.value?.props?.subPaddingLeft ?? 20)

function onProp(key: string, value: any) {
  if (!store.selectedComponent) return
  const props = { ...(store.selectedComponent.props ?? {}), [key]: value }
  store.updateComponentProps(store.selectedComponent.id, props)
}
</script>

<style>
@import './shared-form-styles.css';
</style>