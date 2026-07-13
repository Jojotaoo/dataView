<template>
  <div class="list-toolbar">
    <div class="toolbar-left">
      <el-button type="primary" @click="$emit('create')">
        <el-icon><Plus /></el-icon>
        新建项目
      </el-button>
      <el-button plain :disabled="!selectedCount">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
      <span class="toolbar-hint">
        <el-icon><InfoFilled /></el-icon>
        共 {{ totalCount }} 个项目
      </span>
    </div>
    <div class="toolbar-right">
      <el-input
        :model-value="searchValue"
        placeholder="搜索项目名称..."
        clearable
        style="width: 180px"
        @update:model-value="$emit('update:searchValue', $event)"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select
        :model-value="statusFilter"
        placeholder="全部状态"
        style="width: 120px"
        @update:model-value="$emit('update:statusFilter', $event)"
      >
        <el-option label="全部状态" value="all" />
        <el-option label="已发布" value="published" />
        <el-option label="未发布" value="unpublished" />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Delete, Search, InfoFilled } from '@element-plus/icons-vue'

defineProps<{
  searchValue: string
  statusFilter: string
  totalCount: number
  selectedCount: number
}>()

defineEmits<{
  create: []
  'update:searchValue': [value: string]
  'update:statusFilter': [value: string]
}>()
</script>

<style scoped>
.list-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toolbar-hint {
  font-size: 12px;
  color: #4a6080;
  background: rgba(43, 111, 242, 0.04);
  border: 1px dashed #1a2844;
  border-radius: 4px;
  padding: 6px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
