<template>
  <div
    class="container-component"
    :class="{ 'drop-active': isOver }"
    :style="{
      backgroundColor: bgColor,
      borderColor: borderColor,
    }"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
  >
    <div
      v-for="child in children"
      :key="child.id"
      class="child-component"
      :class="{ selected: child.id === store.selectedId }"
      :style="{
        left: child.attr.x + 'px',
        top: child.attr.y + 'px',
        width: child.attr.w + 'px',
        height: child.attr.h + 'px',
      }"
      @mousedown.stop="onChildMouseDown($event, child.id)"
      @click.stop="childClick(child.id)"
    >
      <BarChart
        v-if="child.key === 'BarCommon'"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
      />
      <LineChart
        v-else-if="child.key === 'LineCommon'"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
      />
      <div
        class="child-resize"
        @mousedown.stop="onChildResizeStart($event, child.id)"
      ></div>
    </div>
    <div v-if="children.length === 0" class="container-placeholder">
      拖拽组件到此处
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import BarChart from './BarChart.vue'
import LineChart from './LineChart.vue'
import { useDashboardStore } from '../../stores/dashboard'
import type { CanvasComponent } from '../../stores/dashboard'

const store = useDashboardStore()

const props = withDefaults(defineProps<{
  bgColor?: string
  borderColor?: string
  parentId?: string
  scale?: number
}>(), {
  bgColor: 'rgba(30, 30, 46, 0.6)',
  borderColor: '#89b4fa',
  parentId: '',
  scale: 1,
})

const isOver = ref(false)

const children = computed(() =>
  store.components.filter(c => c.parentId === props.parentId) as CanvasComponent[]
)

let dragState: { id: string; startX: number; startY: number; compX: number; compY: number } | null = null
let resizeState: { id: string; startX: number; startY: number; compW: number; compH: number; parentEl: HTMLElement | null } | null = null

onUnmounted(() => {
  dragState = null
  resizeState = null
  window.removeEventListener('mousemove', onChildMouseMove)
  window.removeEventListener('mouseup', onChildMouseUp)
  window.removeEventListener('mousemove', onChildResizeMove)
  window.removeEventListener('mouseup', onChildResizeUp)
})

function childClick(id: string) {
  store.selectComponent(id)
}

function onChildMouseDown(event: MouseEvent, id: string) {
  const comp = store.components.find(c => c.id === id)
  if (!comp || comp.status.lock) return
  dragState = {
    id,
    startX: event.clientX,
    startY: event.clientY,
    compX: comp.attr.x,
    compY: comp.attr.y,
  }
  window.addEventListener('mousemove', onChildMouseMove)
  window.addEventListener('mouseup', onChildMouseUp)
}

function onChildMouseMove(event: MouseEvent) {
  if (!dragState) return
  const dx = (event.clientX - dragState.startX) / props.scale
  const dy = (event.clientY - dragState.startY) / props.scale
  store.moveComponentDelta(dragState.id, dx, dy, dragState.compX, dragState.compY)
}

function onChildMouseUp() {
  dragState = null
  window.removeEventListener('mousemove', onChildMouseMove)
  window.removeEventListener('mouseup', onChildMouseUp)
}

function onChildResizeStart(event: MouseEvent, id: string) {
  const comp = store.components.find(c => c.id === id)
  if (!comp || comp.status.lock) return
  resizeState = {
    id,
    startX: event.clientX,
    startY: event.clientY,
    compW: comp.attr.w,
    compH: comp.attr.h,
    parentEl: (event.currentTarget as HTMLElement).parentElement,
  }
  window.addEventListener('mousemove', onChildResizeMove)
  window.addEventListener('mouseup', onChildResizeUp)
}

function onChildResizeMove(event: MouseEvent) {
  if (!resizeState) return
  const dx = (event.clientX - resizeState.startX) / props.scale
  const dy = (event.clientY - resizeState.startY) / props.scale
  const comp = store.components.find(c => c.id === resizeState!.id)
  if (!comp) return
  const parentRect = resizeState.parentEl?.parentElement?.getBoundingClientRect()
  store.resizeComponentDelta(resizeState.id, dx, dy, resizeState.compW, resizeState.compH, parentRect ? parentRect.width - comp.attr.x : undefined, parentRect ? parentRect.height - comp.attr.y : undefined)
}

function onChildResizeUp() {
  resizeState = null
  window.removeEventListener('mousemove', onChildResizeMove)
  window.removeEventListener('mouseup', onChildResizeUp)
}

function onDragOver() {
  isOver.value = true
  store.dropTargetParentId = props.parentId
}

function onDragLeave() {
  isOver.value = false
  if (store.dropTargetParentId === props.parentId) {
    store.dropTargetParentId = null
  }
}

function onDrop(_event: DragEvent) {
  isOver.value = false
}
</script>

<style scoped>
.container-component {
  width: 100%;
  height: 100%;
  border: 2px dashed;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  transition: background-color 0.2s, border-color 0.2s;
}

.container-component.drop-active {
  border-color: #a6e3a1;
  background-color: rgba(166, 227, 161, 0.1);
}

.child-component {
  position: absolute;
  border: 2px solid #45475a;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.15s;
  cursor: move;
}

.child-component.selected {
  border-color: #89b4fa;
  box-shadow: 0 0 8px rgba(137, 180, 250, 0.3);
}

.child-resize {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 12px;
  height: 12px;
  cursor: nwse-resize;
  background: linear-gradient(135deg, transparent 50%, #89b4fa 50%);
  border-radius: 0 0 4px 0;
}

.container-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c7086;
  font-size: 13px;
  user-select: none;
  pointer-events: none;
}
</style>
