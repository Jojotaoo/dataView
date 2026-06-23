import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'
import type { RequestConfigType, RequestGlobalConfigType } from '../types'
import { mergeRequestConfig, executeFilter } from './useRequestMerge'
import { startPolling, stopPolling } from './usePollingManager'
import {
  initPond,
  subscribePond,
  unsubscribePond,
} from './useDataPondManager'

export interface UseChartDataFetchOptions {
  componentKey: Ref<string>
  request: Ref<RequestConfigType | undefined>
  globalConfig: Ref<RequestGlobalConfigType>
  filter: Ref<string | undefined>
  onDataSet: (data: any) => void
  httpClient?: (config: any) => Promise<any>
  interactOverrides?: Ref<Record<string, any> | undefined>
}

function defaultHttpClient(config: any): Promise<any> {
  return fetch(config.url, {
    method: config.method?.toUpperCase() ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
    body: config.data ? JSON.stringify(config.data) : undefined,
  }).then((res) => res.json())
}

export function useChartDataFetch(options: UseChartDataFetchOptions) {
  const {
    componentKey,
    request,
    globalConfig,
    filter,
    onDataSet,
    httpClient = defaultHttpClient,
  } = options

  const loading = ref(false)
  const error = ref<Error | null>(null)
  const lastResponse = ref<any>(null)

  let pollingKey = ''

  async function fetchData() {
    if (!request.value) return

    const config = request.value

    if (config.requestDataType === 0) {
      return
    }

    if (config.requestDataType === 2) {
      return
    }

    loading.value = true
    error.value = null

    try {
      const merged = mergeRequestConfig(config, globalConfig.value, options.interactOverrides?.value)
      if (!merged) {
        loading.value = false
        return
      }

      const response = await httpClient({
        url: merged.url,
        method: merged.method,
        headers: merged.headers,
        params: merged.params,
        data: merged.body,
      })

      const responseData = response?.data ?? response
      lastResponse.value = response

      const filteredData = executeFilter(responseData, response, filter.value ?? null)
      onDataSet(filteredData)
    } catch (err) {
      error.value = err as Error
      console.error(`[ChartDataFetch] Request failed for "${componentKey.value}":`, err)
    } finally {
      loading.value = false
    }
  }

  function startPollingIfNeeded() {
    if (!request.value || request.value.requestDataType !== 1) return
    if (!request.value.requestInterval) return

    pollingKey = `chart-${componentKey.value}`
    const interval = request.value.requestInterval
    const unit = request.value.requestIntervalUnit ?? 'second'

    startPolling(pollingKey, fetchData, interval, unit)
  }

  function stopPollingIfNeeded() {
    if (pollingKey) {
      stopPolling(pollingKey)
      pollingKey = ''
    }
  }

  function initPondMode() {
    if (!request.value || request.value.requestDataType !== 2) return
    if (!request.value.requestDataPondId) return

    const pondId = request.value.requestDataPondId
    initPond({ dataPondId: pondId, dataPondName: '', dataPondRequestConfig: request.value })

    subscribePond(pondId, componentKey.value, (data) => {
      const filteredData = executeFilter(data, data, filter.value ?? null)
      onDataSet(filteredData)
    })
  }

  function cleanupPondMode() {
    if (!request.value || request.value.requestDataType !== 2) return
    if (!request.value.requestDataPondId) return

    unsubscribePond(request.value.requestDataPondId, componentKey.value)
  }

  function handleConfigChange() {
    stopPollingIfNeeded()
    cleanupPondMode()

    if (!request.value) return

    if (request.value.requestDataType === 0) {
      return
    }

    if (request.value.requestDataType === 1) {
      fetchData()
      startPollingIfNeeded()
    } else if (request.value.requestDataType === 2) {
      initPondMode()
    }
  }

  onMounted(() => {
    handleConfigChange()
  })

  onUnmounted(() => {
    stopPollingIfNeeded()
    cleanupPondMode()
  })

  watch(request, handleConfigChange, { deep: true })
  watch(globalConfig, handleConfigChange, { deep: true })
  watch(filter, () => {
    if (lastResponse.value && request.value?.requestDataType === 1) {
      const filteredData = executeFilter(
        lastResponse.value?.data ?? lastResponse.value,
        lastResponse.value,
        filter.value ?? null
      )
      onDataSet(filteredData)
    }
  })

  return {
    loading,
    error,
    lastResponse,
    refresh: fetchData,
  }
}
