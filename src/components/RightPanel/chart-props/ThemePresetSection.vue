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
