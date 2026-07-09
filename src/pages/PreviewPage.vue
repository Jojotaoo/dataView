<template>
  <div class="preview-overlay">
    <div class="preview-wrap" ref="wrapRef" :style="wrapStyle">
      <div
        class="preview-stage"
        :style="stageStyle"
      >
        <div
          v-for="comp in rootComponents"
          :key="comp.id"
          class="preview-component"
          :class="{ hidden: comp.status.hide }"
          :style="componentStyle(comp)"
        >
          <GroupPreview
            v-if="comp.key === 'group'"
            :component="comp"
          />
          <BarChart
            v-else-if="comp.key === 'BarCommon'"
            :component-id="comp.id"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :chart-style="comp.chartStyle"
          />
          <LineChart
            v-else-if="comp.key === 'LineCommon'"
            :component-id="comp.id"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :chart-style="comp.chartStyle"
          />
          <PieChart
            v-else-if="comp.key === 'PieCommon'"
            :component-id="comp.id"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :chart-style="comp.chartStyle"
          />
          <PieGridChart
            v-else-if="comp.key === 'PieGrid'"
            :component-id="comp.id"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :chart-style="comp.chartStyle"
          />
          <ScrollList
            v-else-if="comp.key === 'ScrollList'"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :scroll-props="comp.props"
          />
          <MapChart
            v-else-if="comp.key === 'HeilongjiangMap'"
            :component-id="comp.id"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :bg-color="comp.props?.bgColor"
            :chart-style="comp.chartStyle"
            geo-key="heilongjiang"
          />
          <TextDisplay
            v-else-if="comp.key === 'TextDisplay'"
            :component-id="comp.id"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :text-props="comp.props"
          />
          <BackgroundCard
            v-else-if="comp.key === 'BackgroundCard'"
            :component-id="comp.id"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :bg-props="comp.props"
          />
          <RiskScrollList
            v-else-if="comp.key === 'RiskScrollList'"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :risk-props="comp.props"
          />
          <ImageDisplay
            v-else-if="comp.key === 'ImageDisplay'"
            :component-id="comp.id"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :image-props="comp.props"
          />
          <HeaderLineChart
            v-else-if="comp.key === 'HeaderLine'"
            :component-id="comp.id"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :line-props="comp.props"
          />
          <DateTimeDisplay
            v-else-if="comp.key === 'DateTimeDisplay'"
            :component-id="comp.id"
            :option="comp.option"
            :width="comp.attr.w"
            :height="comp.attr.h"
            :datetime-props="comp.props"
          />
          <DataFetchManager :component-id="comp.id" mode="preview" />
        </div>
        <div v-if="rootComponents.length === 0" class="preview-empty">
          暂无组件
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CSSProperties } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { usePreviewScale } from '../composables/usePreviewScale'
import BarChart from '../components/charts/BarChart.vue'
import LineChart from '../components/charts/LineChart.vue'
import PieChart from '../components/charts/PieChart.vue'
import PieGridChart from '../components/charts/PieGridChart.vue'
import ScrollList from '../components/charts/ScrollList.vue'
import MapChart from '../components/charts/MapChart.vue'
import TextDisplay from '../components/charts/TextDisplay.vue'
import BackgroundCard from '../components/charts/BackgroundCard.vue'
import RiskScrollList from '../components/charts/RiskScrollList.vue'
import ImageDisplay from '../components/charts/ImageDisplay.vue'
import HeaderLineChart from '../components/charts/HeaderLineChart.vue'
import DateTimeDisplay from '../components/charts/DateTimeDisplay.vue'
import GroupPreview from '../components/charts/GroupPreview.vue'
import DataFetchManager from '../components/charts/DataFetchManager.vue'
import type { ChartEditStorage, CreateComponentType, CanvasComponent } from '../types'

const STORAGE_KEY = 'preview_schema'

const store = useDashboardStore()

const schema = ref<ChartEditStorage | null>(null)

function handleBeforeUnload() {
  localStorage.removeItem(STORAGE_KEY)
}

function handleFullscreenChange() {
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && document.fullscreenElement) {
    e.preventDefault()
    document.exitFullscreen()
  }
  if (e.key === 'F11') {
    e.preventDefault()
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    }
  }
}

onMounted(() => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    window.close()
    return
  }
  schema.value = JSON.parse(raw)
  localStorage.removeItem(STORAGE_KEY)

  if (schema.value) {
    store.editCanvasConfig = { ...store.editCanvasConfig, ...schema.value.editCanvasConfig }
    store.requestGlobalConfig = { ...store.requestGlobalConfig, ...schema.value.requestGlobalConfig }
    store.components = (schema.value.componentList ?? []) as unknown as CanvasComponent[]
  }

  store.setPreviewMode(true)
  document.documentElement.requestFullscreen().catch(() => {})
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  store.setPreviewMode(false)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const wrapRef = ref<HTMLDivElement>()

const wrapStyle = computed(() => ({
  backgroundColor: schema.value?.editCanvasConfig?.background || '#11111b',
}))

const { scale } = usePreviewScale(
  computed(() => schema.value?.editCanvasConfig.width ?? 1920),
  computed(() => schema.value?.editCanvasConfig.height ?? 1080),
  wrapRef,
)

const stageStyle = computed((): CSSProperties => {
  if (!schema.value) return {}
  const c = schema.value.editCanvasConfig
  return {
    width: c.width + 'px',
    height: c.height + 'px',
    backgroundColor: c.background,
    backgroundImage: c.backgroundImage ? `url(${c.backgroundImage})` : undefined,
    backgroundSize: c.backgroundImage ? 'cover' : undefined,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: c.filterShow
      ? `opacity(${c.opacity}) saturate(${c.saturate}) contrast(${c.contrast}) hue-rotate(${c.hueRotate}deg) brightness(${c.brightness})`
      : undefined,
    transform: `scale(${scale.value})`,
    transformOrigin: 'center center',
    flexShrink: 0,
    mixBlendMode: c.blendMode !== 'normal'
      ? (c.blendMode as CSSProperties['mixBlendMode'])
      : undefined,
  }
})

function componentStyle(comp: CreateComponentType): CSSProperties {
  return {
    left: comp.attr.x + 'px',
    top: comp.attr.y + 'px',
    width: comp.attr.w + 'px',
    height: comp.attr.h + 'px',
    opacity: comp.styles.opacity,
    filter: comp.styles.filterShow
      ? `saturate(${comp.styles.saturate}) contrast(${comp.styles.contrast}) hue-rotate(${comp.styles.hueRotate}deg) brightness(${comp.styles.brightness})`
      : undefined,
    transform: `rotateZ(${comp.styles.rotateZ}deg) rotateX(${comp.styles.rotateX}deg) rotateY(${comp.styles.rotateY}deg) skewX(${comp.styles.skewX}deg) skewY(${comp.styles.skewY}deg)`,
    mixBlendMode: comp.styles.blendMode !== 'normal'
      ? (comp.styles.blendMode as CSSProperties['mixBlendMode'])
      : undefined,
    overflow: comp.preview.overFlowHidden ? 'hidden' : undefined,
  }
}

const rootComponents = computed(() =>
  schema.value?.componentList ?? []
)
</script>

<style scoped>
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #11111b;
  display: flex;
}

.preview-stage {
  position: relative;
}

.preview-wrap {
  flex: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-component {
  position: absolute;
  border-radius: 6px;
  overflow: hidden;
}

.preview-component.hidden {
  display: none;
}

.preview-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #6c7086;
  font-size: 16px;
  user-select: none;
}
</style>
