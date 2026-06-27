<template>
  <div class="panel-content">
    <ComponentRequestConfig
      v-if="comp.request"
      :request="comp.request"
      :dataset="comp.option.dataset"
      :pond-loading="pondLoading"
      :pond-response="pondResponse"
      :pond-error="pondError"
      @update="updateRequest"
      @updateDatasetDimension="updateDimension"
      @updateDatasetCell="updateSourceCell"
      @addDatasetRow="addSourceRow"
      @removeDatasetRow="removeSourceRow"
      @createDataset="createDataset"
      @testRequest="handleTestRequest"
    />
    <div v-else class="empty-hint">暂无请求配置</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'
import type { RequestConfigType } from '../../types'
import { executeRequest } from '../../composables/useRequestMerge'
import ComponentRequestConfig from './ComponentRequestConfig.vue'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

const pondLoading = ref<Record<string, boolean>>({})
const pondResponse = ref<Record<string, any>>({})
const pondError = ref<Record<string, string | null>>({})

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

function createDataset() {
  if (!store.selectedComponent) return
  store.updateComponentOption(store.selectedComponent.id, 'dataset', {
    dimensions: ['字段1', '字段2'],
    source: [['示例值1', '示例值2']],
  })
}

async function handleTestRequest() {
  if (!store.selectedComponent || !comp.value.request) return

  const config = comp.value.request
  let source: RequestConfigType | null = null
  let pondId = ''

  if (config.requestDataType === 1) {
    source = config
  } else if (config.requestDataType === 2 && config.requestDataPondId) {
    pondId = config.requestDataPondId
    const pond = store.requestGlobalConfig.requestDataPond.find(
      p => p.dataPondId === config.requestDataPondId
    )
    if (pond) source = pond.dataPondRequestConfig
  }

  if (!source) return

  const key = pondId || '__direct__'
  pondLoading.value[key] = true
  pondError.value[key] = null
  pondResponse.value[key] = null

  try {
    const result = await executeRequest(source, store.requestGlobalConfig)
    if (result !== null) {
      store.updateComponentOption(store.selectedComponent.id, 'dataset', result)
      pondResponse.value[key] = result
    }
  } catch (err: any) {
    pondError.value[key] = err?.message || '请求失败'
  } finally {
    pondLoading.value[key] = false
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
