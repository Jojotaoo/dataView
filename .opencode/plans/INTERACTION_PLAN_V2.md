# 交互系统方案 V2：interactOverrides 架构

## 一、问题

当前 `setRequestParams` 直接修改 `component.request.requestParams.Params`，存在两个致命问题：

| 场景 | 问题 |
|------|------|
| 数据池（requestDataType=2） | `getRequestSource()` 返回池的 config，component 的 Params 被忽略 |
| 数据池改池 config | 所有引用该池的组件都会受影响 |

## 二、方案：interactOverrides

在 component 上新增 **运行时** 字段 `interactOverrides`，存储交互产生的参数覆盖。请求执行时 merge 进去，不修改原始 config。

```
Component {
  request: { requestParams: { Params: { city: '北京' } } }  // 原始配置，不动
  interactOverrides: { city: '哈尔滨' }                       // 交互覆盖层，运行时
}
```

请求合并时：
```
最终 Params = { ...originalParams, ...interactOverrides }
```

## 三、数据流

### 场景 1：直接 HTTP（requestDataType=1）

```
component.request.config:
  { requestUrl: '/api/data', requestParams: { Params: { city: '北京' } } }

component.interactOverrides:
  { city: '哈尔滨' }

mergeRequestConfig 合并后:
  params = { city: '北京', city: '哈尔滨' }  // overrides 覆盖同名 key
  → 请求: GET /api/data?city=哈尔滨
```

### 场景 2：数据池（requestDataType=2）

```
池 config（共享，不动）:
  { requestUrl: '/api/pond', requestParams: { Params: { token: 'abc' } } }

组件A interactOverrides:
  { city: '哈尔滨' }

组件B interactOverrides:
  （空）

组件C interactOverrides:
  { type: 'all' }

mergeRequestConfig 结果:
  组件A: params = { token: 'abc', city: '哈尔滨' }  ← 只影响A
  组件B: params = { token: 'abc' }                    ← 不受影响
  组件C: params = { token: 'abc', type: 'all' }      ← 只影响C
```

## 四、代码改动

### 4.1 types/component.ts — 新增字段

```ts
export interface CreateComponentType {
  // ... 已有字段
  request?: RequestConfigType
  interactOverrides?: Record<string, any>  // 新增：运行时交互覆盖，不序列化
}
```

### 4.2 useRequestMerge.ts — mergeRequestConfig 新增第 3 参数

```ts
export function mergeRequestConfig(
  componentConfig: RequestConfigType,
  globalConfig: RequestGlobalConfigType,
  interactOverrides?: Record<string, any>  // 新增
): MergedRequestConfig | null {
  if (componentConfig.requestDataType === 0) {
    return null
  }

  const url = resolveUrl(
    globalConfig.requestOriginUrl,
    componentConfig.requestUrl ?? ''
  )

  const headers = {
    ...globalConfig.requestHeader,
    ...(componentConfig.requestParams?.Header ?? {}),
  }

  // 合并：原始 Params + 交互覆盖
  const params = {
    ...(componentConfig.requestParams?.Params ?? {}),
    ...(interactOverrides ?? {}),
  }

  const body = getBodyByType(
    componentConfig.requestParamsBodyType ?? 'none',
    componentConfig.requestParams?.Body
  )

  const pollingInterval = componentConfig.requestInterval ?? globalConfig.requestInterval
  const pollingUnit = componentConfig.requestIntervalUnit ?? globalConfig.requestIntervalUnit

  return {
    url,
    method: componentConfig.requestHttpType ?? 'get',
    headers,
    params,
    body,
    polling: {
      interval: pollingInterval,
      unit: pollingUnit,
    },
  }
}
```

### 4.3 dashboard.ts — applyInteractAction 写 overrides

```ts
} else if (method === 'setRequestParams') {
  const target = findComponent(targetId)
  if (target) {
    if (!target.interactOverrides) target.interactOverrides = {}
    Object.assign(target.interactOverrides, value)
    // 不动 target.request
  }
} else if (method === 'clearOverrides') {
  const target = findComponent(targetId)
  if (target) target.interactOverrides = {}
}
```

### 4.4 DataFetchManager.vue — 监听 overrides + 传入 merge

```vue
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
const interactOverrides = computed(() => comp.value?.interactOverrides)  // 新增

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
        const merged = mergeRequestConfig(source, globalConfig.value, interactOverrides.value)  // 传入 overrides
        if (merged) {
          result = await doFetch(merged)
          setPondCache(pondId, result)
        }
      }
    } else {
      result = await executeRequest(source, globalConfig.value, interactOverrides.value)  // 传入 overrides
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
  // 新增：监听 interactOverrides 变化，触发重新请求
  watch(interactOverrides, handleConfigChange, { deep: true })
}
onUnmounted(stopPolling)
</script>
<template></template>
```

### 4.5 useRequestMerge.ts — executeRequest 支持 overrides

```ts
export async function executeRequest(
  config: RequestConfigType,
  globalConfig: RequestGlobalConfigType,
  interactOverrides?: Record<string, any>
): Promise<any | null> {
  if (config.requestDataType === 0) return null
  const merged = mergeRequestConfig(config, globalConfig, interactOverrides)
  if (!merged) return null
  return doFetch(merged)
}
```

### 4.6 useChartDataFetch.ts — options 支持 overrides（如仍使用）

```ts
export interface UseChartDataFetchOptions {
  // ... 已有
  interactOverrides?: Ref<Record<string, any>>
}

export function useChartDataFetch(options: UseChartDataFetchOptions) {
  // ... 已有逻辑
  async function fetchData() {
    // ... 已有逻辑
    const merged = mergeRequestConfig(config, globalConfig.value, options.interactOverrides?.value)
    // ...
  }
  // ...
}
```

## 五、涉及文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/types/component.ts` | 修改 | `CreateComponentType` 新增 `interactOverrides` |
| `src/composables/useRequestMerge.ts` | 修改 | `mergeRequestConfig` 新增第 3 参数；`executeRequest` 新增第 3 参数 |
| `src/stores/dashboard.ts` | 修改 | `setRequestParams` 改写 `interactOverrides`；新增 `clearOverrides` |
| `src/components/charts/DataFetchManager.vue` | 修改 | 新增 `interactOverrides` computed + watcher + fetchData 传入 |
| `src/composables/useChartDataFetch.ts` | 修改 | options 新增 `interactOverrides`，mergeRequestConfig 传入 |

## 六、为什么不影响其他组件

```
池 config:  { token: 'abc' }              ← 共享，不动
组件A overrides: { city: '哈尔滨' }        ← 只在 A 的 fetchData 中 merge
组件B overrides: （空）                     ← B 的 fetchData 不 merge
组件C overrides: { type: 'all' }           ← 只在 C 的 fetchData 中 merge

mergeRequestConfig(池config, globalConfig, A.interactOverrides)
  → params = { token: 'abc', city: '哈尔滨' }  ← 只影响A

mergeRequestConfig(池config, globalConfig, B.interactOverrides)
  → params = { token: 'abc' }                    ← B不受影响

mergeRequestConfig(池config, globalConfig, C.interactOverrides)
  → params = { token: 'abc', type: 'all' }      ← 只影响C
```

## 七、额外设计

### 清除交互参数

新增 `clearOverrides` 方法：

```ts
} else if (method === 'clearOverrides') {
  const target = findComponent(targetId)
  if (target) target.interactOverrides = {}
}
```

InteractionPanel 的「执行动作」select 中添加选项：

```html
<option value="clearOverrides">清除交互参数</option>
```

### 序列化

`interactOverrides` 不序列化到 Schema（运行时状态），和 `interactFilters` 一样。

`SchemaPanel.vue` 和 `App.vue` 的 previewSchema 中不包含 `interactOverrides`。

### 默认 interactActions

更新 `componentDefinitions.ts` 中的默认 interactActions，将 `setRequestParams` 保留，新增 `clearOverrides`：

```ts
const chartInteractActions: InteractActionItem[] = [
  { interactType: 'setFilter', interactName: '数据筛选', componentEmitEvents: {} },
  { interactType: 'clearFilter', interactName: '清除筛选', componentEmitEvents: {} },
  { interactType: 'setRequestParams', interactName: '修改请求参数', componentEmitEvents: {} },
  { interactType: 'clearOverrides', interactName: '清除交互参数', componentEmitEvents: {} },
  { interactType: 'setData', interactName: '设置数据', componentEmitEvents: {} },
]
```

### InteractionPanel 更新

「执行动作」select 中添加：

```html
<option value="clearOverrides">清除交互参数</option>
```

`syncInteractFn` 中添加：

```ts
} else if (method === 'clearOverrides') {
  item.interactFn = { clearOverrides: '' }
}
```
