<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'
import { mergeRequestConfig, executeRequest, doFetch, getPondCache, setPondCache, clearPondCache } from '../../composables/useRequestMerge'
import type { RequestConfigType } from '../../types'

const props = withDefaults(defineProps<{
  componentId: string
  mode?: 'design' | 'preview'
}>(), {
  mode: 'design',
})

const store = useDashboardStore()

const comp = computed(() => store.findComponent(props.componentId))
const request = computed(() => comp.value?.request)
const globalConfig = computed(() => store.requestGlobalConfig)

let pollingTimer: ReturnType<typeof setInterval> | null = null

function getRequestSource(): RequestConfigType | null {
  const config = request.value
  if (!config) return null
  if (config.requestDataType === 1) return config
  if (config.requestDataType === 2 && config.requestDataPondId) {
    const pond = globalConfig.value.requestDataPond.find(p => p.dataPondId === config.requestDataPondId)
    return pond?.dataPondRequestConfig ?? null
  }
  return null
}

function getPondId(): string | null {
  return request.value?.requestDataType === 2 ? (request.value.requestDataPondId ?? null) : null
}

async function fetchData(isPolling = false) {
  const config = request.value
  if (!config || config.requestDataType === 0) return

  const source = getRequestSource()
  if (!source || source.requestDataType === 0) return

  try {
    const pondId = getPondId()
    let result: any | null = null

    if (pondId) {
      if (isPolling) clearPondCache(pondId)
      const cached = getPondCache(pondId)
      if (cached !== undefined) {
        result = cached
      } else {
        const merged = mergeRequestConfig(source, globalConfig.value)
        if (merged) {
          result = await doFetch(merged)
          setPondCache(pondId, result)
        }
      }
    } else {
      result = await executeRequest(source, globalConfig.value)
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

function handleConfigChange() {
  stopPolling()
  if (props.mode === 'preview' && request.value && request.value.requestDataType !== 0) {
    fetchData()
    startPolling()
  }
}

if (props.mode === 'preview') {
  onMounted(handleConfigChange)
  watch(request, handleConfigChange, { deep: true })
  watch(globalConfig, handleConfigChange, { deep: true })
}
onUnmounted(stopPolling)
</script>
<template></template>
