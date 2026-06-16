<template>
  <div class="preview-overlay">
    <div class="preview-header">
      <h2 class="preview-title">{{ schema.editCanvasConfig.projectName }} - 预览</h2>
      <button class="exit-btn" @click="$emit('close')">
        ✕ 退出预览
      </button>
    </div>
    <div
      class="preview-stage"
      :style="canvasStyle"
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
          :option="comp.option"
          :width="comp.attr.w"
          :height="comp.attr.h"
        />
        <LineChart
          v-else-if="comp.key === 'LineCommon'"
          :option="comp.option"
          :width="comp.attr.w"
          :height="comp.attr.h"
        />
        <DataFetchManager :component-id="comp.id" mode="preview" />
      </div>
      <div v-if="rootComponents.length === 0" class="preview-empty">
        暂无组件
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import { useEventListener } from '../composables/useEventListener'
import BarChart from './charts/BarChart.vue'
import LineChart from './charts/LineChart.vue'
import GroupPreview from './charts/GroupPreview.vue'
import DataFetchManager from './charts/DataFetchManager.vue'
import type { ChartEditStorage, CreateComponentType } from '../types'

const props = defineProps<{
  schema: ChartEditStorage
}>()

const emit = defineEmits<{
  close: []
}>()

useEventListener(window, 'keydown', (event: Event) => {
  if ((event as KeyboardEvent).key === 'Escape') {
    emit('close')
  }
})

const canvasStyle = computed((): CSSProperties => ({
  width: props.schema.editCanvasConfig.width + 'px',
  height: props.schema.editCanvasConfig.height + 'px',
  backgroundColor: props.schema.editCanvasConfig.background,
  backgroundImage: props.schema.editCanvasConfig.backgroundImage
    ? `url(${props.schema.editCanvasConfig.backgroundImage})`
    : undefined,
  backgroundSize: props.schema.editCanvasConfig.backgroundImage ? 'cover' : undefined,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  filter: props.schema.editCanvasConfig.filterShow
    ? `opacity(${props.schema.editCanvasConfig.opacity}) saturate(${props.schema.editCanvasConfig.saturate}) contrast(${props.schema.editCanvasConfig.contrast}) hue-rotate(${props.schema.editCanvasConfig.hueRotate}deg) brightness(${props.schema.editCanvasConfig.brightness})`
    : undefined,
  transform: props.schema.editCanvasConfig.filterShow
    ? `rotateZ(${props.schema.editCanvasConfig.rotateZ}deg) rotateX(${props.schema.editCanvasConfig.rotateX}deg) rotateY(${props.schema.editCanvasConfig.rotateY}deg) skewX(${props.schema.editCanvasConfig.skewX}deg) skewY(${props.schema.editCanvasConfig.skewY}deg)`
    : undefined,
  mixBlendMode: props.schema.editCanvasConfig.blendMode !== 'normal'
    ? (props.schema.editCanvasConfig.blendMode as CSSProperties['mixBlendMode'])
    : undefined,
}))

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
  props.schema.componentList
)
</script>

<style scoped>
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #11111b;
  display: flex;
  flex-direction: column;
}

.preview-header {
  height: 48px;
  min-height: 48px;
  background: #181825;
  border-bottom: 1px solid #313244;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
}

.preview-title {
  font-size: 16px;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0;
  user-select: none;
}

.exit-btn {
  padding: 6px 16px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.exit-btn:hover {
  background: #f38ba8;
  color: #1e1e2e;
  border-color: #f38ba8;
}

.preview-stage {
  position: relative;
  margin: 0 auto;
  overflow: auto;
  flex: 1;
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
