<template>
  <div class="left-panel">
    <h3 class="panel-title">组件库</h3>
    <draggable
      tag="div"
      class="component-list"
      :list="store.componentDefinitions"
      :group="{ name: 'canvas', pull: 'clone', put: false }"
      :clone="cloneDefinition"
      item-key="key"
      :sort="false"
    >
      <template #item="{ element: def }">
        <div class="component-item" @click="store.addComponent(def.key)">
          <span class="component-icon">{{ def.icon }}</span>
          <span class="component-name">{{ def.name }}</span>
          <span class="component-badge">{{ def.package }}</span>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '../stores/dashboard'
import draggable from 'vuedraggable'

const store = useDashboardStore()

function cloneDefinition(def: any) {
  return { _clone: true, key: def.key, id: '' }
}
</script>

<style scoped>
.left-panel {
  width: 220px;
  min-width: 220px;
  background: #1e1e2e;
  border-right: 1px solid #313244;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.panel-title {
  padding: 16px 20px;
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #cdd6f4;
  border-bottom: 1px solid #313244;
  user-select: none;
}

.component-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #313244;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.2s;
  user-select: none;
}

.component-item:hover {
  background: #45475a;
  border-color: #89b4fa;
  transform: translateY(-1px);
}

.component-item:active {
  cursor: grabbing;
}

.component-icon {
  font-size: 20px;
}

.component-name {
  font-size: 13px;
  color: #cdd6f4;
  font-weight: 500;
  flex: 1;
}

.component-badge {
  font-size: 10px;
  color: #6c7086;
  background: #181825;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
