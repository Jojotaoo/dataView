# Schema 架构拆分方案

> 解决当前 schema 耦合过重的问题，按组件族拆分，实现类型安全和可扩展性

---

## 目录

1. [当前问题分析](#一当前问题分析)
2. [拆分方案](#二拆分方案)
3. [拆分优先级](#三拆分优先级)
4. [向后兼容策略](#四向后兼容策略)
5. [文件变更清单](#五文件变更清单)

---

## 一、当前问题分析

### 1.1 核心耦合问题

| 问题 | 具体表现 | 严重程度 |
|------|----------|----------|
| **`ChartStyleConfig` 巨型类型** | 6个顶层子对象 + 41个series字段 | 高 |
| **`option: Record<string, any>`** | 完全无类型安全，4种不同结构混在一起 | 高 |
| **`props: Record<string, any>`** | TextDisplay有13个字段，ScrollList有11个字段 | 中 |
| **序列化逻辑重复** | SchemaPanel.vue和App.vue中完全重复 | 中 |

### 1.2 `chartStyle.series` 字段使用情况

| 字段组 | 字段数量 | 使用组件 | 冗余情况 |
|--------|----------|----------|----------|
| `map*` 系列 | 20个 | 仅 MapChart | 对所有非地图组件冗余 |
| `line*` 系列 | 7个 | 仅 LineChart | 对非折线图冗余 |
| `bar*` 系列 | 3个 | 仅 BarChart | 对非柱状图冗余 |
| `pie*` 系列 | 3个 | 仅 PieChart | 对非饼图冗余 |
| 通用系列 | 5个 | Line/Bar/Pie/Map | 共用 |

### 1.3 各组件实际使用的字段

#### ECharts 轴类图表（LineChart + BarChart）

| 子对象 | 字段 | LineChart | BarChart |
|--------|------|-----------|----------|
| `grid` | `top, bottom, left, right` | ✅ | ✅ |
| `titleStyle` | 全部字段 | ✅ | ✅ |
| `legend` | 全部字段 | ✅ | ✅ |
| `xAxis` | 全部字段 | ✅ | ✅ |
| `yAxis` | 全部字段 | ✅ | ✅ |
| `tooltip` | 全部字段 | ✅ | ✅ |
| `series.smooth` | | ✅ | ❌ |
| `series.symbol` | | ✅ | ❌ |
| `series.lineWidth` | | ✅ | ❌ |
| `series.showArea` | | ✅ | ❌ |
| `series.barWidth` | | ❌ | ✅ |
| `series.barBorderRadius` | | ❌ | ✅ |
| `series.colorEnd` | | ❌ | ✅ |

#### 饼图（PieChart）

- 使用 `titleStyle`、`tooltip`、`backgroundColor`
- 特有字段：`series.pieRadius`、`series.pieRoseType`、`series.pieLabelPosition`
- **不使用** `grid`、`legend`、`xAxis`、`yAxis`

#### 地图（MapChart）

- 使用 `titleStyle`、`tooltip`、`backgroundColor`
- 特有字段：20个 `map*` 字段
- **不使用** `grid`、`legend`、`xAxis`、`yAxis`
- **不使用** `useECharts` composable，独立实现

#### 文本（TextDisplay）

- **完全不使用** `chartStyle`
- 所有配置通过 `comp.props` 传递
- 字段：`text`, `fontSize`, `fontWeight`, `textAlign`, `colorMode`, `textColor`, `gradientStart`, `gradientEnd`, `gradientDirection`, `bgColor`, `lineHeight`, `letterSpacing`, `padding`

#### 滚动列表（ScrollList）

- **完全不使用** `chartStyle`
- 所有配置通过 `comp.props` 传递
- 字段：`scrollSpeed`, `visibleRows`, `rowHeight`, `showHeader`, `headerBg`, `headerColor`, `zebraOdd`, `zebraEven`, `fontSize`, `textColor`, `highlightColor`

---

## 二、拆分方案

### 2.1 整体架构

```
CreateComponentType
├── BaseComponentFields (通用字段)
│   ├── id, key, chartConfig, attr, styles, status
│   ├── filter, preview, events, interactActions, request
│   └── props: ComponentProps (类型安全)
│
├── EChartsComponentExtra (ECharts组件额外字段)
│   └── chartStyle: AxisChartStyle | PieChartStyle | MapChartStyle
│
└── GroupComponentExtra (分组组件额外字段)
    ├── isGroup: true
    └── groupList: CreateComponentType[]
```

### 2.2 拆分 `option` 为联合类型

```typescript
// 通用数据集结构
interface DatasetType {
  dimensions: string[]
  source: (string | number)[][]
}

// 按组件类型定义 option
interface AxisChartOption {
  title: string
  dataset: DatasetType
}

interface PieChartOption {
  title: string
  dataset: DatasetType
}

interface MapChartOption {
  title: string
  dataset: DatasetType
}

interface ScrollListOption {
  dataset: DatasetType
}

interface TextDisplayOption {
  title: string
}

interface GroupOption {}

// 使用判别联合
type ComponentOption =
  | AxisChartOption
  | PieChartOption
  | MapChartOption
  | ScrollListOption
  | TextDisplayOption
  | GroupOption
```

### 2.3 拆分 `chartStyle` 为按图表族分层

```typescript
// === 通用主题字段 ===
interface ChartThemeFields {
  themeName: string
  backgroundColor: string
}

// === 标题（所有ECharts组件） ===
interface TitleStyleConfig {
  show: boolean
  fontSize: number
  color: string
  left: number | string
  top: number | string
}

// === Tooltip（所有ECharts组件） ===
interface TooltipConfig {
  show: boolean
  trigger: 'axis' | 'item' | 'none'
  backgroundColor: string
  borderColor: string
  textColor: string
}

// === 仅轴类图表使用 ===
interface AxisLayoutConfig {
  grid: { top: number; bottom: number; left: number; right: number }
  legend: {
    show: boolean
    orient: 'horizontal' | 'vertical'
    left: number | string
    top: number | string
    fontSize: number
    icon: 'circle' | 'rect' | 'roundRect' | 'triangle' | 'diamond'
    textColor: string
  }
  xAxis: {
    show: boolean
    name: string
    labelFontSize: number
    labelRotate: number
    lineColor: string
    labelColor: string
  }
  yAxis: {
    show: boolean
    name: string
    labelFontSize: number
    min: number | null
    max: number | null
    splitLineShow: boolean
    splitLineColor: string
    labelColor: string
  }
}

// === 通用系列字段 ===
interface BaseSeriesConfig {
  showLabel: boolean
  labelFontSize: number
  color: string
  colorList: string[]
  labelColor: string
}

// === 按图表族拆分系列配置 ===
interface LineSeriesConfig extends BaseSeriesConfig {
  smooth: boolean
  symbol: string
  symbolSize: number
  lineWidth: number
  showArea: boolean
  areaOpacityStart: number
  areaOpacityEnd: number
}

interface BarSeriesConfig extends BaseSeriesConfig {
  barWidth: number | string
  barBorderRadius: number
  colorEnd: string
}

interface PieSeriesConfig extends BaseSeriesConfig {
  pieRadius: number
  pieRoseType: boolean
  pieLabelPosition: 'inside' | 'outside' | 'center'
}

interface MapSeriesConfig extends BaseSeriesConfig {
  mapRegionColor: string
  mapRegionBorderColor: string
  mapRegionHoverColor: string
  mapLabelShow: boolean
  mapLabelColor: string
  mapLabelFontSize: number
  mapVisualMin: number
  mapVisualMax: number
  mapVisualColors: string[]
  mapVisualMapShow: boolean
  mapMarkPointShow: boolean
  mapMarkPointSymbolSize: number
  mapMarkPointColor: string
  mapMarkPointLabelShow: boolean
  mapMarkPointLabelFontSize: number
  mapSelectColor: string
  mapSelectLabelColor: string
  mapMiniMapShow: boolean
  mapMiniMapWidth: number
  mapMiniMapHeight: number
}

// === 按图表族组合 ===
interface AxisChartStyle {
  themeName: string
  grid: AxisLayoutConfig['grid']
  titleStyle: TitleStyleConfig
  legend: AxisLayoutConfig['legend']
  xAxis: AxisLayoutConfig['xAxis']
  yAxis: AxisLayoutConfig['yAxis']
  series: LineSeriesConfig | BarSeriesConfig
  tooltip: TooltipConfig
  backgroundColor: string
}

interface PieChartStyle {
  themeName: string
  titleStyle: TitleStyleConfig
  series: PieSeriesConfig
  tooltip: TooltipConfig
  backgroundColor: string
}

interface MapChartStyle {
  themeName: string
  titleStyle: TitleStyleConfig
  series: MapSeriesConfig
  tooltip: TooltipConfig
  backgroundColor: string
}

// === 最终的 chartStyle 联合类型 ===
type ChartStyleConfig = AxisChartStyle | PieChartStyle | MapChartStyle
```

### 2.4 拆分 `props` 为类型安全的联合类型

```typescript
interface BarChartProps {
  bgColor?: string
}

interface LineChartProps {
  bgColor?: string
}

interface PieChartProps {
  bgColor?: string
}

interface MapChartProps {
  bgColor?: string
  geoKey?: string
}

interface TextDisplayProps {
  text: string
  fontSize: number
  fontWeight: string
  textAlign: string
  colorMode: 'solid' | 'gradient'
  textColor: string
  gradientStart: string
  gradientEnd: string
  gradientDirection: string
  bgColor: string
  lineHeight: number
  letterSpacing: number
  padding: number
}

interface ScrollListProps {
  scrollSpeed: number
  visibleRows: number
  rowHeight: number
  showHeader: boolean
  headerBg: string
  headerColor: string
  zebraOdd: string
  zebraEven: string
  fontSize: number
  textColor: string
  highlightColor: string
}

type ComponentProps =
  | BarChartProps
  | LineChartProps
  | PieChartProps
  | MapChartProps
  | TextDisplayProps
  | ScrollListProps
  | Record<string, never>
```

### 2.5 最终的 `CreateComponentType` 联合类型

```typescript
// 通用字段基类
interface BaseComponentFields {
  id: string
  key: string
  chartConfig: ChartConfigType
  attr: AttrType
  styles: StylesType
  status: StatusType
  filter?: string
  preview: PreviewType
  events?: EventsType
  interactActions?: InteractActionItem[]
  request?: RequestConfigType
}

// ECharts组件额外字段
interface EChartsComponentExtra {
  chartStyle?: ChartStyleConfig
}

// 分组组件额外字段
interface GroupComponentExtra {
  isGroup: true
  groupList: CreateComponentType[]
}

// 最终的联合类型
type CreateComponentType =
  // 轴类图表
  | (BaseComponentFields & EChartsComponentExtra & {
      key: 'BarCommon' | 'LineCommon'
      option: AxisChartOption
      chartStyle: AxisChartStyle
    })
  // 饼图
  | (BaseComponentFields & EChartsComponentExtra & {
      key: 'PieCommon'
      option: PieChartOption
      chartStyle: PieChartStyle
    })
  // 地图
  | (BaseComponentFields & EChartsComponentExtra & {
      key: 'HeilongjiangMap'
      option: MapChartOption
      chartStyle: MapChartStyle
    })
  // 滚动列表 — 无chartStyle
  | (BaseComponentFields & {
      key: 'ScrollList'
      option: ScrollListOption
    })
  // 文本 — 无chartStyle
  | (BaseComponentFields & {
      key: 'TextDisplay'
      option: TextDisplayOption
    })
  // 分组
  | (BaseComponentFields & GroupComponentExtra & {
      key: 'group'
      option: GroupOption
    })
```

### 2.6 统一序列化函数

```typescript
// src/utils/serialize.ts
import type { CreateComponentType, ChartEditStorage } from '../types'

function serializeComponent(c: CreateComponentType) {
  return {
    id: c.id,
    key: c.key,
    chartConfig: c.chartConfig,
    attr: { ...c.attr },
    styles: { ...c.styles },
    status: { ...c.status },
    preview: { ...c.preview },
    filter: c.filter,
    option: { ...c.option },
    chartStyle: c.chartStyle ? { ...c.chartStyle } : undefined,
    isGroup: c.isGroup,
    groupList: c.groupList
      ? c.groupList.map(serializeComponent)
      : undefined,
    props: c.props ? { ...c.props } : undefined,
    request: c.request ? structuredClone(c.request) : undefined,
    events: c.events ? structuredClone(c.events) : undefined,
    interactActions: c.interactActions
      ? structuredClone(c.interactActions)
      : undefined,
  }
}

export function serializeStorage(store: {
  editCanvasConfig: any
  requestGlobalConfig: any
  components: CreateComponentType[]
}): ChartEditStorage {
  return {
    editCanvasConfig: { ...store.editCanvasConfig },
    requestGlobalConfig: { ...store.requestGlobalConfig },
    componentList: store.components.map(serializeComponent),
  }
}
```

---

## 三、拆分优先级

| 优先级 | 改动 | 影响范围 | 收益 |
|--------|------|----------|------|
| **P0** | 添加 `props` 到序列化 | SchemaPanel, App | 修复数据丢失 |
| **P0** | 将 `map*` 20个字段提取为 `mapSeries` | MapChart, ChartStyleConfig | 消除最大冗余 |
| **P1** | 将 `pie*` 3个字段提取为 `pieSeries` | PieChart, ChartStyleConfig | 消除中等冗余 |
| **P1** | 给 `option` 定义 discriminated union | 所有消费者 | 类型安全 |
| **P2** | 给 `props` 定义 per-component 类型 | ComponentProps, 各组件 | 类型安全 |
| **P2** | 提取 `serializeComponent` 消除重复 | SchemaPanel, App | DRY |
| **P3** | 将 Line/Bar 特有字段分别提取 | LineChart, BarChart | 完善类型区分 |

---

## 四、向后兼容策略

1. **迁移脚本**: 编写函数将旧schema转换为新类型
2. **保留字段名**: `chartStyle` 字段名不变，只改变内部类型结构
3. **渐进式迁移**: 在过渡期同时支持新旧类型
4. **可选字段**: `chartStyle` 对 ScrollList 和 TextDisplay 保持可选

---

## 五、文件变更清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `src/types/component.ts` | 重构 | 拆分 `ChartStyleConfig`、`CreateComponentType`、添加 `ComponentProps` |
| `src/types/option.ts` | 新增 | 定义 `ComponentOption` 联合类型 |
| `src/utils/serialize.ts` | 新增 | 统一序列化函数 |
| `src/components/RightPanel/SchemaPanel.vue` | 修改 | 使用统一序列化函数，添加 `props` |
| `src/App.vue` | 修改 | 使用统一序列化函数，添加 `props` |
| `src/components/RightPanel/ComponentProps.vue` | 修改 | 使用新的类型定义 |
| `src/components/charts/MapChart.vue` | 修改 | 从 `props.geoKey` 读取，而非硬编码 |
| `src/components/CanvasArea.vue` | 修改 | 从 `comp.props.geoKey` 读取 |
| `src/composables/useECharts.ts` | 修改 | 适配新的 `chartStyle` 类型 |

---

## 六、总结

本方案采用 **discriminated union（判别联合）** 模式重构类型系统：

1. **拆分 `option`**: 按组件类型定义不同的 option 结构，实现类型安全
2. **拆分 `chartStyle`**: 按图表族（axis/pie/map）拆分，消除冗余字段
3. **拆分 `props`**: 为每个组件类型定义专用的 props 类型
4. **统一序列化**: 提取 `serializeComponent` 函数，消除重复代码
5. **修复数据丢失**: 在序列化中添加 `props` 字段

通过这些改动，可以显著提高代码的可维护性和类型安全性，同时为未来添加新组件类型打下良好的基础。

---

*方案版本: v1.0*
*生成时间: 2026-06-18*
