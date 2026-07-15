<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch, inject } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'
import {
  mergeRequestConfig,
  executeRequest,
  doFetch,
  getPondCache,
  setPondCache,
  clearPondCache,
  resolveUrl,
} from '../../composables/useRequestMerge'
import { fetchDatasetResult } from '../../services/datasetService'
import type { RequestConfigType, DatasetConfig } from '../../types'

const props = withDefaults(
  defineProps<{
    componentId: string
    mode?: 'design' | 'preview'
  }>(),
  {
    mode: 'design',
  },
)

const store = useDashboardStore()

const comp = computed(() => store.findComponent(props.componentId))
const request = computed(() => comp.value?.request)
const globalConfig = computed(() => store.requestGlobalConfig)
const interactOverrides = computed(() => comp.value?.interactOverrides)

// mock 模式：由上层 provide 注入 datasetResolver；server 模式不使用
const datasetResolver = inject<(id: string) => DatasetConfig | undefined>('datasetResolver')

// 数据集按 datasetId 去重（仿 Pond）
const datasetCache = new Map<string, any>()

let pollingTimer: ReturnType<typeof setInterval> | null = null
let fetchSeq = 0

function getRequestSource(): RequestConfigType | null {
  const config = request.value
  if (!config) return null
  if (config.requestDataType === 1) return config
  if (config.requestDataType === 2 && config.requestDataPondId) {
    const pond = globalConfig.value.requestDataPond.find((p) => p.dataPondId === config.requestDataPondId)
    return pond?.dataPondRequestConfig ?? null
  }
  return null
}

function getPondId(): string | null {
  return request.value?.requestDataType === 2 ? (request.value.requestDataPondId ?? null) : null
}

async function fetchDataset() {
  const config = request.value
  if (!config || config.requestDataType !== 3 || !config.requestDatasetId) return
  const id = config.requestDatasetId

  if (datasetCache.has(id)) {
    store.updateComponentOption(props.componentId, 'dataset', datasetCache.get(id)!)
    return
  }

  try {
    const ds = await fetchDatasetResult(id, {
      mode: globalConfig.value.datasetMode,
      requestOriginUrl: globalConfig.value.requestOriginUrl,
      resolve: datasetResolver,
    })
    datasetCache.set(id, ds)
    store.updateComponentOption(props.componentId, 'dataset', ds)
  } catch (err) {
    console.error('[DataFetch] dataset request failed:', err)
  }
}

async function fetchData(isPolling = false, forceFresh = false) {
  const config = request.value
  if (!config || config.requestDataType === 0) return
  if (config.requestDataType === 3) {
    await fetchDataset()
    return
  }

  const source = getRequestSource()
  if (!source || source.requestDataType === 0) return

  try {
    const pondId = getPondId()
    let result: any | null = null

    if (pondId) {
      if (isPolling || forceFresh) clearPondCache(pondId)
      const cached = getPondCache(pondId)
      if (cached !== undefined && !forceFresh) {
        result = cached
      } else {
        const merged = mergeRequestConfig(source, globalConfig.value, interactOverrides.value)
        if (merged) {
          result = await doFetch(merged)
          setPondCache(pondId, result)
        }
      }
    } else {
      result = await executeRequest(source, globalConfig.value, interactOverrides.value)
    }

    if (result !== null) {
      store.updateComponentOption(props.componentId, 'dataset', result)
    }
  } catch (err) {
    console.error('[DataFetch] Request failed:', err)
  }
}

function startPolling() {
  stopPolling()
  const config = request.value
  if (!config || config.requestDataType === 0) return

  const source = getRequestSource()
  if (!source) return

  const interval = source.requestInterval ?? globalConfig.value.requestInterval
  const unit = source.requestIntervalUnit ?? globalConfig.value.requestIntervalUnit ?? 'second'
  if (!interval) return

  const ms = toMilliseconds(interval, unit)
  pollingTimer = setInterval(() => fetchData(true), ms)
}

function stopPolling() {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
  }
}

function toMilliseconds(interval: number, unit: string): number {
  const map: Record<string, number> = {
    second: 1000,
    minute: 60 * 1000,
    hour: 3600 * 1000,
    day: 86400 * 1000,
  }
  return interval * (map[unit] ?? 1000)
}

async function handleConfigChange() {
  stopPolling()
  if (props.mode === 'preview' && request.value && request.value.requestDataType !== 0) {
    const seq = ++fetchSeq
    await fetchData(false, true)
    if (seq !== fetchSeq) return
    startPolling()
  }
}

if (props.mode === 'preview') {
  onMounted(handleConfigChange)
  watch(request, handleConfigChange, { deep: true })
  watch(globalConfig, handleConfigChange, { deep: true })
  watch(interactOverrides, handleConfigChange, { deep: true })
}
onUnmounted(stopPolling)
</script>
<template></template>
