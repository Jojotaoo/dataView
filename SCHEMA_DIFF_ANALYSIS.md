# Schema协议差异分析报告

> 代码实现 vs Skill文档（schemadesign/SKILL.md）vs 旧文档（tech/README.md）

---

## 目录

1. [总体概览](#1-总体概览)
2. [代码中有但文档中缺失的字段](#2-代码中有但文档中缺失的字段)
3. [文档中有但代码中未实现的内容](#3-文档中有但代码中未实现的内容)
4. [类型定义不一致](#4-类型定义不一致)
5. [过时/废弃的文档](#5-过时废弃的文档)
6. [已修复的旧问题](#6-已修复的旧问题)
7. [详细差异说明](#7-详细差异说明)
8. [修复建议](#8-修复建议)

---

## 1. 总体概览

| 类别 | 差异数量 | 严重程度 |
|------|----------|----------|
| 代码有、文档无 | 25个字段 | 高 |
| 文档有、代码无 | 12个字段 | 高 |
| 类型不一致 | 3处 | 中 |
| 过时文档 | 1处 | 高 |
| 已修复问题 | 2处 | 低 |

---

## 2. 代码中有但文档中缺失的字段

### 2.1 EditCanvasConfigType - 缺少 `customTheme`

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/types/canvas.ts:18` |
| **字段** | `customTheme: ChartThemePreset \| null` |
| **默认值** | `null` |
| **功能** | 存储用户自定义的图表主题预设 |
| **SKILL.md位置** | §2（画布配置模块）未提及 |

**代码定义**:
```typescript
export interface EditCanvasConfigType {
  projectName: string
  width: number
  height: number
  background: string
  backgroundImage: string | null
  filterShow: boolean
  opacity: number
  saturate: number
  contrast: number
  hueRotate: number
  brightness: number
  blendMode: string
  customTheme: ChartThemePreset | null  // ❌ 文档缺失
}
```

**影响**: 自定义主题预设功能被序列化到schema中，但文档未描述此字段。

---

### 2.2 StylesType - 缺少5个3D变换字段

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/types/component.ts:32-36` |
| **缺失字段** | `rotateZ`, `rotateX`, `rotateY`, `skewX`, `skewY` |
| **默认值** | 全部为 `0` |
| **功能** | 组件的3D旋转和倾斜变换 |
| **SKILL.md位置** | §4.3（滤镜与动画）未提及 |

**代码定义**:
```typescript
export interface StylesType {
  filterShow: boolean
  opacity: number
  saturate: number
  contrast: number
  hueRotate: number
  brightness: number
  rotateZ: number   // ❌ 文档缺失
  rotateX: number   // ❌ 文档缺失
  rotateY: number   // ❌ 文档缺失
  skewX: number     // ❌ 文档缺失
  skewY: number     // ❌ 文档缺失
  blendMode: string
  animations: string[]
}
```

**影响**: 组件支持3D旋转和倾斜变换，UI中可编辑，预览中会渲染，但协议文档完全未描述。

---

### 2.3 ChartStyleConfig.series - 缺少19个地图相关字段

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/types/component.ts:137-155` |
| **缺失字段数** | 19个 |
| **功能** | 地图组件的样式配置 |
| **SKILL.md位置** | §4.11（图表样式配置）series子节未提及 |

**缺失的地图字段列表**:

| 字段名 | 类型 | 说明 |
|--------|------|------|
| `mapRegionColor` | `string` | 地图区域颜色 |
| `mapRegionBorderColor` | `string` | 区域边框颜色 |
| `mapRegionHoverColor` | `string` | 鼠标悬停颜色 |
| `mapLabelShow` | `boolean` | 是否显示标签 |
| `mapLabelColor` | `string` | 标签颜色 |
| `mapLabelFontSize` | `number` | 标签字号 |
| `mapVisualMin` | `number` | 视觉映射最小值 |
| `mapVisualMax` | `number` | 视觉映射最大值 |
| `mapVisualColors` | `string[]` | 视觉映射颜色范围 |
| `mapVisualMapShow` | `boolean` | 是否显示视觉映射 |
| `mapMarkPointShow` | `boolean` | 是否显示标注点 |
| `mapMarkPointSymbolSize` | `number` | 标注点大小 |
| `mapMarkPointColor` | `string` | 标注点颜色 |
| `mapMarkPointLabelShow` | `boolean` | 是否显示标注标签 |
| `mapMarkPointLabelFontSize` | `number` | 标注标签字号 |
| `mapSelectColor` | `string` | 选中区域颜色 |
| `mapSelectLabelColor` | `string` | 选中标签颜色 |
| `mapMiniMapShow` | `boolean` | 是否显示小地图 |
| `mapMiniMapWidth` | `number` | 小地图宽度 |
| `mapMiniMapHeight` | `number` | 小地图高度 |

**影响**: 地图组件的样式配置在代码中已实现，UI中可编辑，但协议文档完全未描述。

---

## 3. 文档中有但代码中未实现的内容

### 3.1 TextDisplay组件 - option字段完全不匹配

| 属性 | 值 |
|------|-----|
| **SKILL.md位置** | §4.10（图表配置）文本组件部分 |
| **代码位置** | `src/config/componentDefinitions.ts:170-200` |
| **严重程度** | 高 |

**SKILL.md描述的结构**（错误）:
```json
{
  "option": {
    "dataset": "要显示的文本内容",
    "fontSize": 20,
    "fontColor": "#ffffff",
    "paddingX": 10,
    "paddingY": 10,
    "textAlign": "center",
    "fontWeight": "normal",
    "borderWidth": 0,
    "borderColor": "red",
    "borderRadius": 5,
    "letterSpecing": 5,
    "writingMode": "horizontal-tb",
    "backgroundColor": "red"
  }
}
```

**代码实际结构**（正确）:
```json
{
  "option": {
    "title": "文本内容"
  },
  "props": {
    "text": "文本内容",
    "fontSize": 32,
    "fontWeight": "bold",
    "textAlign": "center",
    "colorMode": "solid",
    "textColor": "#cdd6f4",
    "gradientStart": "#89b4fa",
    "gradientEnd": "#cba6f7",
    "gradientDirection": "to right",
    "bgColor": "transparent",
    "lineHeight": 1.5,
    "letterSpacing": 0,
    "padding": 12
  }
}
```

**差异对比**:

| SKILL.md字段 | 代码中实际字段 | 状态 |
|--------------|---------------|------|
| `option.dataset` | `props.text` | ❌ 不匹配 |
| `option.fontSize` | `props.fontSize` | ❌ 存储位置不同 |
| `option.fontColor` | `props.textColor` | ❌ 字段名不同 |
| `option.paddingX` / `option.paddingY` | `props.padding` | ❌ 结构不同 |
| `option.fontWeight` | `props.fontWeight` | ❌ 存储位置不同 |
| `option.borderWidth` | 不存在 | ❌ 未实现 |
| `option.borderColor` | 不存在 | ❌ 未实现 |
| `option.borderRadius` | 不存在 | ❌ 未实现 |
| `option.letterSpecing` | `props.letterSpacing` | ❌ 拼写错误+位置不同 |
| `option.writingMode` | 不存在 | ❌ 未实现 |
| 不存在 | `props.colorMode` | ⚠️ 文档缺失 |
| 不存在 | `props.gradientStart` | ⚠️ 文档缺失 |
| 不存在 | `props.gradientEnd` | ⚠️ 文档缺失 |
| 不存在 | `props.gradientDirection` | ⚠️ 文档缺失 |
| 不存在 | `props.lineHeight` | ⚠️ 文档缺失 |

**影响**: 文本组件的协议描述与实际实现完全不一致，会导致schema导入/导出错误。

---

### 3.2 图片组件 - 文档描述但代码未实现

| 属性 | 值 |
|------|-----|
| **SKILL.md位置** | §4.10（图表配置）图片组件部分 |
| **代码状态** | 无 `ImageCommon` 或类似组件注册 |
| **严重程度** | 低 |

**SKILL.md描述**:
```json
{
  "option": {
    "dataset": "data:image/png;base64,...",
    "imageScale": "cover",
    "borderRadius": 0,
    "opacity": 1
  }
}
```

**代码状态**: `componentDefinitions.ts` 中无图片组件定义。

**影响**: 协议文档描述了未实现的功能，可能导致使用者困惑。

---

## 4. 类型定义不一致

### 4.1 requestDataType - 字面量联合 vs number

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/types/request.ts:9` |
| **SKILL.md位置** | §4.9 |

**代码定义**:
```typescript
requestDataType: 0 | 1 | 2  // 字面量联合类型
```

**SKILL.md描述**:
```
requestDataType: number  // 宽泛类型
```

**建议**: 文档应使用精确的字面量联合类型 `0 | 1 | 2`。

---

### 4.2 requestHttpType - 字面量联合 vs string

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/types/request.ts:11` |
| **SKILL.md位置** | §4.9 |

**代码定义**:
```typescript
requestHttpType?: 'get' | 'post' | 'put' | 'delete' | 'patch'  // 字面量联合
```

**SKILL.md描述**:
```
requestHttpType: string  // 宽泛类型
```

**建议**: 文档应使用精确的字面量联合类型。

---

### 4.3 InteractEventItem.interactFn - 类型描述不清晰

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/types/events.ts:16` |
| **SKILL.md位置** | §4.7.3 |

**代码定义**:
```typescript
interactFn: Record<string, string>
```

**SKILL.md示例**:
```json
"interactFn": {
  "setData": "params.data",
  "setOption": "{ series: [{ data: params.data }] }"
}
```

**说明**: 类型定义一致，但文档可添加更明确的说明。

---

## 5. 过时/废弃的文档

### 5.1 tech/README.md - 完全过时的schema格式

| 属性 | 值 |
|------|-----|
| **文件位置** | `tech/README.md:77-103` |
| **严重程度** | 高 |

**tech/README.md描述的过时格式**:
```json
{
  "page": "可视化大屏",
  "pageConfig": {
    "width": 1920,
    "height": 1080,
    "bgColor": "#11111b",
    "bgImage": ""
  },
  "components": [
    {
      "id": "comp-1",
      "type": "bar-chart",
      "name": "柱状图",
      "props": {...},
      "position": { "x": 50, "y": 50 },
      "size": { "width": 400, "height": 300 }
    }
  ]
}
```

**当前代码实际格式**:
```json
{
  "editCanvasConfig": {
    "projectName": "可视化大屏",
    "width": 1920,
    "height": 1080,
    "background": "#11111b",
    "backgroundImage": null,
    ...
  },
  "requestGlobalConfig": {...},
  "componentList": [
    {
      "id": "uuid",
      "key": "LineCommon",
      "chartConfig": {...},
      "attr": { "x": 50, "y": 50, "w": 500, "h": 300, ... },
      "option": {...},
      ...
    }
  ]
}
```

**差异对比**:

| 旧格式 | 新格式 | 状态 |
|--------|--------|------|
| `page` | `editCanvasConfig.projectName` | ❌ 结构不同 |
| `pageConfig` | `editCanvasConfig` | ❌ 字段名不同 |
| `components` | `componentList` | ❌ 字段名不同 |
| `components[].type` | `components[].key` | ❌ 字段名不同 |
| `components[].props` | `components[].option` + `components[].props` | ❌ 结构不同 |
| `components[].position` | `components[].attr.x/y` | ❌ 结构不同 |
| `components[].size` | `components[].attr.w/h` | ❌ 结构不同 |
| 不存在 | `requestGlobalConfig` | ⚠️ 新增模块 |

**影响**: 读取此文档会完全误解当前的schema结构。

---

## 6. 已修复的旧问题

### 6.1 SchemaPanel序列化 - 已完整实现

| 属性 | 值 |
|------|-----|
| **AGENTS.md声称** | `events`, `interactActions`, `request` 序列化缺失 |
| **实际代码** | `SchemaPanel.vue:21-37` 已序列化所有字段 |
| **状态** | ✅ 已修复 |

**AGENTS.md过时描述**:
```
**Known missing**: `events`, `interactActions`, `request` — defined on `CreateComponentType` 
but NOT serialized. Adding them requires updating both files identically.
```

**实际代码** (`SchemaPanel.vue`):
```typescript
const schema = {
  ...store.editCanvasConfig,
  ...store.requestGlobalConfig,
  componentList: store.components.map(c => ({
    id: c.id,
    key: c.key,
    chartConfig: c.chartConfig,
    attr: c.attr,
    styles: c.styles,
    status: c.status,
    filter: c.filter,
    preview: c.preview,
    events: c.events,           // ✅ 已序列化
    interactActions: c.interactActions,  // ✅ 已序列化
    request: c.request,         // ✅ 已序列化
    option: c.option,
    chartStyle: c.chartStyle,   // ✅ 已序列化
    isGroup: c.isGroup,
    groupList: c.groupList,
  }))
}
```

---

### 6.2 requestGlobalConfig - 已与文档匹配

| 属性 | 值 |
|------|-----|
| **旧报告声称** | 文档用 `requestParams`，代码用 `requestHeader` |
| **当前状态** | 两者都使用 `requestHeader`，已匹配 |
| **状态** | ✅ 已修复 |

---

## 7. 详细差异说明

### 7.1 parentId字段说明

| 属性 | 值 |
|------|-----|
| **AGENTS.md描述** | `parentId: string` 在 `CreateComponentType` 上 |
| **实际代码** | `CreateComponentType` 无 `parentId` 字段 |
| **说明** | AGENTS.md描述的是Container模型，但当前代码只实现了Group模型 |

**代码定义** (`component.ts:195-211`):
```typescript
export interface CreateComponentType {
  id: string
  key: string
  isGroup?: boolean
  chartConfig: ChartConfigType
  attr: AttrType
  styles: StylesType
  status: StatusType
  filter?: string
  preview: PreviewType
  events?: EventsType
  interactActions?: InteractActionItem[]
  request?: RequestConfigType
  option: Record<string, any>
  chartStyle?: ChartStyleConfig
  groupList?: CreateComponentType[]
  // ❌ 没有 parentId 字段
}
```

**影响**: AGENTS.md中的Container模型描述在当前代码中不存在，可能造成混淆。

---

### 7.2 animations字段 - 已定义但未使用

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/types/component.ts:38` |
| **字段** | `animations: string[]` |
| **默认值** | `[]` |
| **使用状态** | 未在任何渲染组件中读取或应用 |

**说明**: 字段已定义，UI中可能存在编辑入口，但实际渲染逻辑未实现。

---

### 7.3 ScrollList的highlightColor - 预留字段

| 属性 | 值 |
|------|-----|
| **代码位置** | `src/components/charts/ScrollList.vue:47` |
| **状态** | 已定义但未在模板或样式中使用 |
| **文档状态** | SKILL.md标注为"（预留）" |

**说明**: 代码与文档一致，都表明这是预留功能。

---

## 8. 修复建议

### 8.1 高优先级修复

#### 8.1.1 更新SKILL.md - 添加缺失字段

**文件**: `.opencode/skills/schemadesign/SKILL.md`

**修改1**: §2 画布配置模块 - 添加 `customTheme`
```markdown
### 2.6 自定义主题 (customTheme)

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `customTheme` | `ChartThemePreset \| null` | `null` | 自定义图表主题预设，覆盖内置主题 |
```

**修改2**: §4.3 滤镜与动画 - 添加3D变换字段
```markdown
| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `rotateZ` | `number` | `0` | Z轴旋转角度(deg) |
| `rotateX` | `number` | `0` | X轴旋转角度(deg)，3D透视 |
| `rotateY` | `number` | `0` | Y轴旋转角度(deg)，3D透视 |
| `skewX` | `number` | `0` | X轴倾斜角度(deg) |
| `skewY` | `number` | `0` | Y轴倾斜角度(deg) |
```

**修改3**: §4.11 series - 添加地图相关字段
```markdown
#### series - 地图样式（仅地图组件）

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mapRegionColor` | `string` | `'#313244'` | 地图区域填充颜色 |
| `mapRegionBorderColor` | `string` | `'#45475a'` | 区域边框颜色 |
| `mapRegionHoverColor` | `string` | `'#89b4fa'` | 鼠标悬停填充颜色 |
| `mapLabelShow` | `boolean` | `true` | 是否显示区域标签 |
| `mapLabelColor` | `string` | `'#cdd6f4'` | 标签文字颜色 |
| `mapLabelFontSize` | `number` | `11` | 标签字号 |
| `mapVisualMin` | `number` | `0` | 视觉映射最小值 |
| `mapVisualMax` | `number` | `200` | 视觉映射最大值 |
| `mapVisualColors` | `string[]` | `['#313244','#89b4fa']` | 视觉映射颜色范围 |
| `mapVisualMapShow` | `boolean` | `true` | 是否显示视觉映射控件 |
| `mapMarkPointShow` | `boolean` | `true` | 是否显示标注点 |
| `mapMarkPointSymbolSize` | `number` | `12` | 标注点大小 |
| `mapMarkPointColor` | `string` | `'#e74c3c'` | 标注点颜色 |
| `mapMarkPointLabelShow` | `boolean` | `true` | 是否显示标注标签 |
| `mapMarkPointLabelFontSize` | `number` | `11` | 标注标签字号 |
| `mapSelectColor` | `string` | `'#e76f51'` | 选中区域颜色 |
| `mapSelectLabelColor` | `string` | `'#000'` | 选中标签颜色 |
| `mapMiniMapShow` | `boolean` | `true` | 是否显示小地图 |
| `mapMiniMapWidth` | `number` | `150` | 小地图宽度 |
| `mapMiniMapHeight` | `number` | `120` | 小地图高度 |
```

**修改4**: §4.10 修正文本组件配置
```markdown
#### 文本组件

文本组件的配置存储在 `props` 字段中（非 `option`）。

```json
{
  "option": {
    "title": "文本内容"
  },
  "props": {
    "text": "要显示的文本内容",
    "fontSize": 32,
    "fontWeight": "bold",
    "textAlign": "center",
    "colorMode": "solid",
    "textColor": "#cdd6f4",
    "gradientStart": "#89b4fa",
    "gradientEnd": "#cba6f7",
    "gradientDirection": "to right",
    "bgColor": "transparent",
    "lineHeight": 1.5,
    "letterSpacing": 0,
    "padding": 12
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `text` | `string` | `'文本内容'` | 要显示的文本内容 |
| `fontSize` | `number` | `32` | 字号(px) |
| `fontWeight` | `string` | `'bold'` | 字重：`'normal'`、`'bold'` |
| `textAlign` | `string` | `'center'` | 对齐：`'left'`、`'center'`、`'right'` |
| `colorMode` | `string` | `'solid'` | 颜色模式：`'solid'`(纯色)、`'gradient'`(渐变) |
| `textColor` | `string` | `'#cdd6f4'` | 文字颜色（colorMode=solid时） |
| `gradientStart` | `string` | `'#89b4fa'` | 渐变起始颜色 |
| `gradientEnd` | `string` | `'#cba6f7'` | 渐变结束颜色 |
| `gradientDirection` | `string` | `'to right'` | 渐变方向 |
| `bgColor` | `string` | `'transparent'` | 背景颜色 |
| `lineHeight` | `number` | `1.5` | 行高倍数 |
| `letterSpacing` | `number` | `0` | 字间距(px) |
| `padding` | `number` | `12` | 内边距(px) |
```

#### 8.1.2 更新AGENTS.md - 移除过时描述

**文件**: `AGENTS.md`

**修改**: 移除或更新以下过时内容

1. 移除 `parentId` 相关描述（当前代码未实现Container模型）
2. 更新序列化描述（events/interactActions/request已序列化）
3. 更新"Known missing"部分

---

### 8.2 中优先级修复

#### 8.2.1 更新tech/README.md - 替换过时schema

**文件**: `tech/README.md`

**建议**: 
- 方案A: 删除§Schema数据格式部分，引导读者参考SKILL.md
- 方案B: 更新为当前正确的schema格式

#### 8.2.2 修正SKILL.md中的类型精确度

将以下宽泛类型修正为精确类型:

| 位置 | 原类型 | 修正为 |
|------|--------|--------|
| §4.9 requestDataType | `number` | `0 \| 1 \| 2` |
| §4.9 requestHttpType | `string` | `'get' \| 'post' \| 'put' \| 'delete' \| 'patch'` |

---

### 8.3 低优先级修复

#### 8.3.1 移除图片组件描述（未实现）

**文件**: `.opencode/skills/schemadesign/SKILL.md`

**建议**: 在§4.10中移除图片组件的描述，或标注为"计划中/未实现"。

#### 8.3.2 添加animations使用说明

**文件**: `.opencode/skills/schemadesign/SKILL.md`

**建议**: 在§4.3中添加说明：`animations` 字段已定义但当前版本未实现渲染逻辑。

---

## 附录A：完整差异清单

### 代码有、文档无

| # | 类型 | 字段 | 代码位置 | 文档位置 |
|---|------|------|----------|----------|
| 1 | `EditCanvasConfigType` | `customTheme` | `canvas.ts:18` | §2 |
| 2 | `StylesType` | `rotateZ` | `component.ts:32` | §4.3 |
| 3 | `StylesType` | `rotateX` | `component.ts:33` | §4.3 |
| 4 | `StylesType` | `rotateY` | `component.ts:34` | §4.3 |
| 5 | `StylesType` | `skewX` | `component.ts:35` | §4.3 |
| 6 | `StylesType` | `skewY` | `component.ts:36` | §4.3 |
| 7 | `ChartStyleConfig.series` | `mapRegionColor` | `component.ts:137` | §4.11 |
| 8 | `ChartStyleConfig.series` | `mapRegionBorderColor` | `component.ts:138` | §4.11 |
| 9 | `ChartStyleConfig.series` | `mapRegionHoverColor` | `component.ts:139` | §4.11 |
| 10 | `ChartStyleConfig.series` | `mapLabelShow` | `component.ts:140` | §4.11 |
| 11 | `ChartStyleConfig.series` | `mapLabelColor` | `component.ts:141` | §4.11 |
| 12 | `ChartStyleConfig.series` | `mapLabelFontSize` | `component.ts:142` | §4.11 |
| 13 | `ChartStyleConfig.series` | `mapVisualMin` | `component.ts:143` | §4.11 |
| 14 | `ChartStyleConfig.series` | `mapVisualMax` | `component.ts:144` | §4.11 |
| 15 | `ChartStyleConfig.series` | `mapVisualColors` | `component.ts:145` | §4.11 |
| 16 | `ChartStyleConfig.series` | `mapVisualMapShow` | `component.ts:146` | §4.11 |
| 17 | `ChartStyleConfig.series` | `mapMarkPointShow` | `component.ts:147` | §4.11 |
| 18 | `ChartStyleConfig.series` | `mapMarkPointSymbolSize` | `component.ts:148` | §4.11 |
| 19 | `ChartStyleConfig.series` | `mapMarkPointColor` | `component.ts:149` | §4.11 |
| 20 | `ChartStyleConfig.series` | `mapMarkPointLabelShow` | `component.ts:150` | §4.11 |
| 21 | `ChartStyleConfig.series` | `mapMarkPointLabelFontSize` | `component.ts:151` | §4.11 |
| 22 | `ChartStyleConfig.series` | `mapSelectColor` | `component.ts:152` | §4.11 |
| 23 | `ChartStyleConfig.series` | `mapSelectLabelColor` | `component.ts:153` | §4.11 |
| 24 | `ChartStyleConfig.series` | `mapMiniMapShow` | `component.ts:154` | §4.11 |
| 25 | `ChartStyleConfig.series` | `mapMiniMapWidth/Height` | `component.ts:155` | §4.11 |

### 文档有、代码无

| # | 文档位置 | 字段 | 代码状态 |
|---|----------|------|----------|
| 1 | §4.10 TextDisplay | `option.fontSize` | 存储在`props.fontSize` |
| 2 | §4.10 TextDisplay | `option.fontColor` | 存储在`props.textColor` |
| 3 | §4.10 TextDisplay | `option.paddingX/Y` | 存储在`props.padding` |
| 4 | §4.10 TextDisplay | `option.borderWidth` | 未实现 |
| 5 | §4.10 TextDisplay | `option.borderColor` | 未实现 |
| 6 | §4.10 TextDisplay | `option.borderRadius` | 未实现 |
| 7 | §4.10 TextDisplay | `option.letterSpecing` | 拼写错误，应为`letterSpacing` |
| 8 | §4.10 TextDisplay | `option.writingMode` | 未实现 |
| 9 | §4.10 Image | 整个图片组件 | 未实现 |
| 10 | §4.3 | `animations`使用 | 已定义但未渲染 |

---

## 附录B：修复优先级

| 优先级 | 修复项 | 影响范围 |
|--------|--------|----------|
| P0 | 修正TextDisplay协议描述 | 所有使用文本组件的schema |
| P0 | 更新tech/README.md或删除过时内容 | 新开发者理解项目 |
| P1 | 添加StylesType 5个变换字段 | 3D变换功能文档完整性 |
| P1 | 添加ChartStyleConfig 19个地图字段 | 地图组件文档完整性 |
| P1 | 添加EditCanvasConfigType.customTheme | 自定义主题功能文档 |
| P2 | 修正类型精确度（requestDataType等） | TypeScript类型一致性 |
| P2 | 更新AGENTS.md过时描述 | 开发者理解项目架构 |
| P3 | 移除未实现的图片组件描述 | 文档准确性 |
| P3 | 添加animations使用说明 | 文档完整性 |

---

*报告生成时间: 2026-06-18*
*分析基于: commit HEAD*
