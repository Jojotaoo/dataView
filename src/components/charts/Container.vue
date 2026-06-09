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
      v-for="child in store.getChildren(parentId)"
      :key="child.id"
      class="child-component"
      :class="{ selected: child.id === store.selectedId }"
      :style="{
        left: child.x + 'px',
        top: child.y + 'px',
        width: child.width + 'px',
        height: child.height + 'px',
      }"
      @mousedown.stop="onChildMouseDown($event, child.id)"
      @click.stop="childClick(child.id)"
    >
      <BarChart
        v-if="child.type === 'bar-chart'"
        :title="child.props.title"
        :width="child.width"
        :height="child.height"
        :bg-color="child.props.bgColor"
        :data="child.props.data"
      />
      <div
        class="child-resize"
        @mousedown.stop="onChildResizeStart($event, child.id)"
      ></div>
    </div>
    <div v-if="store.getChildren(parentId).length === 0" class="container-placeholder">
      拖拽组件到此处
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BarChart from './BarChart.vue'
import { useDashboardStore } from '../../stores/dashboard'

const store = useDashboardStore()

const props = withDefaults(defineProps<{
  bgColor?: string
  borderColor?: string
  parentId?: string
}>(), {
  bgColor: 'rgba(30, 30, 46, 0.6)',
  borderColor: '#89b4fa',
  parentId: '',
})

const isOver = ref(false)

let dragState: { id: string; startX: number; startY: number; compX: number; compY: number } | null = null
let resizeState: { id: string; startX: number; startY: number; compW: number; compH: number; parentEl: HTMLElement | null } | null = null

function childClick(id: string) {
  store.selectComponent(id)
}

function onChildMouseDown(event: MouseEvent, id: string) {
  const comp = store.components.find(c => c.id === id)
  if (!comp) return
  dragState = {
    id,
    startX: event.clientX,
    startY: event.clientY,
    compX: comp.x,
    compY: comp.y,
  }
  window.addEventListener('mousemove', onChildMouseMove)
  window.addEventListener('mouseup', onChildMouseUp)
}

function onChildMouseMove(event: MouseEvent) {
  if (!dragState) return
  const dx = event.clientX - dragState.startX
  const dy = event.clientY - dragState.startY
  const comp = store.components.find(c => c.id === dragState!.id)
  if (!comp) return
  comp.x = Math.max(0, dragState.compX + dx)
  comp.y = Math.max(0, dragState.compY + dy)
}

function onChildMouseUp() {
  dragState = null
  window.removeEventListener('mousemove', onChildMouseMove)
  window.removeEventListener('mouseup', onChildMouseUp)
}

function onChildResizeStart(event: MouseEvent, id: string) {
  const comp = store.components.find(c => c.id === id)
  if (!comp) return
  resizeState = {
    id,
    startX: event.clientX,
    startY: event.clientY,
    compW: comp.width,
    compH: comp.height,
    parentEl: (event.currentTarget as HTMLElement).parentElement,
  }
  window.addEventListener('mousemove', onChildResizeMove)
  window.addEventListener('mouseup', onChildResizeUp)
}

function onChildResizeMove(event: MouseEvent) {
  if (!resizeState) return
  const dx = event.clientX - resizeState.startX
  const dy = event.clientY - resizeState.startY
  const comp = store.components.find(c => c.id === resizeState!.id)
  if (!comp) return
  const parentRect = resizeState.parentEl?.parentElement?.getBoundingClientRect()
  const maxW = parentRect ? parentRect.width - comp.x : 1000
  const maxH = parentRect ? parentRect.height - comp.y : 1000
  comp.width = Math.max(80, Math.min(resizeState.compW + dx, maxW))
  comp.height = Math.max(40, Math.min(resizeState.compH + dy, maxH))
}

function onChildResizeUp() {
  resizeState = null
  window.removeEventListener('mousemove', onChildResizeMove)
  window.removeEventListener('mouseup', onChildResizeUp)
}

function onDragOver() {
  isOver.value = true
}

function onDragLeave() {
  isOver.value = false
}

function onDrop(event: DragEvent) {
  isOver.value = false
  const type = event.dataTransfer?.getData('text/plain')
  if (type) {
    store.addComponent(type, props.parentId)
  }
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
