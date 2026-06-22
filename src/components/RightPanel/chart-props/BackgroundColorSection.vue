<template>
  <div class="prop-group" style="margin-top: 8px;">
    <label class="prop-label">图表背景色</label>
    <input type="color" class="prop-color" :value="comp.chartStyle?.backgroundColor" @input="onChartStyle('backgroundColor', ($event.target as HTMLInputElement).value)" />
  </div>
</template>

<script setup lang="ts">
import { useChartStyleEditor } from '../../../composables/useChartStyleEditor'
const { comp, onChartStyle } = useChartStyleEditor()
</script>

<style>
@import './shared-form-styles.css';
</style>
