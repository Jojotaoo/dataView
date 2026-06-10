<template>
  <div class="right-panel">
    <div class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab"
        :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <ComponentProps v-show="activeTab === 'props'" v-if="store.selectedComponent" />
    <CanvasConfig v-show="activeTab === 'page'" v-if="!store.selectedComponent" />
    <DataRequest v-show="activeTab === 'request'" />
    <SchemaPanel v-show="activeTab === 'schema'" v-if="!store.selectedComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'
import ComponentProps from './ComponentProps.vue'
import CanvasConfig from './CanvasConfig.vue'
import DataRequest from './DataRequest.vue'
import SchemaPanel from './SchemaPanel.vue'

const store = useDashboardStore()

const tabs = computed(() => {
  if (store.selectedComponent) {
    return [
      { key: 'props', label: '组件配置' },
      { key: 'request', label: '数据请求' },
    ]
  }
  return [
    { key: 'page', label: '画布配置' },
    { key: 'schema', label: 'Schema' },
    { key: 'request', label: '数据请求' },
  ]
})

const activeTab = ref<string>(store.selectedComponent ? 'props' : 'page')

watch(() => store.selectedComponent, (comp) => {
  if (comp) {
    activeTab.value = 'props'
  } else {
    activeTab.value = 'page'
  }
})
</script>

<style scoped>
.right-panel {
  width: 280px;
  min-width: 280px;
  background: #1e1e2e;
  border-left: 1px solid #313244;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #313244;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.tab {
  flex: 1;
  min-width: 60px;
  padding: 10px 8px;
  background: none;
  border: none;
  color: #6c7086;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  user-select: none;
  text-align: center;
}

.tab:hover {
  color: #a6adc8;
  background: #313244;
}

.tab.active {
  color: #cdd6f4;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 8px;
  right: 8px;
  height: 2px;
  background: #89b4fa;
  border-radius: 1px 1px 0 0;
}

.panel-content {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
}
</style>

<style>
.json-key {
  color: #89b4fa;
}
.json-string {
  color: #a6e3a1;
}
.json-number {
  color: #fab387;
}
.json-boolean {
  color: #cba6f7;
}
</style>
