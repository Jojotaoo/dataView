<template>
  <div>
    <div class="prop-group">
      <label class="prop-label">滚动速度 ({{ comp.props?.scrollSpeed ?? 30 }} px/s)</label>
      <input type="range" min="10" max="100" step="1" class="prop-range" :value="comp.props?.scrollSpeed ?? 30" @input="onScrollProp('scrollSpeed', parseInt(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="prop-group">
      <label class="prop-label">可见行数 ({{ comp.props?.visibleRows ?? 5 }})</label>
      <input type="range" min="3" max="15" step="1" class="prop-range" :value="comp.props?.visibleRows ?? 5" @input="onScrollProp('visibleRows', parseInt(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="prop-group">
      <label class="prop-label">行高 ({{ comp.props?.rowHeight ?? 36 }}px)</label>
      <input type="range" min="24" max="60" step="1" class="prop-range" :value="comp.props?.rowHeight ?? 36" @input="onScrollProp('rowHeight', parseInt(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="prop-group row">
      <label class="prop-label">显示表头</label>
      <label class="switch">
        <input type="checkbox" :checked="comp.props?.showHeader ?? true" @change="onScrollProp('showHeader', ($event.target as HTMLInputElement).checked)" />
        <span class="switch-slider"></span>
      </label>
    </div>
    <div class="prop-group">
      <label class="prop-label">表头背景色</label>
      <input type="color" class="prop-color" :value="comp.props?.headerBg ?? '#313244'" @input="onScrollProp('headerBg', ($event.target as HTMLInputElement).value)" />
    </div>
    <div class="prop-group">
      <label class="prop-label">表头文字色</label>
      <input type="color" class="prop-color" :value="comp.props?.headerColor ?? '#cdd6f4'" @input="onScrollProp('headerColor', ($event.target as HTMLInputElement).value)" />
    </div>
    <div class="prop-group">
      <label class="prop-label">奇数行背景</label>
      <input type="color" class="prop-color" :value="comp.props?.zebraOdd ?? '#1e1e2e'" @input="onScrollProp('zebraOdd', ($event.target as HTMLInputElement).value)" />
    </div>
    <div class="prop-group">
      <label class="prop-label">偶数行背景</label>
      <input type="color" class="prop-color" :value="comp.props?.zebraEven ?? '#181825'" @input="onScrollProp('zebraEven', ($event.target as HTMLInputElement).value)" />
    </div>
    <div class="prop-group">
      <label class="prop-label">字号 ({{ comp.props?.fontSize ?? 13 }}px)</label>
      <input type="range" min="10" max="20" step="1" class="prop-range" :value="comp.props?.fontSize ?? 13" @input="onScrollProp('fontSize', parseInt(($event.target as HTMLInputElement).value))" />
    </div>
    <div class="prop-group">
      <label class="prop-label">文字颜色</label>
      <input type="color" class="prop-color" :value="comp.props?.textColor ?? '#cdd6f4'" @input="onScrollProp('textColor', ($event.target as HTMLInputElement).value)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../../../stores/dashboard'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

function onScrollProp(key: string, value: any) {
  if (!store.selectedComponent) return
  const props = { ...(store.selectedComponent.props ?? {}), [key]: value }
  store.updateComponentProps(store.selectedComponent.id, props)
}
</script>

<style>
@import './shared-form-styles.css';
</style>
