<template>
  <div class="ds-table-wrap">
    <div class="ds-toolbar">
      <el-button type="warning" @click="load">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
      <span class="ds-hint">数据源由平台服务端注册，前端仅引用其 id</span>
    </div>
    <el-table :data="list" border stripe empty-text="暂无数据源">
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column prop="type" label="类型" width="140">
        <template #default="{ row }">
          <el-tag :type="typeTag(row.type)">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="数据源 ID" min-width="180" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { fetchDataSourceEnum } from '../../../server/dataset'
import type { DataSourceItem } from 'jojotaoo_components'

const list = ref<DataSourceItem[]>([])

function typeTag(t: string): string {
  if (t === 'mysql') return 'primary'
  if (t === 'postgres') return 'success'
  if (t === 'clickhouse') return 'warning'
  return 'info'
}

async function load() {
  list.value = await fetchDataSourceEnum()
}

onMounted(load)
</script>

<style scoped>
.ds-table-wrap {
  background: #0f1728;
  border: 1px solid #1a2844;
  border-radius: 8px;
  padding: 20px;
}

.ds-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.ds-hint {
  font-size: 12px;
  color: #8a9bb5;
}
</style>
