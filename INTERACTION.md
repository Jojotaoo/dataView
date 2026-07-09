# 组件交互系统架构设计

## 一、场景

地图点击"哈尔滨" → 柱状图/折线图/饼图/文本组件自动筛选"哈尔滨"的数据。未来支持更多交互方式。

## 二、核心思路

采用 **Composable（Hook）** 模式，两个 hook 分别负责派发和消费，组件只调用一行代码，逻辑零耦合。

- `useInteractDispatch` — 源组件调用，派发交互事件
- `useInteractFilter` — 目标组件调用，过滤数据

## 三、数据流

### 场景 A：本地数据筛选

```
用户点击地图"哈尔滨"
  → MapChart: dispatch('click', { name: '哈尔滨' })
    → useInteractDispatch 读取 events.interactEvents 配置
      → 找到目标组件 ID + interactFn 表达式
        → store.applyInteractAction(targetId, 'setFilter', { region: '哈尔滨' })
          → store.interactFilters[targetId] = { region: '哈尔滨' }
            → BarChart: useInteractFilter 监听 filters 变化
              → 过滤 option.dataset.source → 返回 filteredSource
                → 图表重新渲染
```

### 场景 B：触发请求参数变更并重新拉取

```
用户点击地图"哈尔滨"
  → MapChart: dispatch('click', { name: '哈尔滨' })
    → store.applyInteractAction(targetId, 'setRequestParams', { city: '哈尔滨' })
      → 修改 target.request.requestParams.Params = { city: '哈尔滨' }
        → DataFetchManager/watcher 检测到 request 变化
          → 自动重新发起 HTTP 请求（带上新参数）
            → 数据返回 → 图表更新
```

> 关键：`useChartDataFetch.ts:156` 和 `DataFetchManager.vue:115` 已有 `watch(request, handleConfigChange, { deep: true })`，只需修改 request 配置，现有 watcher 自动触发重新拉取。

## 四、Composable 设计

### 4.1 useInteractDispatch（源组件调用）

```ts
// composables/useInteractDispatch.ts
import { type Ref } from 'vue'
import { useDashboardStore } from '../stores/dashboard'

export function useInteractDispatch(componentId: Ref<string>) {
  const store = useDashboardStore()

  function dispatch(eventName: string, params: any) {
    const comp = store.findComponent(componentId.value)
    if (!comp?.events?.interactEvents) return

    const matches = comp.events.interactEvents.filter(e => e.interactOn === eventName)
    for (const match of matches) {
      const target = store.findComponent(match.interactComponentId)
      if (!target) continue

      for (const [method, expr] of Object.entries(match.interactFn)) {
        // 支持简写：值在 params 中直接取，否则求值表达式
        const value = expr in params ? params[expr] : evalExpr(expr, params)
        store.applyInteractAction(target.id, method, value)
      }
    }
  }

  function evalExpr(expr: string, params: any): any {
    try {
      return new Function('params', `return ${expr}`)(params)
    } catch {
      return expr
    }
  }

  return { dispatch }
}
```

**使用示例（MapChart）：**
```ts
const { dispatch } = useInteractDispatch(toRef(props, 'componentId'))

function handleMapClick(params: any) {
  // ... 原有 zoom 逻辑 ...
  dispatch('click', { name: params.name, value: params.value })
}
```

### 4.2 useInteractFilter（目标组件调用）

```ts
// composables/useInteractFilter.ts
import { type Ref, computed } from 'vue'
import { useDashboardStore } from '../stores/dashboard'

export function useInteractFilter(
  componentId: Ref<string>,
  dimensions: Ref<string[]>,
  source: Ref<any[][]>
) {
  const store = useDashboardStore()

  const filteredSource = computed(() => {
    const filters = store.interactFilters[componentId.value]
    if (!filters || Object.keys(filters).length === 0) return source.value

    return source.value.filter(row => {
      return Object.entries(filters).every(([key, value]) => {
        const colIndex = dimensions.value.indexOf(key)
        if (colIndex === -1) return true
        return String(row[colIndex]) === String(value)
      })
    })
  })

  return { filteredSource }
}
```

**使用示例（BarChart）：**
```ts
const dimensions = computed(() => optionRef.value.dataset?.dimensions ?? [])
const source = computed(() => optionRef.value.dataset?.source ?? [])

const { filteredSource } = useInteractFilter(
  toRef(props, 'componentId'),
  dimensions,
  source
)

// 将 filteredSource 传给 useECharts 或 seriesOption
```

## 五、Store 新增

```ts
// stores/dashboard.ts 新增

// 运行时交互筛选状态（不序列化，仅运行时存在）
const interactFilters = ref<Record<string, Record<string, any>>>({})

function applyInteractAction(targetId: string, method: string, value: any) {
  if (method === 'setFilter') {
    // value = { region: '哈尔滨' } 或单值简写
    if (typeof value === 'object' && value !== null) {
      interactFilters.value[targetId] = {
        ...interactFilters.value[targetId],
        ...value,
      }
    } else {
      // 简写：setFilter: '哈尔滨' → 使用 _primary key
      interactFilters.value[targetId] = {
        ...interactFilters.value[targetId],
        _primary: value,
      }
    }
  } else if (method === 'setData') {
    const target = findComponent(targetId)
    if (target) target.option.dataset = value
  } else if (method === 'clearFilter') {
    delete interactFilters.value[targetId]
  } else if (method === 'setRequestParams') {
    // value = { city: '哈尔滨', type: 'all' }
    // 修改目标组件的请求参数，现有 watcher 会自动触发重新拉取
    const target = findComponent(targetId)
    if (target?.request?.requestParams) {
      target.request.requestParams.Params = {
        ...target.request.requestParams.Params,
        ...value,
      }
    }
  } else if (method === 'setRequestUrl') {
    // value = '/api/new-endpoint'
    // 修改目标组件的请求 URL，现有 watcher 会自动触发重新拉取
    const target = findComponent(targetId)
    if (target?.request) {
      target.request.requestUrl = value
    }
  }
}

function clearInteractFilters(targetId?: string) {
  if (targetId) {
    delete interactFilters.value[targetId]
  } else {
    interactFilters.value = {}
  }
}
```

## 六、Schema 兼容性

完全复用现有 schema 字段，无需新增：

| Schema 字段 | 位置 | 用途 |
|-------------|------|------|
| `events.interactEvents` | §4.7.3 | 源组件声明：触发事件、目标组件、调用方法 |
| `interactActions` | §4.8 | 目标组件声明：可提供的交互类型和事件列表 |
| `interactFn` | interactEvents 内 | 方法调用表达式，`params` 为事件参数 |

### Schema 配置示例

**源组件（地图）的 events.interactEvents：**
```json
[
  {
    "interactOn": "click",
    "interactComponentId": "bar-chart-uuid",
    "interactFn": { "setFilter": "name" }
  },
  {
    "interactOn": "click",
    "interactComponentId": "line-chart-uuid",
    "interactFn": { "setFilter": "name" }
  }
]
```

**触发请求参数变更的 interactFn 配置：**
```json
{
  "interactOn": "click",
  "interactComponentId": "bar-chart-uuid",
  "interactFn": { "setRequestParams": "{ city: params.name }" }
}
```

**目标组件（柱状图）的 interactActions：**
```json
[
  {
    "interactType": "setFilter",
    "interactName": "数据筛选",
    "componentEmitEvents": {
      "setFilter": [
        { "value": "region", "label": "按地区筛选" },
        { "value": "category", "label": "按类别筛选" }
      ]
    }
  }
]
```

## 七、涉及文件

| 文件 | 改动 |
|------|------|
| `src/composables/useInteractDispatch.ts` | **新建**，交互派发 hook |
| `src/composables/useInteractFilter.ts` | **新建**，数据过滤 hook |
| `src/stores/dashboard.ts` | 新增 `interactFilters`、`applyInteractAction`、`clearInteractFilters` |
| `src/composables/useChartDataFetch.ts` | 已有 `watch(request)` 自动触发重新拉取，无需修改 |
| `src/components/charts/DataFetchManager.vue` | 已有 `watch(request)` 自动触发重新拉取，无需修改 |
| `src/components/charts/MapChart.vue` | 调用 `dispatch('click', params)` — 2 行 |
| `src/components/charts/BarChart.vue` | 使用 `useInteractFilter` — 3 行 |
| `src/components/charts/LineChart.vue` | 同上 |
| `src/components/charts/PieChart.vue` | 同上 |
| `src/components/charts/TextDisplay.vue` | 使用 `useInteractFilter` — 2 行 |

## 八、扩展性

未来新增交互类型只需：
1. 在源组件中调用 `dispatch('newEvent', payload)`
2. 在目标组件中使用 `useInteractFilter` 订阅

不需要修改 store 或其他组件。支持的交互方法：
- `setFilter` — 本地数据筛选
- `setRequestParams` — 修改请求参数并自动重新拉取
- `setRequestUrl` — 修改请求 URL 并自动重新拉取
- `setData` — 直接设置数据
- `clearFilter` — 清除筛选


问题1: 整个技术方案不行，如果一个组件是请求池的远程数据，目前修改器请求参数不会合并到请求吃中，但是如果就算是请求池中加入了参数，就会出现所有引用整个请求池的数据都会发生变化