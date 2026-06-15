# 图表数据解析技术方案

> 适用于拖拽式数据可视化平台，支持静态数据、HTTP 请求、数据池三种数据源模式。

---

## 1. 数据源类型定义

```typescript
enum RequestDataTypeEnum {
  STATIC = 0,  // 静态数据：用户手动编辑 JSON
  AJAX = 1,    // 动态请求：组件独立发起 HTTP 请求
  POND = 2     // 数据池：共享请求，一个接口供给多个图表
}
```

---

## 2. 静态数据方案

### 2.1 流程

```
用户编辑 JSON → 校验格式 → 赋值到组件 option.dataset → 图表渲染
```

1. 提供 JSON 编辑器（推荐 Monaco Editor），支持语法高亮和校验
2. 支持导入 `.json` 文件和下载当前数据
3. 每个图表组件内置默认 dataset，用户在其基础上修改
4. 保存后直接赋值，**不发起任何网络请求**

### 2.2 实现要点

- 编辑器组件需支持 JSON Schema 校验，防止格式错误
- 默认数据写在每个图表组件的配置中，创建组件时深拷贝
- 数据变更通过响应式系统驱动图表重绘

### 2.3 数据 Schema（ECharts）

```typescript
interface DatasetSchema {
  dimensions: string[]  // 列头，如 ['product', '2015', '2016']
  source: Array<Record<string, any>>  // 行数据
}
```

示例：

```json
{
  "dimensions": ["product", "2015", "2016", "2017"],
  "source": [
    { "product": "Matcha Latte", "2015": 43.3, "2016": 85.8, "2017": 93.7 },
    { "product": "Milk Tea", "2015": 83.1, "2016": 73.4, "2017": 55.1 }
  ]
}
```

### 2.4 数据 Schema（VChart 类）

```typescript
interface VChartDatasetSchema {
  values: Array<Record<string, any>>
}
```

VChart 通过字段映射（`xField`、`yField`、`seriesField`）将数据 key 绑定到图表轴。

---

## 3. 动态请求（AJAX）方案

### 3.1 流程

```
用户配置请求 → 发送测试请求 → 过滤函数转换 → 赋值 dataset → 图表渲染
    ↓ (预览时)
挂载时立即请求 → 按间隔轮询 → 参数变化重新请求
```

### 3.2 组件请求配置类型

```typescript
interface RequestConfigType {
  requestDataType: RequestDataTypeEnum        // 数据源类型
  requestHttpType: 'get' | 'post' | 'put' | 'patch' | 'delete'
  requestUrl: string                          // 请求路径（拼接到全局 baseURL 后）
  requestParamsBodyType: 'none' | 'form-data' | 'x-www-form-urlencoded' | 'json' | 'xml'
  requestContentType: 0 | 1                   // 0=普通请求, 1=SQL 请求
  requestInterval?: number                    // 轮询间隔数值，undefined 用全局值
  requestIntervalUnit: 'second' | 'minute' | 'hour' | 'day'
  requestParams: RequestParams                // Header / Body / Query 参数
  requestSQLContent?: { sql: string }         // SQL 模式下的语句
  requestDataPondId?: string                  // Pond 模式下关联的数据池 ID
}
```

### 3.3 请求参数结构

```typescript
type RequestParams = {
  Header: Record<string, string>              // 请求头键值对
  Params: Record<string, any>                 // URL 查询参数
  Body: {
    'form-data': Record<string, any>          // multipart 表单
    'x-www-form-urlencoded': Record<string, any>
    json: string                              // JSON 字符串
    xml: string                               // XML 字符串
  }
}
```

### 3.4 Body 类型说明

| 类型 | Content-Type | 适用场景 |
|------|-------------|---------|
| `none` | 无 | GET 请求 |
| `json` | application/json | REST API |
| `xml` | application/xml | SOAP / XML 接口 |
| `form-data` | multipart/form-data | 文件上传 |
| `x-www-form-urlencoded` | application/x-www-form-urlencoded | 传统表单 |

### 3.5 过滤函数

用户可编写自定义 JavaScript 函数，将 API 响应转换为图表所需的 dataset 格式：

```typescript
// 函数签名
function filter(data: any, res: any): any {
  // data = response.data（响应体）
  // res = 完整响应对象（含 status、headers 等）
  // 返回值 = 赋给 option.dataset 的数据
  return transformedData
}
```

执行方式：

```typescript
// 将函数字符串转为真实函数并执行
const result = new Function('data', 'res', filterString)(responseData, fullResponse)
```

### 3.6 轮询机制

```typescript
interface PollingConfig {
  enabled: boolean
  interval: number       // 间隔数值
  unit: 'second' | 'minute' | 'hour' | 'day'
}
```

行为规则：
- 组件挂载/初始化时立即发起一次请求
- 之后按 `interval + unit` 定时轮询
- 请求参数变化时重新请求（重置轮询计时器）
- 组件卸载时清除定时器

---

## 4. 数据池（共享接口）方案

### 4.1 流程

```
全局配置数据池条目 → 组件关联数据池 ID
    ↓ (运行时)
收集同 ID 组件 → 去重请求 → 结果分发 → 各组件独立 filter 转换
```

### 4.2 数据池条目类型

```typescript
interface DataPondItem {
  dataPondId: string                          // 唯一标识（UUID）
  dataPondName: string                        // 显示名称
  dataPondRequestConfig: RequestConfigType    // 该条目的独立请求配置
}
```

### 4.3 核心规则

- 一个数据池条目在整个生命周期内**只发一次请求**
- 多个组件引用同一个 `dataPondId`，共享该次请求的响应
- 每个组件可各自配置 `filter` 函数，从同一响应中提取不同维度数据
- 数据池条目支持独立的轮询间隔配置

### 4.4 适用场景

- 大屏看板：多个图表展示同一接口的不同字段
- 联动图表：一个接口返回多组数据，分发给不同图表
- 减少重复请求，降低后端压力

---

## 5. 配置合并规则

### 5.1 全局配置

全局配置统一管理所有组件共享的**域名**和**公共 Headers**，组件级无法覆盖域名。

```typescript
interface GlobalRequestConfig {
  requestOriginUrl: string                    // 全局域名/baseURL（所有组件共用）
  requestInterval: number                     // 全局默认轮询间隔
  requestIntervalUnit: 'second' | 'minute' | 'hour' | 'day'
  requestParams: {
    Header: Record<string, string>            // 全局请求头（如 Auth Token）
  }
  requestDataPond: DataPondItem[]             // 数据池条目列表
}
```

### 5.2 合并策略

| 字段 | 合并方式 | 说明 |
|------|---------|------|
| **域名** | 仅全局 `requestOriginUrl` | 组件无法覆盖，只拼接路径 |
| **请求路径** | 仅组件 `requestUrl` | 拼接到全局域名之后 |
| **Headers** | `{ ...global.Header, ...component.Header }` | 组件覆盖全局同名项 |
| **Query Params** | 仅组件 | 全局不参与 |
| **Body** | 仅组件 | 全局 Body 字段未使用 |
| **轮询间隔** | 组件有值用组件，否则用全局 | 组件 `requestInterval` 可选覆盖 |

### 5.3 URL 模板字面量

URL 支持 `${}` 语法，运行时动态解析：

```
// 配置值
requestOriginUrl: "https://api.example.com"
requestUrl: "/chart/${chartId}/data"

// 运行时解析为
"https://api.example.com/chart/bar-001/data"
```

实现方式：

```typescript
function resolveUrl(template: string, context: Record<string, any>): string {
  return new Function(...Object.keys(context), `return \`${template}\``)(...Object.values(context))
}
```

### 5.4 合并请求函数

```typescript
function mergeRequestConfig(
  componentConfig: RequestConfigType,
  globalConfig: GlobalRequestConfig
): MergedRequestConfig {
  if (componentConfig.requestDataType === RequestDataTypeEnum.STATIC) {
    return null  // 静态数据不发请求
  }

  return {
    url: resolveUrl(globalConfig.requestOriginUrl + componentConfig.requestUrl, context),
    method: componentConfig.requestHttpType,
    headers: { ...globalConfig.requestParams.Header, ...componentConfig.requestParams.Header },
    params: componentConfig.requestParams.Params,
    body: componentConfig.requestParams.Body[componentConfig.requestParamsBodyType],
    polling: {
      interval: componentConfig.requestInterval ?? globalConfig.requestInterval,
      unit: componentConfig.requestIntervalUnit ?? globalConfig.requestIntervalUnit
    }
  }
}
```

---

## 6. 数据更新机制

### 6.1 ECharts 类组件

```typescript
// 使用 setOption 局部更新 dataset
chartInstance.setOption({ dataset: newData }, { replaceMerge: ['dataset'] })
```

### 6.2 VChart 类组件

```typescript
// 通过响应式赋值触发自动更新
chartConfig.option.dataset = newData
// 组件内部 watch dataset 变化，调用 chart.updateFullData() 重绘
```

### 6.3 通用封装

```typescript
function updateChartData(chartRef: any, newData: any, chartType: 'echarts' | 'vchart') {
  if (chartType === 'echarts') {
    chartRef.setOption({ dataset: newData }, { replaceMerge: ['dataset'] })
  } else {
    chartRef.updateFullData(newData)
  }
}
```

---

## 7. 完整数据流

```
┌─────────────────────────────────────────────────────────────────────┐
│                        用户配置阶段                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  全局配置面板                                                        │
│  ├─ requestOriginUrl  →  "https://api.example.com"                 │
│  ├─ 全局 Headers      →  { Authorization: "Bearer xxx" }           │
│  ├─ 轮询间隔          →  30 秒                                      │
│  └─ 数据池条目        →  [{ id, name, requestConfig }]             │
│                                                                     │
│  组件配置面板                                                        │
│  ├─ 数据源类型        →  STATIC / AJAX / POND                      │
│  ├─ AJAX:                                                        │
│  │   ├─ HTTP 方法     →  GET / POST / ...                          │
│  │   ├─ 请求路径      →  /api/chart/data                           │
│  │   ├─ Headers       →  { X-Custom: "value" }                    │
│  │   ├─ Body          →  { json: '{"key":"val"}' }                │
│  │   └─ 过滤函数      →  function filter(d,r){ return d.items }   │
│  └─ POND:                                                        │
│      └─ 关联数据池    →  dataPondId                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        运行时阶段                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  1. 组件挂载 → useChartDataFetch hook 初始化                        │
│                                                                     │
│  2. 判断 requestDataType:                                           │
│     ├─ STATIC → 直接使用 option.dataset，不发请求                   │
│     │                                                        │
│     ├─ AJAX →                                                   │
│     │   ├─ 合并配置 (URL / Headers / Body)                       │
│     │   ├─ 发送 HTTP 请求                                        │
│     │   ├─ 执行 filter 函数转换响应                               │
│     │   ├─ 赋值 option.dataset                                   │
│     │   ├─ 图表重绘                                              │
│     │   └─ 启动轮询定时器                                        │
│     │                                                            │
│     └─ POND →                                                    │
│         ├─ 注册到数据池订阅表                                     │
│         ├─ 数据池管理器按 dataPondId 去重请求                     │
│         ├─ 响应结果分发给所有订阅组件                              │
│         ├─ 各组件独立执行 filter 转换                              │
│         └─ 图表重绘                                              │
│                                                                     │
│  3. 参数变化 → 重新请求（重置轮询）                                │
│  4. 组件卸载 → 清除定时器，取消订阅                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. 实现清单

### 8.1 类型定义

- [ ] 定义 `RequestDataTypeEnum` 枚举
- [ ] 定义 `RequestConfigType` 接口
- [ ] 定义 `GlobalRequestConfig` 接口
- [ ] 定义 `DataPondItem` 接口
- [ ] 定义 `RequestParams` 结构类型

### 8.2 全局配置（一个统一页面，管理所有请求共享的域名和 Headers）

- [ ] 实现全局配置存储（状态管理）
- [ ] 实现全局配置 UI：域名 baseURL（所有组件共用，组件级不可覆盖）、全局 Headers、默认轮询间隔
- [ ] 实现数据池管理 UI（增删改条目）

### 8.3 组件配置（每个图表组件独立配置，路径拼接到全局域名后）

- [ ] 实现数据源类型切换 UI（静态 / AJAX / 数据池）
- [ ] 实现 AJAX 请求配置 UI：请求路径（显示全局域名为前缀）、HTTP 方法、组件级 Headers/Body
- [ ] 实现 JSON 编辑器（静态数据 + Body 编辑）
- [ ] 实现过滤函数编辑器
- [ ] 实现数据池选择 UI（关联数据池 ID）

### 8.4 请求层

- [ ] 实现 `mergeRequestConfig()` 合并函数
- [ ] 实现 `resolveUrl()` URL 模板解析
- [ ] 实现 HTTP 请求封装（支持多种 Body 类型）
- [ ] 实现响应拦截和错误处理

### 8.5 数据获取 Hook

- [ ] 实现 `useChartDataFetch` hook（静态 + AJAX）
  - [ ] 初始化请求
  - [ ] 轮询管理（启动 / 停止 / 重置）
  - [ ] 参数变化监听
  - [ ] 卸载清理
- [ ] 实现 `useChartDataPondFetch` hook（数据池）
  - [ ] 订阅管理（注册 / 取消）
  - [ ] 按 dataPondId 去重请求
  - [ ] 结果分发

### 8.6 过滤函数

- [ ] 实现 `executeFilter()` 安全执行函数
- [ ] 提供默认 filter 模板
- [ ] 支持 filter 错误捕获和提示

### 8.7 数据更新

- [ ] 封装 `updateChartData()` 统一更新接口
- [ ] ECharts: `setOption({ dataset }, { replaceMerge: ['dataset'] })`
- [ ] VChart: 响应式赋值触发重绘
