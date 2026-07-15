<template>
  <div class="datasource-wrap">
    <el-tabs v-model="activeTab" class="ds-tabs">
      <el-tab-pane label="数据源" name="source">
        <DataSourceStats />
        <DataSourceTable />
      </el-tab-pane>
      <el-tab-pane label="数据集" name="dataset">
        <DatasetList @create="newDataset" @edit="editDataset" @edit-base="editBase" />
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
import { useDatasetStore } from '../../../stores/dataset'
import type { DatasetConfig } from 'jojotaoo_components'

const activeTab = ref('source')
const createRef = ref<InstanceType<typeof DatasetCreateDialog> | null>(null)
const editorRef = ref<InstanceType<typeof DatasetEditor> | null>(null)
const store = useDatasetStore()

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
function onCreateConfirm(config: DatasetConfig) {
  if (store.getDataset(config.id)) {
    store.updateDataset(config)
    ElMessage.success('基础信息已更新')
  } else {
    store.addDataset(config)
    ElMessage.success('数据集已创建，可继续添加数据加工')
  }
  editorRef.value?.open(config)
}

function onSaved(config: DatasetConfig) {
  if (store.getDataset(config.id)) store.updateDataset(config)
  else store.addDataset(config)
  ElMessage.success('数据集已保存')
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
