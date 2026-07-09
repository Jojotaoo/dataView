<template>
  <div class="panel-content">
    <div class="section-title">请求域名</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">Base URL</label>
        <input type="text" class="prop-input" placeholder="https://api.example.com" :value="store.requestGlobalConfig.requestOriginUrl" @input="updateRequestGlobal('requestOriginUrl', ($event.target as HTMLInputElement).value)" />
      </div>
    </div>

    <div class="section-title">轮询配置</div>
    <div class="prop-form">
      <div class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">轮询间隔</label>
          <input type="number" class="prop-input" :value="store.requestGlobalConfig.requestInterval" @input="updateRequestGlobal('requestInterval', Number(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">时间单位</label>
          <select class="prop-select" :value="store.requestGlobalConfig.requestIntervalUnit" @change="updateRequestGlobal('requestIntervalUnit', ($event.target as HTMLSelectElement).value)">
            <option value="second">秒</option>
            <option value="minute">分</option>
            <option value="hour">时</option>
            <option value="day">天</option>
          </select>
        </div>
      </div>
    </div>

    <div class="section-title">全局请求头</div>
    <div class="prop-form">
      <div v-for="(val, key, idx) in store.requestGlobalConfig.requestHeader" :key="'qh-' + idx" class="kv-row">
        <input type="text" class="prop-input kv-key" placeholder="key" :value="key" @input="updateHeaderKey(idx, ($event.target as HTMLInputElement).value)" />
        <input type="text" class="prop-input kv-val" placeholder="value" :value="val" @input="updateHeaderValue(idx, ($event.target as HTMLInputElement).value)" />
        <button class="kv-remove" @click="removeHeader(key)">✕</button>
      </div>
      <button class="add-btn" @click="addHeader">+ 添加请求头</button>
    </div>

    <div class="section-title">数据池管理</div>
    <div class="prop-form">
      <div v-if="store.requestGlobalConfig.requestDataPond.length === 0" class="empty-hint">
        暂无数据池，请添加数据池以实现多组件共享请求
      </div>
      <div v-for="pond in store.requestGlobalConfig.requestDataPond" :key="pond.dataPondId" class="pond-item">
        <div class="pond-info">
          <span class="pond-name">{{ pond.dataPondName }}</span>
          <span class="pond-url">{{ pond.dataPondRequestConfig.requestUrl }}</span>
        </div>
        <div class="pond-actions">
          <button class="pond-btn send" :disabled="pondLoading[pond.dataPondId]" @click="sendPondRequest(pond)">
            {{ pondLoading[pond.dataPondId] ? '请求中...' : '发送请求' }}
          </button>
          <button class="pond-btn" @click="editPond(pond)">编辑</button>
          <button class="pond-btn danger" @click="deletePond(pond.dataPondId)">删除</button>
        </div>
        <div v-if="pondError[pond.dataPondId]" class="pond-error">{{ pondError[pond.dataPondId] }}</div>
        <div v-if="pondResponse[pond.dataPondId]" class="pond-data-table">
          <div class="table-header">
            <span v-for="(dim, di) in getTableData(pond.dataPondId).dimensions" :key="di" class="th">{{ dim }}</span>
          </div>
          <div v-for="(row, ri) in getTableData(pond.dataPondId).source" :key="ri" class="table-row">
            <span v-for="(cell, ci) in row" :key="ci" class="cell">{{ cell }}</span>
          </div>
        </div>
      </div>
      <button class="add-btn" @click="showModal = true">+ 添加数据池</button>
    </div>

    <DataPondModal
      v-model:visible="showModal"
      :editItem="editingPond"
      @confirm="handlePondConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'
import type { DataPondItem } from '../../types'
import { executeRequest } from '../../composables/useRequestMerge'
import DataPondModal from './DataPondModal.vue'

const store = useDashboardStore()

const showModal = ref(false)
const editingPond = ref<DataPondItem | null>(null)

const pondLoading = ref<Record<string, boolean>>({})
const pondResponse = ref<Record<string, any>>({})
const pondError = ref<Record<string, string | null>>({})

async function sendPondRequest(pond: DataPondItem) {
  const id = pond.dataPondId
  pondLoading.value[id] = true
  pondError.value[id] = null
  pondResponse.value[id] = null
  try {
    const result = await executeRequest(pond.dataPondRequestConfig, store.requestGlobalConfig)
    pondResponse.value[id] = result
  } catch (err: any) {
    pondError.value[id] = err?.message || '请求失败'
  } finally {
    pondLoading.value[id] = false
  }
}

function getTableData(pondId: string) {
  const data = pondResponse.value[pondId]
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

function updateRequestGlobal(key: string, value: any) {
  store.updateRequestGlobalConfig({ [key]: value })
}

function updateHeaderKey(idx: number, newKey: string) {
  const header = store.requestGlobalConfig.requestHeader
  const keys = Object.keys(header)
  if (keys[idx] !== undefined) {
    const oldKey = keys[idx]
    if (oldKey === newKey) return
    header[newKey] = header[oldKey]
    delete header[oldKey]
  }
}

function updateHeaderValue(idx: number, value: string) {
  const header = store.requestGlobalConfig.requestHeader
  const keys = Object.keys(header)
  if (keys[idx] !== undefined) {
    header[keys[idx]] = value
  }
}

function addHeader() {
  const header = store.requestGlobalConfig.requestHeader
  header[`header_${Object.keys(header).length + 1}`] = ''
}

function removeHeader(key: string) {
  const header = store.requestGlobalConfig.requestHeader
  delete header[key]
}

function editPond(pond: DataPondItem) {
  editingPond.value = pond
  showModal.value = true
}

function deletePond(id: string) {
  store.removeDataPond(id)
}

function handlePondConfirm(item: DataPondItem) {
  if (editingPond.value) {
    store.updateDataPond(item.dataPondId, item)
    editingPond.value = null
  } else {
    store.addDataPond(item)
  }
}
</script>

<style scoped>
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #89b4fa;
  margin: 16px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #313244;
  user-select: none;
}
.section-title:first-child { margin-top: 0; }
.prop-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.prop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
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
.prop-input {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.prop-input:focus { border-color: #89b4fa; }
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
.kv-row { display: flex; gap: 4px; align-items: center; }
.kv-key { flex: 2; font-size: 11px; }
.kv-val { flex: 3; font-size: 11px; }
.kv-remove {
  flex: 0 0 22px;
  height: 22px;
  background: none;
  border: none;
  color: #6c7086;
  cursor: pointer;
  font-size: 10px;
  border-radius: 4px;
  transition: all 0.15s;
}
.kv-remove:hover { background: #f38ba8; color: #1e1e2e; }
.add-btn {
  padding: 4px 8px;
  background: #313244;
  border: 1px dashed #45475a;
  border-radius: 4px;
  color: #6c7086;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.add-btn:hover {
  background: #45475a;
  color: #cdd6f4;
  border-color: #89b4fa;
}
.empty-hint {
  font-size: 11px;
  color: #6c7086;
  text-align: center;
  padding: 12px 0;
}
.pond-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  background: #313244;
  border-radius: 6px;
  border: 1px solid #45475a;
}
.pond-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}
.pond-name {
  font-size: 12px;
  color: #cdd6f4;
  font-weight: 500;
}
.pond-url {
  font-size: 10px;
  color: #6c7086;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pond-actions {
  display: flex;
  gap: 4px;
}
.pond-btn {
  padding: 2px 8px;
  background: #45475a;
  border: none;
  border-radius: 4px;
  color: #cdd6f4;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.pond-btn:hover {
  background: #585b70;
}
.pond-btn.danger {
  color: #f38ba8;
}
.pond-btn.send {
  color: #89b4fa;
}
.pond-btn.send:hover {
  background: #89b4fa;
  color: #1e1e2e;
}
.pond-btn.send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #45475a;
  color: #6c7086;
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
