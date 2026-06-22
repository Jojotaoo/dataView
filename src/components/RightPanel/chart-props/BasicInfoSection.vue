<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'
const { comp } = useChartStyleEditor()
</script>

<style>
@import './shared-form-styles.css';
</style>
