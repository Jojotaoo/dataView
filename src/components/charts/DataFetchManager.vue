<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'
import { mergeRequestConfig } from '../../composables/useRequestMerge'

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

async function fetchData() {
  const config = request.value
  if (!config || config.requestDataType !== 1) return

  const merged = mergeRequestConfig(config, globalConfig.value)
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
    store.updateComponentOption(props.componentId, 'dataset', data?.data ?? data)
  } catch (err) {
    console.error('[DataFetch] Request failed:', err)
  }
}

function startPolling() {
  stopPolling()
  const config = request.value
  if (!config || config.requestDataType !== 1) return

  const interval = config.requestInterval ?? globalConfig.value.requestInterval
  const unit = config.requestIntervalUnit ?? globalConfig.value.requestIntervalUnit ?? 'second'
  if (!interval) return

  const ms = toMilliseconds(interval, unit)
  pollingTimer = setInterval(fetchData, ms)
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
  if (props.mode === 'preview' && request.value?.requestDataType === 1) {
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
