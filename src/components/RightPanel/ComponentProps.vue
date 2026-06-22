<template>
  <div class="panel-content">
    <component
      v-for="(Section, idx) in universalSections"
      :key="'u-' + idx"
      :is="Section"
    />

    <template v-if="chartSections.length">
      <div class="section-title">图表样式</div>
      <div class="chart-style-panel">
        <component
          v-for="(Section, idx) in chartSections"
          :key="'c-' + idx"
          :is="Section"
        />
      </div>
    </template>

    <DataFilterSection />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useChartStyleEditor } from '../../composables/useChartStyleEditor'
import { universalSections, chartSectionRegistry } from '../../config/chartSectionRegistry'
import DataFilterSection from './chart-props/DataFilterSection.vue'

const { comp } = useChartStyleEditor()
const chartSections = computed(() => chartSectionRegistry[comp.value?.key ?? ''] ?? [])
</script>

<style>
.section-title, .prop-value-static {
  font-size: 12px;
  font-weight: 600;
  color: #89b4fa;
  margin: 16px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #313244;
  user-select: none;
}

.section-title:first-child { margin-top: 0; }
.chart-style-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
