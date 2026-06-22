<template>
  <details class="style-section" :open="true">
    <summary class="style-summary">主题预设</summary>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">选择主题</label>
        <select class="prop-select" :value="comp.chartStyle?.themeName ?? 'catppuccin'" @change="onThemeChange">
          <option v-for="t in CHART_THEMES" :key="t.name" :value="t.name">{{ t.label }}</option>
        </select>
      </div>
      <button class="save-theme-btn" @click="saveCurrentAsCustomTheme">保存为自定义主题</button>
    </div>
  </details>
</template>

<script setup lang="ts">
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'
const { comp, onThemeChange, saveCurrentAsCustomTheme, CHART_THEMES } = useChartStyleEditor()
</script>

<style>
@import './shared-form-styles.css';
</style>
<style scoped>
.save-theme-btn {
  width: 100%;
  padding: 6px 0;
  background: #89b4fa;
  border: none;
  border-radius: 6px;
  color: #1e1e2e;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.save-theme-btn:hover {
  background: #b4d0fb;
}
.prop-input-group {
  display: flex;
  gap: 4px;
}
.prop-input-group .prop-input {
  flex: 1;
  min-width: 0;
}
.prop-select-sm {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 4px 4px;
  font-size: 11px;
  color: #cdd6f4;
  outline: none;
  cursor: pointer;
  width: 44px;
  flex-shrink: 0;
}
.prop-value-static {
  font-size: 12px;
  color: #cdd6f4;
  padding: 6px 0;
}

</style>