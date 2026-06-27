<template>
  <div class="request-config">
    <div class="prop-group">
      <label class="prop-label">数据源类型</label>
      <div class="type-tabs">
        <button
          v-for="t in dataSourceTypes"
          :key="t.value"
          class="type-tab"
          :class="{ active: request.requestDataType === t.value }"
          @click="updateDataType(t.value)"
        >
          {{ t.label }}
        </button>
      </div>
    </div>

    <HttpRequestForm
      v-if="request.requestDataType === 1"
      :request="request"
      :origin-url="globalConfig.requestOriginUrl"
      @update="emit('update', $event)"
      @test-request="emit('testRequest')"
    />

    <template v-else-if="request.requestDataType === 2">
      <div class="prop-group">
        <label class="prop-label">关联数据池</label>
        <select
          class="prop-select"
          :value="request.requestDataPondId"
          @change="update('requestDataPondId', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">请选择数据池</option>
          <option
            v-for="pond in globalConfig.requestDataPond"
            :key="pond.dataPondId"
            :value="pond.dataPondId"
          >
            {{ pond.dataPondName }}
          </option>
        </select>
        <div v-if="globalConfig.requestDataPond.length === 0" class="empty-hint">
          请先在全局配置中添加数据池
        </div>
      </div>
      <button class="send-btn" @click="emit('testRequest')" :disabled="!request.requestDataPondId || pondLoading?.[request.requestDataPondId!]">
        {{ pondLoading?.[request.requestDataPondId!] ? '请求中...' : '发送请求' }}
      </button>
      <div v-if="pondError?.[request.requestDataPondId!]" class="pond-error">{{ pondError?.[request.requestDataPondId!] }}</div>
      <div v-if="pondResponse?.[request.requestDataPondId!]" class="pond-data-table">
        <div class="table-header">
          <span v-for="(dim, di) in getTableData(request.requestDataPondId!).dimensions" :key="di" class="th">{{ dim }}</span>
        </div>
        <div v-for="(row, ri) in getTableData(request.requestDataPondId!).source" :key="ri" class="table-row">
          <span v-for="(cell, ci) in row" :key="ci" class="cell">{{ cell }}</span>
        </div>
      </div>
    </template>

    <template v-else>
      <StaticDatasetEditor
        v-if="dataset"
        :dataset="dataset"
        @update-dimension="(i, v) => emit('updateDatasetDimension', i, v)"
        @update-cell="(ri, ci, v) => emit('updateDatasetCell', ri, ci, v)"
        @add-row="emit('addDatasetRow')"
        @remove-row="(ri) => emit('removeDatasetRow', ri)"
      />
      <div v-else class="static-hint">
        <p>暂无数据集</p>
        <button class="create-dataset-btn" @click="emit('createDataset')">创建数据集</button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'
import type { RequestConfigType } from '../../types'
import HttpRequestForm from './request/HttpRequestForm.vue'
import StaticDatasetEditor from './request/StaticDatasetEditor.vue'

const props = defineProps<{
  request: RequestConfigType
  dataset?: {
    dimensions: string[]
    source: any[][]
  }
  pondLoading?: Record<string, boolean>
  pondResponse?: Record<string, any>
  pondError?: Record<string, string | null>
}>()

const emit = defineEmits<{
  (e: 'update', request: Partial<RequestConfigType>): void
  (e: 'updateDatasetDimension', index: number, value: string): void
  (e: 'updateDatasetCell', rowIndex: number, colIndex: number, value: string): void
  (e: 'addDatasetRow'): void
  (e: 'removeDatasetRow', rowIndex: number): void
  (e: 'createDataset'): void
  (e: 'testRequest'): void
}>()

const store = useDashboardStore()
const globalConfig = computed(() => store.requestGlobalConfig)

const dataSourceTypes = [
  { value: 0 as const, label: '静态' },
  { value: 1 as const, label: 'AJAX' },
  { value: 2 as const, label: '数据池' },
]

function update(key: string, value: any) {
  emit('update', { [key]: value })
}

function updateDataType(value: number) {
  emit('update', {
    requestDataType: value,
    requestParamsBodyType: value === 1 ? 'none' : undefined,
  })
}

function getTableData(pondId: string) {
  const data = props.pondResponse?.[pondId]
  if (!data) return { dimensions: [] as string[], source: [] as any[][] }
  if (data.dimensions && data.source) return data
  if (Array.isArray(data) && data.length > 0) {
    if (typeof data[0] === 'object' && data[0] !== null) {
      const dims = Object.keys(data[0])
      const src = data.map((row: any) => dims.map(k => row[k]))
      return { dimensions: dims, source: src }
    }
    return { dimensions: ['数据'], source: data.map((v: any) => [v]) }
  }
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    const dims = Object.keys(data)
    const src = [dims.map(k => data[k])]
    return { dimensions: dims, source: src }
  }
  return { dimensions: ['数据'], source: [[data]] }
}
</script>

<style scoped>
.request-config {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.type-tabs {
  display: flex;
  gap: 2px;
  background: #313244;
  border-radius: 6px;
  padding: 3px;
}
.type-tab {
  flex: 1;
  padding: 6px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #6c7086;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.type-tab.active {
  background: #45475a;
  color: #cdd6f4;
}
.type-tab:hover:not(.active) {
  color: #a6adc8;
}
.prop-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.prop-label {
  font-size: 11px;
  color: #a6adc8;
  font-weight: 500;
}
.prop-select {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  cursor: pointer;
}
.send-btn {
  width: 100%;
  padding: 8px 12px;
  background: #89b4fa;
  border: none;
  border-radius: 6px;
  color: #1e1e2e;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.send-btn:hover {
  background: #74c7ec;
}
.send-btn:active {
  background: #89dceb;
}
.empty-hint {
  font-size: 10px;
  color: #f38ba8;
  margin-top: 4px;
}
.static-hint {
  font-size: 11px;
  color: #6c7086;
  text-align: center;
  padding: 12px 0;
}
.create-dataset-btn {
  margin-top: 8px;
  padding: 6px 16px;
  background: #89b4fa;
  border: none;
  border-radius: 6px;
  color: #1e1e2e;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.create-dataset-btn:hover {
  background: #74c7ec;
}
.pond-error {
  font-size: 10px;
  color: #f38ba8;
  margin-top: 4px;
  padding: 4px 8px;
  background: #313244;
  border-radius: 4px;
}
.pond-data-table {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
}
.pond-data-table .table-header {
  display: flex;
  gap: 4px;
  padding: 4px 0;
  border-bottom: 1px solid #45475a;
  margin-bottom: 2px;
}
.pond-data-table .th {
  flex: 1;
  font-size: 10px;
  color: #6c7086;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0 4px;
}
.pond-data-table .table-row {
  display: flex;
  gap: 4px;
  align-items: center;
}
.pond-data-table .cell {
  flex: 1;
  font-size: 11px;
  padding: 4px 6px;
  color: #a6adc8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
