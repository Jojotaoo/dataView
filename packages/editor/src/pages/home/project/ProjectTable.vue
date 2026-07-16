<template>
  <div class="card" style="padding: 16px 20px">
    <el-table
      :data="projects"
      style="width: 100%"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      :header-cell-style="{
        background: '#0F1728',
        color: '#8A9BB5',
        borderBottom: '1px solid #1A2844',
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.5px',
      }"
      :cell-style="{ background: '#0F1728', color: '#E8EDF2', borderBottom: '1px solid rgba(30,42,61,0.25)' }"
      :row-class-name="() => 'project-row'"
    >
      <el-table-column type="selection" width="40" />

      <el-table-column prop="name" label="项目名称" min-width="160">
        <template #default="{ row }">
          <strong>{{ row.name }}</strong>
        </template>
      </el-table-column>

      <el-table-column label="缩略图" width="90">
        <template #default>
          <div class="thumb">
            <el-icon><DataLine /></el-icon>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="category" label="分类" width="80" />

      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status === 1" type="success" effect="dark" size="small" round> 已发布 </el-tag>
          <el-tag v-else type="info" effect="plain" size="small" round> 未发布 </el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="creator" label="创建人" width="80" />

      <el-table-column label="创建时间" width="110">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>

      <el-table-column label="最后编辑" width="100">
        <template #default="{ row }">{{ formatTime(row.updatedAt) }}</template>
      </el-table-column>

      <el-table-column label="操作" width="90" fixed="right">
        <template #default="{ row }">
          <div class="actions-cell">
            <el-icon class="action-btn" :size="24" @click="$emit('edit', row.id)"><Edit /></el-icon>
            <el-icon class="action-btn" :size="24"><View /></el-icon>
            <el-icon class="action-btn delete" :size="24" @click="$emit('delete', row.id)"><Delete /></el-icon>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { DataLine, Edit, View, Delete } from '@element-plus/icons-vue'

export interface ProjectItem {
  id: string
  name: string
  category: string
  status: 0 | 1
  creator: string
  createdAt: number
  updatedAt: number
}

defineProps<{
  projects: ProjectItem[]
  loading?: boolean
}>()

const emit = defineEmits<{
  edit: [id: string]
  delete: [id: string]
  selectionChange: [rows: ProjectItem[]]
}>()

function handleSelectionChange(rows: ProjectItem[]) {
  emit('selectionChange', rows)
}

function formatTime(ts?: number): string {
  if (!ts) return '-'
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
</script>

<style scoped>
.card {
  background: #0f1728;
  border: 1px solid #1a2844;
  border-radius: 8px;
  box-shadow: 0 0 40px rgba(43, 111, 242, 0.06);
}

:deep(.project-row) {
  background: #0f1728;
}

:deep(.project-row:hover > td) {
  background: rgba(43, 111, 242, 0.03) !important;
}

:deep(.el-table__header) {
  border-bottom: 1px solid #1a2844;
}

:deep(.el-table--border::after),
:deep(.el-table--border::before),
:deep(.el-table__inner-wrapper::before) {
  background-color: #1a2844;
}

.thumb {
  width: 64px;
  height: 38px;
  background: #080c16;
  border-radius: 4px;
  border: 1px solid #1a2844;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a6080;
  font-size: 16px;
}

.actions-cell {
  display: flex;
  gap: 4px;
}

.action-btn {
  color: #4a6080;
  cursor: pointer;
  transition: 0.3s ease;
  padding: 4px;
  font-size: 15px;
}

.action-btn:hover {
  color: #2b6ff2;
}

.action-btn.delete:hover {
  color: #ff2d4a;
}
</style>
