<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <el-button text @click="goHome">
          <el-icon><ArrowLeft /></el-icon>
          首页
        </el-button>
        <h1 class="app-title">{{ store.editCanvasConfig.projectName || '可视化数据大屏搭建系统' }}</h1>
      </div>
      <div class="header-actions">
        <button class="action-btn" :disabled="!projectId || saving" @click="handleSave">💾 保存</button>
        <button class="action-btn publish" :disabled="!projectId || publishing" @click="handlePublish">🚀 发布</button>
        <button class="preview-btn" @click="enterPreview">👁 预览</button>
      </div>
    </header>
    <div class="workbench">
      <LeftPanel />
      <CanvasArea />
      <RightPanel />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDashboardStore, type ChartEditStorage } from 'jojotaoo_components'
import { ArrowLeft } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useChartSchema } from '../composables/useChartSchema'
import { useDatasetStore } from '../stores/dataset'
import { getProject, saveProjectSchema, publishProjectSchema, type ProjectServiceOptions } from '../server/project'
import LeftPanel from '../components/LeftPanel.vue'
import CanvasArea from '../components/CanvasArea.vue'
import RightPanel from '../components/RightPanel/index.vue'

const STORAGE_KEY = 'preview_schema'

const router = useRouter()
const route = useRoute()
const store = useDashboardStore()
const datasetStore = useDatasetStore()
const { schema: previewSchema } = useChartSchema()

const projectId = computed(() => (route.params.id as string) || '')
const saving = ref(false)
const publishing = ref(false)

function serviceOpts(): ProjectServiceOptions {
  return {
    mode: store.requestGlobalConfig.datasetMode ?? 'mock',
    requestOriginUrl: store.requestGlobalConfig.requestOriginUrl,
  }
}

// 无 schema 的项目（新建未保存）按空白画布处理，避免上一个项目的图表泄漏到当前项目
function emptySchema(): ChartEditStorage {
  return {
    editCanvasConfig: { ...store.editCanvasConfig, projectName: '' },
    requestGlobalConfig: { ...store.requestGlobalConfig },
    componentList: [],
  }
}

async function loadProject() {
  if (!projectId.value) {
    ElMessage.warning('请先在项目列表创建项目')
    return
  }
  try {
    const project = await getProject(projectId.value, serviceOpts())
    const schemaToLoad = project.schema ?? emptySchema()
    store.restoreProject(schemaToLoad)
    datasetStore.hydrate((project.schema as any)?.datasetBindings)
    store.updateCanvasConfig({ projectName: project.name })
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '加载项目失败')
  }
}

onMounted(loadProject)
// 应用内直接在 /editor/:id 间切换时（组件复用不重新挂载），按新 id 重新加载/重置画布
watch(() => route.params.id, loadProject)

function goHome() {
  router.push('/')
}

async function handleSave() {
  if (!projectId.value) return
  saving.value = true
  try {
    await saveProjectSchema(projectId.value, previewSchema.value, serviceOpts())
    ElMessage.success('已保存')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '保存失败')
  } finally {
    saving.value = false
  }
}

async function handlePublish() {
  if (!projectId.value) return
  publishing.value = true
  try {
    await publishProjectSchema(projectId.value, previewSchema.value, serviceOpts())
    ElMessage.success('已发布')
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '发布失败')
  } finally {
    publishing.value = false
  }
}

function enterPreview() {
  if (
    store.requestGlobalConfig.datasetMode === 'server' &&
    store.requestGlobalConfig.requestOriginUrl &&
    projectId.value
  ) {
    // 服务端模式：预览页按路由 id 从服务端拉取 schema（origin 由 preview 包内常量占位）
    window.open('/preview/' + projectId.value, '_blank')
  } else {
    // mock 模式：沿用 localStorage 直传兜底
    localStorage.setItem(STORAGE_KEY, JSON.stringify(previewSchema.value))
    window.open('/preview', '_blank')
  }
}
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

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
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

.action-btn {
  padding: 6px 16px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.action-btn:hover:not(:disabled) {
  background: #45475a;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.publish {
  background: #89b4fa;
  border-color: #89b4fa;
  color: #1e1e2e;
}

.action-btn.publish:hover:not(:disabled) {
  background: #b4d0fb;
  border-color: #b4d0fb;
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
