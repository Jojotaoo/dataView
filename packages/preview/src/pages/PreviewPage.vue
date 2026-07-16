<template>
  <div class="preview-overlay">
    <div class="preview-wrap" ref="wrapRef" :style="wrapStyle">
      <div class="preview-stage" :style="stageStyle">
        <div
          v-for="comp in rootComponents"
          :key="comp.id"
          class="preview-component"
          :class="{ hidden: comp.status.hide }"
          :style="componentStyle(comp)"
        >
          <GroupPreview v-if="comp.key === 'group'" :component="comp" />
          <component v-else :is="componentMap[comp.key]" v-bind="getComponentProps(comp)" />
          <DataFetchManager :component-id="comp.id" mode="preview" />
        </div>
        <div v-if="rootComponents.length === 0" class="preview-empty">暂无组件</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, provide } from 'vue'
import type { CSSProperties } from 'vue'
import { useRoute } from 'vue-router'
import { useDashboardStore, GroupPreview, DataFetchManager, componentMap, getComponentProps } from 'jojotaoo_components'
import { usePreviewScale } from '../composables/usePreviewScale'
import { getPreviewMode, fetchPreviewSchema } from '../previewConfig'
import type { ChartEditStorage, CreateComponentType, CanvasComponent, DatasetConfig } from 'jojotaoo_components'

const STORAGE_KEY = 'preview_schema'

const store = useDashboardStore()
const route = useRoute()

const schema = ref<ChartEditStorage | null>(null)

// 独立预览：用 schema 内嵌的数据集快照提供解析函数（mock 模式前端计算用）
provide('datasetResolver', (id: string): DatasetConfig | undefined =>
  schema.value?.datasetBindings?.find((d) => d.id === id),
)

function handleBeforeUnload() {
  localStorage.removeItem(STORAGE_KEY)
}

function handleFullscreenChange() {}

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

function applySchema(s: ChartEditStorage) {
  schema.value = s
  store.editCanvasConfig = { ...store.editCanvasConfig, ...s.editCanvasConfig }
  store.requestGlobalConfig = { ...store.requestGlobalConfig, ...s.requestGlobalConfig }
  store.components = (s.componentList ?? []) as unknown as CanvasComponent[]
}

async function loadSchema() {
  const projectId = route.params.projectId as string | undefined
  const mode = getPreviewMode(location.search)

  // 路由带 id 且非显式 mock → 优先从服务端拉取 schema
  if (projectId && mode === 'server') {
    const fromServer = await fetchPreviewSchema(projectId)
    if (fromServer) {
      applySchema(fromServer)
      return
    }
  }

  // 兜底：从 localStorage 读取（编辑器写入的预览 schema），无则关闭
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    window.close()
    return
  }
  localStorage.removeItem(STORAGE_KEY)
  const parsed = JSON.parse(raw) as ChartEditStorage
  if (parsed) {
    applySchema(parsed)
  }
}

onMounted(() => {
  loadSchema()

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
    mixBlendMode: c.blendMode !== 'normal' ? (c.blendMode as CSSProperties['mixBlendMode']) : undefined,
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
    mixBlendMode:
      comp.styles.blendMode !== 'normal' ? (comp.styles.blendMode as CSSProperties['mixBlendMode']) : undefined,
    overflow: comp.preview.overFlowHidden ? 'hidden' : undefined,
  }
}

const rootComponents = computed(() => schema.value?.componentList ?? [])
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
