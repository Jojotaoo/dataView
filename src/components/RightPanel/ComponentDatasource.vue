<template>
  <div class="panel-content">
    <ComponentRequestConfig
      v-if="comp.request"
      :request="comp.request"
      :dataset="comp.option.dataset"
      @update="updateRequest"
      @updateDatasetDimension="updateDimension"
      @updateDatasetCell="updateSourceCell"
      @addDatasetRow="addSourceRow"
      @removeDatasetRow="removeSourceRow"
      @testRequest="handleTestRequest"
    />
    <div v-else class="empty-hint">暂无请求配置</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'
import type { RequestConfigType } from '../../types'
import { mergeRequestConfig } from '../../composables/useRequestMerge'
import ComponentRequestConfig from './ComponentRequestConfig.vue'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

// ... existing functions ...

function updateRequest(request: Partial<RequestConfigType>) {
  if (!store.selectedComponent) return
  store.updateComponentRequest(store.selectedComponent.id, request)
}

function updateDimension(di: number, value: string) {
  if (!store.selectedComponent) return
  store.updateOptionDatasetDimension(store.selectedComponent.id, di, value)
}

function updateSourceCell(ri: number, ci: number, value: string) {
  if (!store.selectedComponent) return
  store.updateOptionDatasetCell(store.selectedComponent.id, ri, ci, value)
}

function addSourceRow() {
  if (!store.selectedComponent) return
  store.addOptionDatasetRow(store.selectedComponent.id)
}

function removeSourceRow(ri: number) {
  if (!store.selectedComponent) return
  store.removeOptionDatasetRow(store.selectedComponent.id, ri)
}

async function handleTestRequest() {
  if (!store.selectedComponent || !comp.value.request) return
  const merged = mergeRequestConfig(comp.value.request, store.requestGlobalConfig)
  if (!merged) return

  try {
    const queryString = Object.entries(merged.params)
      .filter(([, v]) => v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    const fullUrl = queryString ? `${merged.url}?${queryString}` : merged.url

    const fetchOptions: RequestInit = {
      method: merged.method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...merged.headers,
      },
    }
    if (merged.body !== undefined && merged.method.toLowerCase() !== 'get') {
      fetchOptions.body = typeof merged.body === 'object' ? JSON.stringify(merged.body) : String(merged.body)
    }

    const res = await fetch(fullUrl, fetchOptions)
    const data = await res.json()

    store.updateComponentOption(store.selectedComponent.id, 'dataset', data?.data ?? data)
  } catch (err) {
    console.error('[TestRequest] Failed:', err)
  }
}
</script>

<style scoped>
.panel-content {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
}
.empty-hint {
  font-size: 11px;
  color: #6c7086;
  text-align: center;
  padding: 12px 0;
}
</style>
