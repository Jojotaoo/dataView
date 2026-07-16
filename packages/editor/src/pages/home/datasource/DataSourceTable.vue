<template>
  <div class="ds-table-wrap">
    <div class="ds-toolbar">
      <el-button type="warning" @click="load">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
      <el-input
        v-model="query.keyword"
        class="ds-search"
        placeholder="搜索名称 / ID / 类型"
        clearable
        @keyup.enter="onSearch"
        @clear="onSearch"
      />
      <el-button type="primary" @click="onSearch">查询</el-button>
      <el-button @click="onReset">重置</el-button>
      <span class="ds-hint">数据源由平台服务端注册，前端仅引用其 id</span>
    </div>
    <el-table v-loading="loading" :data="list" border stripe empty-text="暂无数据源">
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column prop="type" label="类型" width="140">
        <template #default="{ row }">
          <el-tag :type="typeTag(row.type)">{{ row.type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="id" label="数据源 ID" min-width="180" />
    </el-table>
    <el-pagination
      class="ds-pager"
      background
      layout="total, sizes, prev, pager, next"
      :total="total"
      :page-size="query.pageSize"
      :current-page="query.page"
      :page-sizes="[10, 20, 50, 100]"
      @current-change="onPageChange"
      @size-change="onSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { fetchDataSourceList } from '../../../server/dataset'
import type { DataSourceItem } from 'jojotaoo_components'

const list = ref<DataSourceItem[]>([])
const total = ref(0)
const loading = ref(false)
const query = reactive({ page: 1, pageSize: 20, keyword: '' })

function typeTag(t: string): string {
  if (t === 'mysql') return 'primary'
  if (t === 'postgres') return 'success'
  if (t === 'clickhouse') return 'warning'
  return 'info'
}

async function load() {
  loading.value = true
  try {
    const res = await fetchDataSourceList({ ...query })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function onSearch() {
  query.page = 1
  load()
}

function onReset() {
  query.keyword = ''
  query.page = 1
  query.pageSize = 20
  load()
}

function onPageChange(page: number) {
  query.page = page
  load()
}

function onSizeChange(size: number) {
  query.pageSize = size
  query.page = 1
  load()
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

.ds-search {
  width: 240px;
}

.ds-hint {
  font-size: 12px;
  color: #8a9bb5;
}

.ds-pager {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
