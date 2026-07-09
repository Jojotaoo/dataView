<template>
  <div class="left-panel">
    <div class="sidebar-nav">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="nav-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <span class="nav-icon">{{ tab.icon }}</span>
        <span class="nav-label">{{ tab.label }}</span>
      </div>
    </div>
    <div class="sidebar-content">
      <div class="component-list">
        <div
          v-for="def in currentList"
          :key="def.key"
          class="component-item"
          @click="store.addComponent(def.key)"
        >
          <span class="component-icon">{{ def.icon }}</span>
          <span class="component-name">{{ def.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDashboardStore } from '../stores/dashboard'

const store = useDashboardStore()
const activeTab = ref('basic')

const tabs = [
  { key: 'basic', label: '基础', icon: '📦' },
  { key: 'business', label: '业务', icon: '📊' },
  { key: 'decoration', label: '装饰', icon: '🎨' },
]

const basicList = computed(() => store.componentDefinitions.filter(d => d.groupType === 'basic'))
const businessList = computed(() => store.componentDefinitions.filter(d => d.groupType === 'business'))
const decorationList = computed(() => store.componentDefinitions.filter(d => d.groupType === 'decoration'))

const currentList = computed(() => {
  if (activeTab.value === 'basic') return basicList.value
  if (activeTab.value === 'business') return businessList.value
  return decorationList.value
})
</script>

<style scoped>
.left-panel {
  width: 220px;
  min-width: 220px;
  background: #1e1e2e;
  border-right: 1px solid #313244;
  display: flex;
  overflow: hidden;
}

.sidebar-nav {
  width: 42px;
  min-width: 42px;
  background: #181825;
  border-right: 1px solid #313244;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 8px;
  gap: 4px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 54px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}

.nav-item:hover {
  background: #313244;
}

.nav-item.active {
  background: #45475a;
}

.nav-icon {
  font-size: 16px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 10px;
  color: #a6adc8;
  font-weight: 500;
}

.nav-item.active .nav-label {
  color: #89b4fa;
  font-weight: 600;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.component-list {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.component-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
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
  font-size: 18px;
}

.component-name {
  font-size: 12px;
  color: #cdd6f4;
  font-weight: 500;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
