<template>
  <div class="chart-style-panel">
    <details class="style-section" :open="true">
      <summary class="style-summary">分隔线样式</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">线条颜色</label>
          <div class="color-picker-wrap">
            <el-color-picker
              :model-value="lineColor"
              show-alpha
              :predefine="predefineColors"
              @update:model-value="onLineColorChange"
            />
          </div>
        </div>
        <div class="prop-group">
          <label class="prop-label">高度 ({{ lineHeight }}px)</label>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            class="prop-range"
            :value="lineHeight"
            @input="onProp('height', parseInt(($event.target as HTMLInputElement).value))"
          />
        </div>
        <div class="prop-group">
          <label class="prop-label">侧边距 ({{ lineMarginX }}px)</label>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            class="prop-range"
            :value="lineMarginX"
            @input="onProp('marginX', parseInt(($event.target as HTMLInputElement).value))"
          />
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '@demo/components'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

const lineColor = computed(() => comp.value?.props?.lineColor ?? '#00c8ff')
const lineHeight = computed(() => comp.value?.props?.height ?? 1)
const lineMarginX = computed(() => comp.value?.props?.marginX ?? 24)

const predefineColors = [
  '#00c8ff',
  '#89b4fa',
  '#f38ba8',
  '#a6e3a1',
  '#fab387',
  '#cba6f7',
  '#94e2d5',
  '#f9e2af',
  '#ffffff',
  '#cdd6f4',
]

function onLineColorChange(val: string | null) {
  if (!store.selectedComponent || val === null) return
  store.updateComponentProps(store.selectedComponent.id, { lineColor: val })
}

function onProp(key: string, value: number) {
  if (!store.selectedComponent) return
  const props = { ...(store.selectedComponent.props ?? {}), [key]: value }
  store.updateComponentProps(store.selectedComponent.id, props)
}
</script>

<style>
@import './shared-form-styles.css';
.color-picker-wrap {
  display: flex;
  align-items: center;
}
.color-picker-wrap .el-color-picker {
  width: 100%;
}
.color-picker-wrap .el-color-picker__trigger {
  width: 100%;
}
</style>
