<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '../../../stores/dashboard'
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'

const store = useDashboardStore()
const { comp } = useChartStyleEditor()

function toggleStatus(key: 'lock' | 'hide') {
  if (!store.selectedComponent) return
  store.toggleComponentStatus(store.selectedComponent.id, key)
}

function togglePreviewOverflow() {
  if (!store.selectedComponent) return
  store.toggleComponentPreviewOverflow(store.selectedComponent.id)
}
</script>

<style>
@import './shared-form-styles.css';
</style>
