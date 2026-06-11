<template>
  <div ref="containerRef" class="canvas-area" @contextmenu.prevent="onContextMenu">
    <SketchRule
      :width="containerWidth || 800"
      :height="containerHeight || 600"
      :canvas-width="store.editCanvasConfig.width"
      :canvas-height="store.editCanvasConfig.height"
      v-model:scale="scale"
      v-model:lines="lines"
      :thick="20"
      :min-zoom="0.1"
      :max-zoom="10"
      :zoom-mode="'pointer'"
      :show-ruler="showRuler"
      :is-show-refer-line="showReferLine"
      :palette="rulerPalette"
      :auto-center="true"
      :snap-threshold="5"
      :show-minor-ticks="true"
      :shadow="shadow"
      delete-label="放开删除"
    >
      <template #toolbar="{ tools, state }">
        <div class="ruler-toolbar">
          <button title="缩小" @click="tools.zoomOut">−</button>
          <span class="zoom-pct">{{ Math.round(state.scale * 100) }}%</span>
          <button title="放大" @click="tools.zoomIn">+</button>
          <button title="重置缩放" @click="tools.reset">1:1</button>
        </div>
      </template>

      <draggable
        tag="div"
        class="canvas-grid"
        :style="gridStyle"
        :list="store.components"
        item-key="id"
        :sort="false"
        :group="{ name: 'canvas', pull: false, put: true }"
        @change="onDraggableChange"
        @mousedown.self="onCanvasMouseDown"
      >
        <template #item="{ element: comp }">
          <div
            v-if="comp && comp.id && !comp.parentId"
            class="canvas-component"
            :class="{
              selected: comp.id === store.selectedId,
              'multi-selected': store.selectedIds.includes(comp.id) && comp.id !== store.selectedId,
              locked: comp.status.lock,
              hidden: comp.status.hide,
            }"
            :style="componentStyle(comp)"
            :data-comp-id="comp.id"
            @mousedown.stop="onMouseDown($event, comp.id)"
            @dragstart.prevent
            @click.stop="onComponentClick($event, comp.id)"
          >
            <div class="comp-header">
              <span class="comp-label">{{ comp.chartConfig.title }}</span>
              <div class="header-badges">
                <span v-if="comp.status.lock" class="badge lock-badge">🔒</span>
                <button class="remove-btn" @click.stop="store.removeComponent(comp.id)">✕</button>
              </div>
            </div>
            <div class="comp-body">
              <Container
                v-if="comp.key === 'container'"
                :bg-color="comp.props?.bgColor"
                :border-color="comp.props?.borderColor"
                :parent-id="comp.id"
                :scale="scale"
              />
              <GroupComponent
                v-else-if="comp.key === 'group'"
                :component="comp"
                :scale="scale"
              />
              <BarChart
                v-else-if="comp.key === 'BarCommon'"
                :option="comp.option"
                :width="comp.attr.w"
                :height="comp.attr.h - 32"
                :bg-color="comp.props?.bgColor"
              />
              <LineChart
                v-else-if="comp.key === 'LineCommon'"
                :option="comp.option"
                :width="comp.attr.w"
                :height="comp.attr.h - 32"
                :bg-color="comp.props?.bgColor"
              />
            </div>
            <div
              v-if="!comp.status.lock && comp.key !== 'group'"
              class="resize-handle"
              @mousedown.stop="onResizeStart($event, comp.id)"
            ></div>
          </div>
        </template>
        <template #footer>
          <div v-if="store.components.length === 0" class="empty-hint">
            <div class="empty-icon">📋</div>
            <p>从左侧组件库拖拽或点击添加组件</p>
          </div>
        </template>
      </draggable>
      <div v-if="selRect" class="selection-rect" :style="selRectStyle"></div>
    </SketchRule>
    <ContextMenu
      v-if="ctxMenu.show"
      :x="ctxMenu.x"
      :y="ctxMenu.y"
      :can-group="store.selectedIds.length >= 2"
      :can-ungroup="ctxMenu.isGroup"
      @group="handleGroup"
      @ungroup="handleUngroup"
      @close="ctxMenu.show = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { CSSProperties } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import type { CanvasComponent } from '../stores/dashboard'
import draggable from 'vuedraggable'
import SketchRule from 'vue3-sketch-ruler'
import 'vue3-sketch-ruler/lib/style.css'
import BarChart from './charts/BarChart.vue'
import LineChart from './charts/LineChart.vue'
import Container from './charts/Container.vue'
import GroupComponent from './charts/GroupComponent.vue'
import ContextMenu from './ContextMenu.vue'

const store = useDashboardStore()

const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(0)
const containerHeight = ref(0)
const scale = ref(1)
const showRuler = ref(true)
const showReferLine = ref(true)
const lines = ref<{ h: number[]; v: number[] }>({ h: [], v: [] })
const selRect = ref<{ x: number; y: number; w: number; h: number } | null>(null)
const ctxMenu = ref<{ show: boolean; x: number; y: number; isGroup: boolean; ctxId: string | null }>({ show: false, x: 0, y: 0, isGroup: false, ctxId: null })

const selRectStyle = computed(() => {
  if (!selRect.value) return {}
  return {
    left: selRect.value.x + 'px',
    top: selRect.value.y + 'px',
    width: selRect.value.w + 'px',
    height: selRect.value.h + 'px',
  }
})

const rulerPalette = {
  bgColor: 'transparent',
  tickColor: '#585b70',
  labelColor: '#a6adc8',
  guideLineColor: '#89b4fa',
  guideLineLockedColor: '#45475a',
  hoverBg: 'transparent',
  hoverColor: '#cdd6f4',
  borderColor: '#313244',
  shadowColor: '#1e1e2e',
  guideLineStyle: 'dashed',
  guideLineWidth: 1,
  labelEnabled: true,
}

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (containerRef.value) {
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        containerWidth.value = Math.floor(entry.contentRect.width)
        containerHeight.value = Math.floor(entry.contentRect.height)
      }
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  dragState = null
  resizeState = null
  selStart = null
  selRect.value = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('blur', onMouseUp)
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeUp)
  window.removeEventListener('blur', onResizeUp)
  window.removeEventListener('mousemove', onSelectionMouseMove)
  window.removeEventListener('mouseup', onSelectionMouseUp)
})

const gridStyle = computed((): CSSProperties => ({
  width: store.editCanvasConfig.width + 'px',
  height: store.editCanvasConfig.height + 'px',
  backgroundColor: store.editCanvasConfig.background,
  backgroundImage: store.editCanvasConfig.backgroundImage
    ? `url(${store.editCanvasConfig.backgroundImage}), radial-gradient(circle, #585b70 1px, transparent 1px)`
    : 'radial-gradient(circle, #585b70 1px, transparent 1px)',
  backgroundSize: store.editCanvasConfig.backgroundImage
    ? 'cover, 20px 20px'
    : '20px 20px',
  backgroundPosition: 'center, 0 0',
  filter: store.editCanvasConfig.filterShow
    ? `opacity(${store.editCanvasConfig.opacity}) saturate(${store.editCanvasConfig.saturate}) contrast(${store.editCanvasConfig.contrast}) hue-rotate(${store.editCanvasConfig.hueRotate}deg) brightness(${store.editCanvasConfig.brightness})`
    : undefined,
}))

const shadow = computed(() => {
  const selId = store.selectedId
  if (!selId) return { x: 0, y: 0, width: 0, height: 0 }
  const comp = store.findComponent(selId)
  if (!comp) return { x: 0, y: 0, width: 0, height: 0 }

  let x = comp.attr.x
  let y = comp.attr.y
  if (!store.components.find(c => c.id === selId)) {
    const parentGroup = findParentGroup(selId)
    if (parentGroup) {
      x += parentGroup.attr.x
      y += parentGroup.attr.y
    }
  }

  return { x, y, width: comp.attr.w, height: comp.attr.h }
})

function componentStyle(comp: CanvasComponent): CSSProperties {
  return {
    left: comp.attr.x + 'px',
    top: comp.attr.y + 'px',
    width: comp.attr.w + 'px',
    height: comp.attr.h + 'px',
    opacity: comp.styles.opacity,
    transform: `rotateZ(${comp.styles.rotateZ}deg) rotateX(${comp.styles.rotateX}deg) rotateY(${comp.styles.rotateY}deg) skewX(${comp.styles.skewX}deg) skewY(${comp.styles.skewY}deg)`,
    filter: comp.styles.filterShow
      ? `saturate(${comp.styles.saturate}) contrast(${comp.styles.contrast}) hue-rotate(${comp.styles.hueRotate}deg) brightness(${comp.styles.brightness})`
      : undefined,
    mixBlendMode: comp.styles.blendMode !== 'normal' ? (comp.styles.blendMode as CSSProperties['mixBlendMode']) : undefined,
    overflow: comp.preview.overFlowHidden ? 'hidden' : undefined,
  }
}

let dragState: { id: string; startX: number; startY: number; compX: number; compY: number } | null = null
let resizeState: { id: string; startX: number; startY: number; compW: number; compH: number } | null = null

function onMouseDown(event: MouseEvent, id: string) {
  const comp = store.components.find(c => c.id === id)
  if (!comp || comp.status.lock) return
  dragState = {
    id,
    startX: event.clientX,
    startY: event.clientY,
    compX: comp.attr.x,
    compY: comp.attr.y,
  }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('blur', onMouseUp)
}

function onMouseMove(event: MouseEvent) {
  if (!dragState) return
  const dx = (event.clientX - dragState.startX) / scale.value
  const dy = (event.clientY - dragState.startY) / scale.value
  store.moveComponentDelta(dragState.id, dx, dy, dragState.compX, dragState.compY, store.editCanvasConfig.width, store.editCanvasConfig.height)
}

function onMouseUp() {
  dragState = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('blur', onMouseUp)
}

function onResizeStart(event: MouseEvent, id: string) {
  const comp = store.components.find(c => c.id === id)
  if (!comp || comp.status.lock) return
  resizeState = {
    id,
    startX: event.clientX,
    startY: event.clientY,
    compW: comp.attr.w,
    compH: comp.attr.h,
  }
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeUp)
  window.addEventListener('blur', onResizeUp)
}

function onResizeMove(event: MouseEvent) {
  if (!resizeState) return
  const dx = (event.clientX - resizeState.startX) / scale.value
  const dy = (event.clientY - resizeState.startY) / scale.value
  const comp = store.components.find(c => c.id === resizeState!.id)
  if (!comp) return
  store.resizeComponentDelta(resizeState.id, dx, dy, resizeState.compW, resizeState.compH, store.editCanvasConfig.width - comp.attr.x, store.editCanvasConfig.height - comp.attr.y)
}

function onResizeUp() {
  resizeState = null
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeUp)
  window.removeEventListener('blur', onResizeUp)
}

function onDraggableChange(evt: any) {
  if (evt.added) {
    const item = evt.added.element
    if (item && item._clone) {
      store.components.splice(evt.added.newIndex, 1)
      store.addComponent(item.key, store.dropTargetParentId ?? undefined)
      store.dropTargetParentId = null
    }
  }
}

function onComponentClick(event: MouseEvent, id: string) {
  if (event.ctrlKey || event.metaKey) {
    store.toggleSelectComponent(id)
  } else {
    store.selectComponent(id)
  }
}

let selStart: { x: number; y: number } | null = null
let didDrag = false

function onCanvasMouseDown(event: MouseEvent) {
  if (event.button !== 0) return
  didDrag = false
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  selStart = {
    x: (event.clientX - rect.left) / scale.value,
    y: (event.clientY - rect.top) / scale.value,
  }
  window.addEventListener('mousemove', onSelectionMouseMove)
  window.addEventListener('mouseup', onSelectionMouseUp)
}

function onSelectionMouseMove(event: MouseEvent) {
  if (!selStart) return
  didDrag = true
  const gridEl = document.querySelector('.canvas-grid')
  if (!gridEl) return
  const rect = gridEl.getBoundingClientRect()
  const mx = (event.clientX - rect.left) / scale.value
  const my = (event.clientY - rect.top) / scale.value
  selRect.value = {
    x: Math.min(mx, selStart.x),
    y: Math.min(my, selStart.y),
    w: Math.abs(mx - selStart.x),
    h: Math.abs(my - selStart.y),
  }
}

function onSelectionMouseUp() {
  if (didDrag && selRect.value) {
    store.selectComponentsByRect(selRect.value.x, selRect.value.y, selRect.value.w, selRect.value.h)
  } else {
    store.clearSelection()
  }
  selStart = null
  selRect.value = null
  window.removeEventListener('mousemove', onSelectionMouseMove)
  window.removeEventListener('mouseup', onSelectionMouseUp)
}

function findParentGroup(id: string): CanvasComponent | null {
  for (const comp of store.components) {
    if (comp.groupList && comp.groupList.some(c => c.id === id)) {
      return comp
    }
  }
  return null
}

function onContextMenu(event: MouseEvent) {
  const compEl = (event.target as HTMLElement).closest('[data-comp-id]')
  let isGroup = false
  let ctxId: string | null = null

  if (compEl) {
    const id = compEl.getAttribute('data-comp-id')
    if (id) {
      store.selectComponent(id)
      ctxId = id
      const comp = store.components.find(c => c.id === id)
      if (comp) {
        isGroup = comp.key === 'group'
      } else {
        const parentGroup = findParentGroup(id)
        if (parentGroup) {
          isGroup = true
          ctxId = parentGroup.id
        }
      }
    }
  } else {
    if (store.selectedId) {
      ctxId = store.selectedId
      const comp = store.components.find(c => c.id === store.selectedId)
      if (comp) {
        isGroup = comp.key === 'group'
      } else {
        const parentGroup = findParentGroup(store.selectedId)
        if (parentGroup) {
          isGroup = true
          ctxId = parentGroup.id
        }
      }
    }
  }

  ctxMenu.value = {
    show: true,
    x: event.clientX,
    y: event.clientY,
    isGroup,
    ctxId,
  }
}

function handleGroup() {
  ctxMenu.value.show = false
  store.groupSelectedComponents()
}

function handleUngroup() {
  ctxMenu.value.show = false
  if (ctxMenu.value.ctxId) {
    store.ungroupComponent(ctxMenu.value.ctxId)
  }
}
</script>

<style scoped>
.canvas-area {
  flex: 1;
  background-color: #11111b;
  background-image: radial-gradient(circle, #585b70 1px, transparent 1px);
  background-size: 20px 20px;
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.canvas-grid {
  position: relative;
  background-repeat: no-repeat, repeat;
  background-position: center, 0 0;
}

.canvas-component {
  position: absolute;
  background: #1e1e2e;
  border: 2px solid #45475a;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  transition: border-color 0.15s;
  cursor: default;
}

.canvas-component.selected {
  border-color: #89b4fa;
  box-shadow: 0 0 12px rgba(137, 180, 250, 0.3);
}

.canvas-component.multi-selected {
  border-color: #a6e3a1;
  box-shadow: 0 0 8px rgba(166, 227, 161, 0.3);
}

.canvas-component.locked {
  border-color: #f38ba8;
  opacity: 0.85;
}

.canvas-component.hidden {
  display: none;
}

.selection-rect {
  position: absolute;
  border: 1px dashed #89b4fa;
  background: rgba(137, 180, 250, 0.08);
  pointer-events: none;
  z-index: 100;
}

.comp-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: #313244;
  user-select: none;
  flex-shrink: 0;
  cursor: move;
  min-height: 28px;
}

.comp-label {
  font-size: 11px;
  color: #a6adc8;
  font-weight: 500;
}

.header-badges {
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge {
  font-size: 11px;
  line-height: 1;
}

.remove-btn {
  background: none;
  border: none;
  color: #6c7086;
  cursor: pointer;
  font-size: 11px;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.15s;
}

.remove-btn:hover {
  background: #f38ba8;
  color: #1e1e2e;
}

.comp-body {
  flex: 1;
  overflow: hidden;
}

.resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 14px;
  height: 14px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, #89b4fa 50%);
  border-radius: 0 0 4px 0;
}

.resize-handle:hover {
  background: linear-gradient(135deg, transparent 50%, #a6e3a1 50%);
}

.empty-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #6c7086;
  user-select: none;
  pointer-events: none;
}

.empty-hint .empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-hint p {
  font-size: 14px;
  margin: 0;
}

.ruler-toolbar {
  position: absolute;
  top: 20px;
  right: 16px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 4px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 4px 8px;
}

.ruler-toolbar button {
  background: none;
  border: 1px solid #45475a;
  color: #cdd6f4;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 2px 8px;
  border-radius: 4px;
  transition: all 0.15s;
}

.ruler-toolbar button:hover {
  background: #45475a;
}

.zoom-pct {
  color: #a6adc8;
  font-size: 12px;
  min-width: 48px;
  text-align: center;
  user-select: none;
}
</style>

<style>
.sketch-ruler {
  background: transparent !important;
}

.sketch-ruler .h-container .lines .line {
  border-top: 1px dashed #89b4fa !important;
}

.sketch-ruler .v-container .lines .line {
  border-left: 1px dashed #89b4fa !important;
}

.sketch-ruler .h-container .lines .line-locked {
  border-top: 1px dashed #45475a !important;
}

.sketch-ruler .v-container .lines .line-locked {
  border-left: 1px dashed #45475a !important;
}

.sketch-ruler .corner {
  border-width: 0 !important;
  background: transparent !important;
}

.sketch-ruler .indicator .value {
  background-color: transparent !important;
}

.sketch-ruler .line-label {
  background: transparent !important;
}
</style>
