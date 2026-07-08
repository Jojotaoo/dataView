// jojotaoo_components - 组件库入口

// Types
export * from './types'

// Store
export { useDashboardStore } from './stores/dashboard'

// Config
export { componentDefinitions } from './config/componentDefinitions'
export { CHART_THEMES, applyTheme } from './config/chartThemes'
export type { ChartThemePreset } from './config/chartThemes'

// Composables
export { useECharts } from './composables/useECharts'
export { useInteractFilter } from './composables/useInteractFilter'
export { useInteractDispatch } from './composables/useInteractDispatch'
export { useInteractClear } from './composables/useInteractClear'
export {
  mergeRequestConfig,
  executeRequest,
  doFetch,
  getPondCache,
  setPondCache,
  clearPondCache,
} from './composables/useRequestMerge'
export { useChartDataFetch } from './composables/useChartDataFetch'
export {
  subscribePond,
  unsubscribePond,
  initPond,
  removePond,
  dispatchPondData,
  fetchPondData,
  getPondState,
  hasPond,
  getSubscriberCount,
} from './composables/useDataPondManager'
export { useEventListener } from './composables/useEventListener'
export {
  startPolling,
  stopPolling,
  stopAllPolling,
  resetPolling,
  hasPolling,
  getPollingInfo,
} from './composables/usePollingManager'
export { useId, useIdGenerator } from './composables/useId'

// Component registry & render helpers
export { componentMap, getComponentProps } from './composables/useComponentRender'

// Chart components (default exports)
export { default as BarChart } from './components/charts/BarChart.vue'
export { default as LineChart } from './components/charts/LineChart.vue'
export { default as PieChart } from './components/charts/PieChart.vue'
export { default as PieGridChart } from './components/charts/PieGridChart.vue'
export { default as MapChart } from './components/charts/MapChart.vue'
export { default as ScrollList } from './components/charts/ScrollList.vue'
export { default as RiskScrollList } from './components/charts/RiskScrollList.vue'
export { default as TextDisplay } from './components/charts/TextDisplay.vue'
export { default as ImageDisplay } from './components/charts/ImageDisplay.vue'
export { default as HeaderLineChart } from './components/charts/HeaderLineChart.vue'
export { default as DateTimeDisplay } from './components/charts/DateTimeDisplay.vue'
export { default as BackgroundCard } from './components/charts/BackgroundCard.vue'
export { default as CustomLegend } from './components/charts/CustomLegend.vue'
export { default as GroupComponent } from './components/charts/GroupComponent.vue'
export { default as GroupPreview } from './components/charts/GroupPreview.vue'
export { default as DataFetchManager } from './components/charts/DataFetchManager.vue'
