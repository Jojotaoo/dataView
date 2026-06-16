<template>
  <div class="app-container">
    <header class="app-header">
      <h1 class="app-title">{{ store.editCanvasConfig.projectName || '可视化大屏搭建系统' }}</h1>
      <div class="header-actions">
        <button class="preview-btn" @click="showPreview = true">
          👁 预览
        </button>
      </div>
    </header>
    <div class="workbench">
      <LeftPanel />
      <CanvasArea />
      <RightPanel />
    </div>
    <PreviewRenderer
      v-if="showPreview"
      :schema="previewSchema"
      @close="showPreview = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDashboardStore } from './stores/dashboard'
import type { ChartEditStorage } from './types'
import LeftPanel from './components/LeftPanel.vue'
import CanvasArea from './components/CanvasArea.vue'
import RightPanel from './components/RightPanel/index.vue'
import PreviewRenderer from './components/PreviewRenderer.vue'

const store = useDashboardStore()
const showPreview = ref(false)

const previewSchema = computed((): ChartEditStorage => ({
  editCanvasConfig: { ...store.editCanvasConfig },
  requestGlobalConfig: { ...store.requestGlobalConfig },
  componentList: store.components.map(c => ({
    id: c.id,
    key: c.key,
    chartConfig: { ...c.chartConfig },
    attr: { ...c.attr },
    styles: { ...c.styles },
    status: { ...c.status },
    preview: { ...c.preview },
    filter: c.filter,
    option: { ...c.option },
    isGroup: c.isGroup,
    groupList: c.groupList ? JSON.parse(JSON.stringify(c.groupList)) : undefined,
    request: c.request ? JSON.parse(JSON.stringify(c.request)) : undefined,
    events: c.events ? JSON.parse(JSON.stringify(c.events)) : undefined,
    interactActions: c.interactActions ? JSON.parse(JSON.stringify(c.interactActions)) : undefined,
  })),
}))
</script>

<style scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #11111b;
  overflow: hidden;
}

.app-header {
  height: 48px;
  min-height: 48px;
  background: #181825;
  border-bottom: 1px solid #313244;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.app-title {
  font-size: 16px;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0;
  user-select: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-btn {
  padding: 6px 16px;
  background: #89b4fa;
  border: none;
  border-radius: 6px;
  color: #1e1e2e;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.preview-btn:hover {
  background: #b4d0fb;
  transform: translateY(-1px);
}

.workbench {
  flex: 1;
  display: flex;
  overflow: hidden;
}
</style>
