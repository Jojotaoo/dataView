import { reactive } from 'vue'
import type { DataPondItem, RequestGlobalConfigType } from '../types'
import { mergeRequestConfig } from './useRequestMerge'

interface PondState {
  config: DataPondItem
  subscribers: Set<string>
  lastResponse: any
  loading: boolean
  error: Error | null
}

const pondMap = new Map<string, PondState>()

type PondEventHandler = (data: any) => void

const eventHandlers = new Map<string, Map<string, PondEventHandler>>()

export function subscribePond(
  pondId: string,
  componentKey: string,
  handler: PondEventHandler
): void {
  let state = pondMap.get(pondId)
  if (!state) return

  state.subscribers.add(componentKey)

  if (!eventHandlers.has(pondId)) {
    eventHandlers.set(pondId, new Map())
  }
  eventHandlers.get(pondId)!.set(componentKey, handler)

  if (state.lastResponse !== undefined) {
    handler(state.lastResponse)
  }
}

export function unsubscribePond(pondId: string, componentKey: string): void {
  const state = pondMap.get(pondId)
  if (state) {
    state.subscribers.delete(componentKey)
  }

  const handlers = eventHandlers.get(pondId)
  if (handlers) {
    handlers.delete(componentKey)
    if (handlers.size === 0) {
      eventHandlers.delete(pondId)
    }
  }
}

export function initPond(pond: DataPondItem): void {
  if (!pondMap.has(pond.dataPondId)) {
    pondMap.set(pond.dataPondId, reactive({
      config: pond,
      subscribers: new Set(),
      lastResponse: undefined,
      loading: false,
      error: null,
    }))
  }
}

export function removePond(pondId: string): void {
  pondMap.delete(pondId)
  eventHandlers.delete(pondId)
}

export function dispatchPondData(pondId: string, data: any): void {
  const state = pondMap.get(pondId)
  if (state) {
    state.lastResponse = data
    state.loading = false
    state.error = null
  }

  const handlers = eventHandlers.get(pondId)
  if (handlers) {
    handlers.forEach((handler) => {
      try {
        handler(data)
      } catch (error) {
        console.error(`[DataPond] Error in handler for pond "${pondId}":`, error)
      }
    })
  }
}

export async function fetchPondData(
  pondId: string,
  globalConfig: RequestGlobalConfigType,
  httpClient: (config: any) => Promise<any>
): Promise<any> {
  const state = pondMap.get(pondId)
  if (!state || state.subscribers.size === 0) return null

  if (state.loading) return state.lastResponse

  state.loading = true
  state.error = null

  try {
    const merged = mergeRequestConfig(state.config.dataPondRequestConfig, globalConfig)
    if (!merged) {
      state.loading = false
      return null
    }

    const response = await httpClient({
      url: merged.url,
      method: merged.method,
      headers: merged.headers,
      params: merged.params,
      data: merged.body,
    })

    const responseData = response?.data ?? response
    dispatchPondData(pondId, responseData)
    return responseData
  } catch (error) {
    state.loading = false
    state.error = error as Error
    console.error(`[DataPond] Fetch failed for pond "${pondId}":`, error)
    throw error
  }
}

export function getPondState(pondId: string): PondState | undefined {
  return pondMap.get(pondId)
}

export function hasPond(pondId: string): boolean {
  return pondMap.has(pondId)
}

export function getSubscriberCount(pondId: string): number {
  return pondMap.get(pondId)?.subscribers.size ?? 0
}
