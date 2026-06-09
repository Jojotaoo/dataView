<template>
  <div class="canvas-area">
    <div
      class="canvas-grid"
      :style="{
        width: store.pageConfig.width + 'px',
        minHeight: store.pageConfig.height + 'px',
        backgroundColor: store.pageConfig.bgColor,
        backgroundImage: store.pageConfig.bgImage
          ? `url(${store.pageConfig.bgImage}), radial-gradient(circle, #313244 1px, transparent 1px)`
          : undefined,
        backgroundSize: store.pageConfig.bgImage
          ? 'cover, 20px 20px'
          : undefined,
      }"
      @dragover.prevent
      @drop="onDrop"
      @click.self="store.selectComponent(null)"
    >
      <div
        v-for="comp in store.rootComponents"
        :key="comp.id"
        class="canvas-component"
        :class="{ selected: comp.id === store.selectedId }"
        :style="{
          left: comp.x + 'px',
          top: comp.y + 'px',
          width: comp.width + 'px',
          height: comp.height + 'px',
        }"
        @mousedown.stop="onMouseDown($event, comp.id)"
        @click.stop="store.selectComponent(comp.id)"
      >
        <div class="comp-header">
          <span class="comp-label">{{ comp.name }}</span>
          <button class="remove-btn" @click.stop="store.removeComponent(comp.id)">✕</button>
        </div>
        <div class="comp-body">
          <Container
            v-if="comp.type === 'container'"
            :bg-color="comp.props.bgColor"
            :border-color="comp.props.borderColor"
            :parent-id="comp.id"
          />
          <BarChart
            v-else-if="comp.type === 'bar-chart'"
            :title="comp.props.title"
            :width="comp.width"
            :height="comp.height - 32"
            :bg-color="comp.props.bgColor"
            :data="comp.props.data"
          />
        </div>
        <div
          class="resize-handle"
          @mousedown.stop="onResizeStart($event, comp.id)"
        ></div>
      </div>
      <div v-if="store.components.length === 0" class="empty-hint">
        <div class="empty-icon">📋</div>
        <p>从左侧组件库拖拽或点击添加组件</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import BarChart from './charts/BarChart.vue'
import Container from './charts/Container.vue'

const store = useDashboardStore()

let dragState: { id: string; startX: number; startY: number; compX: number; compY: number } | null = null
let resizeState: { id: string; startX: number; startY: number; compW: number; compH: number } | null = null

function onMouseDown(event: MouseEvent, id: string) {
  const comp = store.components.find(c => c.id === id)
  if (!comp) return
  dragState = {
    id,
    startX: event.clientX,
    startY: event.clientY,
    compX: comp.x,
    compY: comp.y,
  }
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(event: MouseEvent) {
  if (!dragState) return
  const dx = event.clientX - dragState.startX
  const dy = event.clientY - dragState.startY
  const comp = store.components.find(c => c.id === dragState!.id)
  if (!comp) return
  const pageW = store.pageConfig.width
  const pageH = store.pageConfig.height
  comp.x = Math.max(0, Math.min(dragState.compX + dx, pageW - comp.width))
  comp.y = Math.max(0, Math.min(dragState.compY + dy, pageH - comp.height))
}

function onMouseUp() {
  dragState = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

function onResizeStart(event: MouseEvent, id: string) {
  const comp = store.components.find(c => c.id === id)
  if (!comp) return
  resizeState = {
    id,
    startX: event.clientX,
    startY: event.clientY,
    compW: comp.width,
    compH: comp.height,
  }
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeUp)
}

function onResizeMove(event: MouseEvent) {
  if (!resizeState) return
  const dx = event.clientX - resizeState.startX
  const dy = event.clientY - resizeState.startY
  const comp = store.components.find(c => c.id === resizeState!.id)
  if (!comp) return
  const pageW = store.pageConfig.width
  const pageH = store.pageConfig.height
  comp.width = Math.max(100, Math.min(resizeState.compW + dx, pageW - comp.x))
  comp.height = Math.max(60, Math.min(resizeState.compH + dy, pageH - comp.y))
}

function onResizeUp() {
  resizeState = null
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeUp)
}

function onDrop(event: DragEvent) {
  const type = event.dataTransfer?.getData('text/plain')
  if (type) {
    store.addComponent(type)
  }
}
</script>

<style scoped>
.canvas-area {
  flex: 1;
  background: #11111b;
  position: relative;
  overflow: auto;
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
  overflow: hidden;
  transition: border-color 0.15s;
  cursor: default;
}

.canvas-component.selected {
  border-color: #89b4fa;
  box-shadow: 0 0 12px rgba(137, 180, 250, 0.3);
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
</style>
