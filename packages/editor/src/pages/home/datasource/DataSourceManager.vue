<template>
  <div class="datasource-wrap">
    <el-tabs v-model="activeTab" class="ds-tabs">
      <el-tab-pane label="数据源" name="source">
        <DataSourceStats />
        <DataSourceTable />
      </el-tab-pane>
      <el-tab-pane label="数据集" name="dataset">
        <DatasetList ref="listRef" @create="newDataset" @edit="editDataset" @edit-base="editBase" />
      </el-tab-pane>
    </el-tabs>
    <DatasetCreateDialog ref="createRef" @confirm="onCreateConfirm" />
    <DatasetEditor ref="editorRef" @saved="onSaved" @edit-base="onEditBase" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import DataSourceStats from './DataSourceStats.vue'
import DataSourceTable from './DataSourceTable.vue'
import DatasetList from './DatasetList.vue'
import DatasetEditor from './DatasetEditor.vue'
import DatasetCreateDialog from './DatasetCreateDialog.vue'
import { useDashboardStore } from 'jojotaoo_components'
import { fetchDatasetList, type DatasetServiceOptions } from '../../../server/dataset'
import type { DatasetConfig } from 'jojotaoo_components'
import { useDatasetStore } from '../../../stores/dataset'

const activeTab = ref('source')
const createRef = ref<InstanceType<typeof DatasetCreateDialog> | null>(null)
const editorRef = ref<InstanceType<typeof DatasetEditor> | null>(null)
const listRef = ref<InstanceType<typeof DatasetList> | null>(null)
const store = useDatasetStore()
const dashboard = useDashboardStore()

function serviceOpts(): DatasetServiceOptions {
  const g = dashboard.requestGlobalConfig
  return { mode: g.datasetMode ?? 'mock', requestOriginUrl: g.requestOriginUrl }
}

// server 模式下，新建/保存后从接口拉全量列表，整体镜像回 store（供图表配置区下拉 / resolver 使用）
async function syncStoreFromList() {
  const res = await fetchDatasetList({ page: 1, pageSize: 1000, keyword: '' }, serviceOpts())
  store.setDatasets(res.list)
}

function newDataset() {
  createRef.value?.open('create')
}

function editDataset(config: DatasetConfig) {
  editorRef.value?.open(config)
}

function editBase(config: DatasetConfig) {
  createRef.value?.open('edit', config)
}

function onEditBase(config: DatasetConfig) {
  createRef.value?.open('edit', config)
}

// 创建弹窗确认：create 模式 -> 新增并进入加工；edit 模式（修改基础信息）-> 更新后回到加工
async function onCreateConfirm(config: DatasetConfig) {
  if (serviceOpts().mode === 'server') {
    await syncStoreFromList()
    ElMessage.success('数据集已创建，可继续添加数据加工')
  } else if (store.getDataset(config.id)) {
    store.updateDataset(config)
    ElMessage.success('基础信息已更新')
  } else {
    store.addDataset(config)
    ElMessage.success('数据集已创建，可继续添加数据加工')
  }
  listRef.value?.refresh(true)
  editorRef.value?.open(config)
}

async function onSaved(config: DatasetConfig) {
  if (serviceOpts().mode === 'server') {
    await syncStoreFromList()
    ElMessage.success('数据集已保存')
  } else if (store.getDataset(config.id)) {
    store.updateDataset(config)
  } else {
    store.addDataset(config)
  }
  ElMessage.success('数据集已保存')
  listRef.value?.refresh()
}
</script>

<style scoped>
.datasource-wrap {
  padding: 20px 28px 28px 28px;
}

.ds-tabs :deep(.el-tabs__item) {
  color: #8a9bb5;
}

.ds-tabs :deep(.el-tabs__item.is-active) {
  color: #2b6ff2;
}
</style>
