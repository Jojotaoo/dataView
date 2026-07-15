<template>
  <div class="dataset-list-wrap">
    <div class="dl-toolbar">
      <el-button type="success" @click="emit('create')">
        <el-icon><Plus /></el-icon>
        新建数据集
      </el-button>
      <span class="dl-hint">数据集为全局资源，可被任意图表引用</span>
    </div>
    <el-table :data="store.datasets" border stripe empty-text="暂无数据集">
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column prop="dataSourceId" label="数据源" min-width="180" />
      <el-table-column label="更新时间" width="180">
        <template #default="{ row }">
          {{ formatTime(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="320" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="emit('edit', row)">编辑</el-button>
          <el-button link type="warning" @click="emit('edit-base', row)">编辑基础信息</el-button>
          <el-button link type="success" @click="copySql(row)">复制 SQL</el-button>
          <el-button link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useDatasetStore } from '../../../stores/dataset'
import { buildDatasetSQL, useDashboardStore } from 'jojotaoo_components'
import { deleteDataset } from '../../../server/dataset'
import type { DatasetConfig } from 'jojotaoo_components'

const emit = defineEmits<{
  (e: 'create'): void
  (e: 'edit', config: DatasetConfig): void
  (e: 'edit-base', config: DatasetConfig): void
}>()
const store = useDatasetStore()

function formatTime(ts?: number): string {
  if (!ts) return '-'
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

async function copySql(config: DatasetConfig) {
  const sql = buildDatasetSQL(config)
  try {
    await navigator.clipboard.writeText(sql)
    ElMessage.success('已复制生成 SQL')
  } catch {
    ElMessage.warning(sql)
  }
}

function serviceOpts() {
  const g = useDashboardStore().requestGlobalConfig
  return { mode: g.datasetMode ?? 'mock', requestOriginUrl: g.requestOriginUrl }
}

async function remove(config: DatasetConfig) {
  try {
    await deleteDataset(config.id, serviceOpts())
  } catch (e) {
    ElMessage.error(e instanceof Error ? e.message : '删除数据集失败')
    return
  }
  store.removeDataset(config.id)
  ElMessage.success('已删除')
}
</script>

<style scoped>
.dataset-list-wrap {
  background: #0f1728;
  border: 1px solid #1a2844;
  border-radius: 8px;
  padding: 20px;
}

.dl-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.dl-hint {
  font-size: 12px;
  color: #8a9bb5;
}
</style>
