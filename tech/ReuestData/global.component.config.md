# 全局配置 & 组件接口配置技术方案

> 适用于拖拽式数据可视化平台，实现全局请求配置与组件级请求配置的分层管理。

---

## 1. 整体架构

```
┌────────────────────────────────────────────────────────────────────┐
│                    GlobalRequestConfig (全局配置)                    │
│  requestOriginUrl / requestInterval / Headers / requestDataPond    │
└───────────────────────────┬────────────────────────────────────────┘
                            │
                mergeRequestConfig(component, global)
                            │
         ┌──────────────────┴──────────────────┐
         │ URL    = global.baseURL + component.path         │
         │ Headers = { ...global, ...component }            │
         │ Body    = component only                        │
         │ Polling = component ?? global                   │
         └─────────────────────────────────────────────────┘
```

### 设计原则

1. **全局配置**统一管理所有请求共享的域名（baseURL）和全局 Headers，组件级无法覆盖域名
2. **组件配置**管理每个图表自身的请求路径、方法、Body 和组件级 Headers，路径拼接到全局域名之后
3. **数据池**实现一次请求多组件共享，减少重复调用
4. **合并策略**：Headers 取全局+组件的并集（组件覆盖同名项），Body/Params 仅组件生效

---

## 2. 枚举定义

```typescript
// 数据源类型
enum RequestDataTypeEnum {
  STATIC = 0,   // 静态数据
  AJAX = 1,     // HTTP 请求
  POND = 2      // 数据池
}

// HTTP 方法
enum RequestHttpEnum {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete'
}

// 请求体类型
enum RequestBodyEnum {
  NONE = 'none',
  FORM_DATA = 'form-data',
  URL_ENCODED = 'x-www-form-urlencoded',
  JSON = 'json',
  XML = 'xml'
}

// 轮询间隔单位
enum PollingUnitEnum {
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day'
}
```

---

## 3. 类型定义

### 3.1 请求参数结构

```typescript
type RequestParams = {
  Header: Record<string, string>              // 请求头
  Params: Record<string, any>                 // URL 查询参数
  Body: {
    'form-data': Record<string, any>
    'x-www-form-urlencoded': Record<string, any>
    json: string
    xml: string
  }
}
```

### 3.2 全局配置

```typescript
interface GlobalRequestConfig {
  requestOriginUrl: string                    // baseURL 前缀
  requestInterval: number                     // 默认轮询间隔数值
  requestIntervalUnit: PollingUnitEnum        // 默认轮询单位
  requestParams: {
    Header: Record<string, string>            // 全局请求头
  }
  requestDataPond: DataPondItem[]             // 数据池条目
}
```

### 3.3 组件请求配置

```typescript
interface RequestConfigType {
  requestDataType: RequestDataTypeEnum        // 数据源类型
  requestHttpType: RequestHttpEnum            // HTTP 方法
  requestUrl: string                          // 请求路径
  requestParamsBodyType: RequestBodyEnum      // Body 类型
  requestInterval?: number                    // 轮询间隔（undefined 用全局）
  requestIntervalUnit: PollingUnitEnum        // 轮询单位
  requestParams: RequestParams                // 请求参数
  requestDataPondId?: string                  // 关联的数据池 ID
}
```

### 3.4 数据池条目

```typescript
interface DataPondItem {
  dataPondId: string                          // 唯一标识
  dataPondName: string                        // 显示名称
  dataPondRequestConfig: RequestConfigType    // 独立请求配置
}
```

### 3.5 合并后的请求配置

```typescript
interface MergedRequestConfig {
  url: string
  method: RequestHttpEnum
  headers: Record<string, string>
  params: Record<string, any>
  body: any
  polling: {
    interval: number
    unit: PollingUnitEnum
  } | null
}
```

---

## 4. 默认值设计

### 4.1 全局配置默认值

```typescript
const defaultGlobalConfig: GlobalRequestConfig = {
  requestOriginUrl: '',
  requestInterval: 30,
  requestIntervalUnit: PollingUnitEnum.SECOND,
  requestParams: {
    Header: {}
  },
  requestDataPond: []
}
```

### 4.2 组件配置默认值

```typescript
const defaultRequestConfig: RequestConfigType = {
  requestDataType: RequestDataTypeEnum.STATIC,  // 默认静态数据
  requestHttpType: RequestHttpEnum.GET,
  requestUrl: '',
  requestInterval: undefined,                    // undefined = 使用全局值
  requestIntervalUnit: PollingUnitEnum.SECOND,
  requestParamsBodyType: RequestBodyEnum.NONE,
  requestParams: {
    Header: {},
    Params: {},
    Body: {
      'form-data': {},
      'x-www-form-urlencoded': {},
      json: '',
      xml: ''
    }
  },
  requestDataPondId: undefined
}
```

### 4.3 创建组件时深拷贝

```typescript
function createComponentConfig(overrides?: Partial<RequestConfigType>): RequestConfigType {
  return merge({}, defaultRequestConfig, overrides)
}
```

---

## 5. 配置合并规则

### 5.1 合并函数实现

```typescript
function mergeRequestConfig(
  component: RequestConfigType,
  global: GlobalRequestConfig
): MergedRequestConfig | null {
  // 静态数据不发请求
  if (component.requestDataType === RequestDataTypeEnum.STATIC) {
    return null
  }

  // URL 拼接：全局域名（组件不可覆盖） + 组件路径
  const url = resolveUrl(global.requestOriginUrl, component.requestUrl)

  // Headers 合并：组件覆盖全局
  const headers = {
    ...global.requestParams.Header,
    ...component.requestParams.Header
  }

  // Query Params：仅组件
  const params = component.requestParams.Params

  // Body：仅组件，按类型取值
  const body = getBodyByType(component.requestParamsBodyType, component.requestParams.Body)

  // 轮询间隔：组件优先，否则用全局
  const polling = {
    interval: component.requestInterval ?? global.requestInterval,
    unit: component.requestIntervalUnit ?? global.requestIntervalUnit
  }

  return { url, method: component.requestHttpType, headers, params, body, polling }
}
```

### 5.2 URL 模板解析

```typescript
function resolveUrl(baseUrl: string, path: string, context?: Record<string, any>): string {
  // 支持模板字面量：/api/${chartId}/data
  if (context && path.includes('${')) {
    const template = `${baseUrl}${path}`
    const keys = Object.keys(context)
    const values = Object.values(context)
    return new Function(...keys, `return \`${template}\``)(...values)
  }
  return `${baseUrl}${path}`.replace(/\/+/g, '/')
}
```

### 5.3 Body 提取

```typescript
function getBodyByType(type: RequestBodyEnum, bodyConfig: RequestParams['Body']): any {
  switch (type) {
    case RequestBodyEnum.JSON:
      return JSON.parse(bodyConfig.json || '{}')
    case RequestBodyEnum.XML:
      return bodyConfig.xml
    case RequestBodyEnum.FORM_DATA:
      return bodyConfig['form-data']
    case RequestBodyEnum.URL_ENCODED:
      return bodyConfig['x-www-form-urlencoded']
    case RequestBodyEnum.NONE:
    default:
      return undefined
  }
}
```

### 5.4 合并规则汇总表

| 配置项 | 合并方式 | 说明 |
|--------|---------|------|
| **域名** | 仅全局 `requestOriginUrl` | 组件无法覆盖，组件 UI 中只读展示 |
| **请求路径** | 仅组件 `requestUrl` | 拼接到全局域名之后 |
| **Method** | 仅组件 `requestHttpType` | 组件独立配置 |
| **Headers** | `{ ...global.Header, ...component.Header }` | 组件覆盖全局同名项 |
| **Query Params** | 仅组件 | 全局不参与 |
| **Body** | 仅组件 | 全局 Body 字段虽定义但未使用 |
| **轮询间隔** | `component.requestInterval ?? global.requestInterval` | 组件优先 |

---

## 6. 数据池机制

### 6.1 数据池管理器

```typescript
class DataPondManager {
  private pondMap: Map<string, {
    config: DataPondItem
    subscribers: Set<string>        // 组件 key 集合
    lastResponse: any               // 缓存最近一次响应
    timer: ReturnType<typeof setInterval> | null
  }> = new Map()

  // 组件注册订阅
  subscribe(pondId: string, componentKey: string) {
    const pond = this.pondMap.get(pondId)
    if (pond) {
      pond.subscribers.add(componentKey)
    }
  }

  // 组件取消订阅
  unsubscribe(pondId: string, componentKey: string) {
    const pond = this.pondMap.get(pondId)
    if (pond) {
      pond.subscribers.delete(componentKey)
      if (pond.subscribers.size === 0) {
        this.clearPond(pondId)
      }
    }
  }

  // 请求并分发（一个 pondId 只发一次请求）
  async fetchAndDispatch(pondId: string, globalConfig: GlobalRequestConfig) {
    const pond = this.pondMap.get(pondId)
    if (!pond || pond.subscribers.size === 0) return

    const merged = mergeRequestConfig(pond.config.dataPondRequestConfig, globalConfig)
    if (!merged) return

    const response = await httpClient(merged)
    pond.lastResponse = response

    // 分发给所有订阅组件
    for (const componentKey of pond.subscribers) {
      eventBus.emit(`pond:${pondId}:${componentKey}`, response)
    }
  }
}
```

### 6.2 数据池流程

```
1. 全局配置面板创建数据池条目
   → 存入 GlobalRequestConfig.requestDataPond[]

2. 组件配置面板选择关联的数据池
   → component.request.requestDataPondId = pondId

3. 运行时组件初始化
   → 数据池管理器订阅该 pondId
   → 检查是否已有缓存响应
   → 无则发起请求，有则直接分发

4. 请求完成后
   → 结果缓存到 pond.lastResponse
   → 分发给所有订阅组件
   → 各组件独立执行 filter 函数转换

5. 组件卸载
   → 取消订阅
   → 若无订阅者则停止轮询并清除缓存
```

---

## 7. 请求合并函数完整实现

```typescript
async function executeRequest(
  componentConfig: RequestConfigType,
  globalConfig: GlobalRequestConfig,
  httpClient: HttpClient
): Promise<any> {
  // 1. 合并配置
  const merged = mergeRequestConfig(componentConfig, globalConfig)
  if (!merged) return null

  // 2. 发送请求
  try {
    const response = await httpClient({
      url: merged.url,
      method: merged.method,
      headers: merged.headers,
      params: merged.params,
      data: merged.body
    })
    return response.data
  } catch (error) {
    console.error(`[DataFetch] ${merged.method.toUpperCase()} ${merged.url} failed:`, error)
    throw error
  }
}
```

---

## 8. 轮询管理

```typescript
class PollingManager {
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map()

  start(
    key: string,
    callback: () => Promise<void>,
    interval: number,
    unit: PollingUnitEnum
  ) {
    this.stop(key)

    const ms = this.toMilliseconds(interval, unit)
    const timer = setInterval(async () => {
      await callback()
    }, ms)

    this.timers.set(key, timer)
  }

  stop(key: string) {
    const timer = this.timers.get(key)
    if (timer) {
      clearInterval(timer)
      this.timers.delete(key)
    }
  }

  stopAll() {
    this.timers.forEach((timer) => clearInterval(timer))
    this.timers.clear()
  }

  private toMilliseconds(interval: number, unit: PollingUnitEnum): number {
    const multipliers: Record<PollingUnitEnum, number> = {
      second: 1000,
      minute: 60 * 1000,
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000
    }
    return interval * multipliers[unit]
  }
}
```

---

## 9. 过滤函数执行器

```typescript
function executeFilter(
  responseData: any,
  fullResponse: any,
  filterFn: string | null
): any {
  if (!filterFn) return responseData

  try {
    const fn = new Function('data', 'res', filterFn)
    return fn(responseData, fullResponse)
  } catch (error) {
    console.error('[Filter] Execute filter function failed:', error)
    return responseData  // 出错时返回原始数据
  }
}
```

---

## 10. 实现清单

### 10.1 类型与常量

- [ ] 定义所有枚举（`RequestDataTypeEnum`、`RequestHttpEnum` 等）
- [ ] 定义 `RequestConfigType`、`GlobalRequestConfig`、`DataPondItem` 接口
- [ ] 定义默认值常量

### 10.2 状态管理

- [ ] 实现全局配置 Store（存储 `GlobalRequestConfig`）
- [ ] 实现组件配置创建函数（深拷贝默认值）
- [ ] 实现配置持久化（保存/加载）

### 10.3 配置合并

- [ ] 实现 `mergeRequestConfig()` 合并函数
- [ ] 实现 `resolveUrl()` URL 模板解析
- [ ] 实现 `getBodyByType()` Body 提取

### 10.4 数据池

- [ ] 实现 `DataPondManager` 管理器
- [ ] 实现订阅/取消订阅机制
- [ ] 实现请求去重和结果分发
- [ ] 实现轮询管理

### 10.5 请求层

- [ ] 封装 HTTP 客户端（支持多种 Body 类型）
- [ ] 实现请求/响应拦截器
- [ ] 实现错误处理和重试

### 10.6 数据获取

- [ ] 实现 `useChartDataFetch` hook
  - [ ] 静态数据：直接使用
  - [ ] AJAX：合并配置 → 请求 → filter → 赋值
  - [ ] 轮询管理（启动/停止/重置）
  - [ ] 参数变化监听
  - [ ] 卸载清理
- [ ] 实现 `useChartDataPondFetch` hook
  - [ ] 注册到数据池管理器
  - [ ] 监听分发事件
  - [ ] 独立 filter 转换

### 10.7 UI 组件

**全局配置页面**（一个统一入口，管理所有请求共享的域名和 Headers）：
- [ ] 全局配置面板：域名 baseURL（组件级不可覆盖）、全局 Headers、默认轮询间隔
- [ ] 数据池管理弹窗（增删改条目）

**组件配置面板**（每个图表独立配置，路径拼接到全局域名后）：
- [ ] 数据源类型切换（静态 / AJAX / 数据池）
- [ ] AJAX 请求配置：请求路径（显示全局域名为前缀）、HTTP 方法、组件级 Headers/Body
- [ ] JSON 编辑器（静态数据 + Body + 过滤函数）
- [ ] 数据池选择器
