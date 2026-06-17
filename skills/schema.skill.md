# 大屏设计器 Schema 参考  --- 所有功能范畴

> 文档介绍 设计器 搭建大屏页面 schema 结构，按功能模块划分讲解每一部分的作用

---

## 目录

1. [顶层结构](#1-顶层结构)
2. [画布配置模块](#2-画布配置模块-editcanvasconfig)
3. [全局请求配置模块](#3全局请求配置模块requestglobalconfig)
4. [组件列表模块](#4-组件列表模块-componentlist)

---

## 1. 顶层结构

整个大屏的持久化数据分为三部分 `ChartEditStorage` 接口：

```typescript
interface ChartEditStorage {
    editCanvasConfig: EditCanvasConfigType // 画布配置（页面级别）
    requestGlobalConfig: RequestGlobalConfigType // 全局请求配置（数据源级别）
    componentList: CreateComponentType[] // 组件列表（组件级别）
}
```
| 模块 | 功能归属 | 说明 |
|------|----------|------|
| `editCanvasConfig` | 画布设置面板 | 大屏的宽高、背景、主题、全局滤镜等页面级配置 |
| `requestGlobalConfig` | 数据请求配置面板 | 全局的 API 请求设置、轮询配置、共享数据池 |
| `componentList` | 画布上的所有组件 | 每个拖入画布的图表/文本/装饰等组件实例 |

---

## 2. 画布配置模块 (editCanvasConfig)

**对应功能：设计右侧 【画布设置】 面板**

这一模块控制大屏的整体外观和行为

### 2.1 项目信息

```json
{
    "projectName": "大屏名称"
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `projectName` | `string` | `undefined` | 大屏项目名称，显示在浏览器标题栏 |

### 2.2 画布尺寸

```json
{
  "width": 1920,
  "height": 1080
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `width` | `number` | `1920` | 画布宽度(px)，设计时的参考分辨率 |
| `height` | `number` | `1080` | 画布高度(px) |

### 2.3 背景设置

```json
{
    "background": "rgba()",
    "backgroundImage": null,
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `background` | `string` | `undefined` | 背景色（CSS 颜色值） |
| `backgroundImage` | `string\|null` | `undefined` | 背景图片 URL |

## 3.全局请求配置模块（requestGlobalConfig）

**对应功能：设计器右侧 【数据请求】面板中的 【全局配置】

这一模块管理整个大屏的数据请求基础设施

### 3.1 请求源与轮询

```json
{
    "requestOriginUrl": "https://xxxx.xxx.com",
    "requestInterval": 30,
    "requestIntervalUnit": "second"
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `requestOriginUrl` | `string` | `''` | 请求源地址（base URL），所有组件请求的前缀 |
| `requestInterval` | `number` | `30` | 全局轮询间隔数值 |
| `requestIntervalUnit` | `string` | `'second'` | 轮询时间单位：`'second'`(秒)、`'minute'`(分)、`'hour'`(时)、`'day'`(天) |

### 3.2 全局请求参数

```json
{
    "requestParams": {
        "Params": { "TOKEN": "XXX" },
        "Header": { "Authorization": "Bearer xxx" },
        "Bodu": {
            "form-data": { "key": "value" },
            "json": "",
            "xml": ""
        }
    }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `requestParams.Params` | `object` | URL 查询参数（Query String），键值对 |
| `requestParams.Header` | `object` | 请求头（Request Header），键值对 |
| `requestParams.Body` | `object` | 请求体，支持四种格式：`form-data`、`x-www-form-urlencoded`、`json`、`xml` |

## 4. 组件列表模块 (componentList)

**对应功能，画布上的每一个组件**

`componentList` 是一个数组，按 z-index 排序（索引 0 = 底层， 末尾 = 最顶层）。每个元素可以是**普通组件**或**成组组件**。

### 4.1 组件元数据（chartConfig）

**对应功能：组件本身的类型注册信息**

```json
{
  "chartConfig": {
    "key": "LineCommon",
    "chartKey": "VLineCommon",
    "conKey": "VCLineCommon",
    "title": "折线图",
    "category": "Lines",
    "categoryName": "折线图",
    "package": "Charts",
    "chartFrame": "echarts",
    "image": "line.png"
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `key` | `string` | 组件标识（如 `'LineCommon'`、`'TextCommon'`） |
| `chartKey` | `string` | 画布渲染时的 Vue 组件名（如 `'VLineCommon'`） |
| `conKey` | `string` | 右侧配置面板的 Vue 组件名（如 `'VCLineCommon'`） |
| `title` | `string` | 显示名称（如 `'折线图'`、`'文本'`） |
| `category` | `string` | 分类 key（如 `'Lines'`、`'Texts'`） |
| `categoryName` | `string` | 分类显示名称 |
| `package` | `string` | 所属包：`'Charts'`(图表)、`'VChart'`(VChart)、`'Tables'`(列表)、`'Informations'`(信息)、`'Decorates'`(小组件)、`'Photos'`(图片)、`'Icons'`(图标) |
| `chartFrame` | `string` | 渲染框架：`'echarts'`(ECharts)、`'VChart'`、`'naiveUI'`(UI组件)、`'common'`(自定义)、`'static'`(静态无数据) |
| `image` | `string` | 组件预览图文件名 |
| `redirectComponent` | `string` | （可选）重定向路径，用于图片/图标等特殊组件 |
| `dataset` | `any` | （可选）组件预设数据集 |
| `disabled` | `boolean` | （可选）是否禁用拖拽生成 |
| `icon` | `string` | （可选）组件图标名 |

### 4.2 位置与尺寸 (attr)

**对应功能：画布上拖动组件的位置和大小**

```json
{
  "attr": {
    "x": 50,
    "y": 50,
    "w": 600,
    "h": 400,
    "offsetX": 0,
    "offsetY": 0,
    "zIndex": 0
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `x` | `number` | `50` | 组件在画布上的左上角 X 坐标(px) |
| `y` | `number` | `50` | 组件在画布上的左上角 Y 坐标(px) |
| `w` | `number` | `500` | 组件宽度(px) |
| `h` | `number` | `300` | 组件高度(px) |
| `offsetX` | `number` | `0` | 拖拽时的偏移 X（用于计算，不持久化影响位置） |
| `offsetY` | `number` | `0` | 拖拽时的偏移 Y |
| `zIndex` | `number` | 按数组顺序 | 层级。`-1` 表示待分配，实际由数组索引决定索引 0 为最底层 |

### 4.3 滤镜与动画 (styles)

**对应功能：组件样式面板中的「滤镜」和「动画」**

```json
{
  "styles": {
    "filterShow": false,
    "opacity": 1,
    "saturate": 1,
    "contrast": 1,
    "hueRotate": 0,
    "brightness": 1,
    "blendMode": "normal",
    "animations": ["fadeIn", "slideInLeft"]
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `filterShow` | `boolean` | `false` | 是否启用滤镜 |
| `opacity` | `number` | `1` | 不透明度 |
| `saturate` | `number` | `1` | 饱和度倍数 |
| `contrast` | `number` | `1` | 对比度倍数 |
| `hueRotate` | `number` | `0` | 色相旋转角度(deg) |
| `brightness` | `number` | `1` | 亮度倍数 |
| `blendMode` | `string` | `'normal'` | 混合模式（同全局滤镜的可选值） |
| `animations` | `string[]` | `[]` | CSS 动画名称数组，可叠加多个动画效果 |

### 4.4 组件状态 (status)

**对应功能：右键菜单中的「锁定」和「隐藏」**

```json
{
  "status": {
    "lock": false,
    "hide": false
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `lock` | `boolean` | `false` | `true`=锁定，不可选中、拖动、编辑 |
| `hide` | `boolean` | `false` | `true`=隐藏，在编辑和预览中均不可见 |

### 4.5 数据过滤 (filter)

**对应功能：组件数据配置面板中的「数据过滤」**

```json
{
  "filter": "data.filter(item => item.value > 100)"
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `filter` | `string` | `undefined` | 一个 JavaScript 表达式字符串，对请求返回的数据进行过滤处理。传入变量名为 `data` |

### 4.6 预览行为 (preview)

**对应功能：组件样式面板中的「预览超出隐藏」**

```json
{
  "preview": {
    "overFlowHidden": false
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `preview.overFlowHidden` | `boolean` | `false` | 预览时是否隐藏超出组件区域的内容 |

### 4.7 事件系统（events）

#### 4.7.1 基础时间（baseEvent）

**对应功能：组件交互面板中的【基础事件】**

```json
{
  "events": {
    "baseEvent": {
      "click": "console.log('click', params)",
      "dblclick": "handleDblClick(params)",
      "mouseenter": "handleMouseEnter(params)",
      "mouseleave": "handleMouseLeave(params)"
    }
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `click` | `string` | `undefined` | 点击事件，值为 JS 函数体字符串 |
| `dblclick` | `string` | `undefined` | 双击事件 |
| `mouseenter` | `string` | `undefined` | 鼠标移入事件 |
| `mouseleave` | `string` | `undefined` | 鼠标移出事件 |

> 事件函数中的 `params` 变量包含图表传递的当前数据参数。可调用全局函数或自定义逻辑。

#### 4.7.2 高级事件 (advancedEvents)

**对应功能：组件交互面板中的「高级事件」**

```json
{
  "events": {
    "advancedEvents": {
      "vnodeMounted": "console.log('组件已挂载')",
      "vnodeBeforeMount": "console.log('组件即将挂载')"
    }
  }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `vnodeMounted` | `string` | `undefined` | Vue `onMounted` 生命周期钩子 |
| `vnodeBeforeMount` | `string` | `undefined` | Vue `onBeforeMount` 生命周期钩子 |

#### 4.7.3 交互事件 (interactEvents)

**对应功能：组件交互面板中的「组件间交互」**

```json
{
  "events": {
    "interactEvents": [
      {
        "interactOn": "click",
        "interactComponentId": "目标组件UUID",
        "interactFn": {
          "setData": "params.data",
          "setOption": "{ series: [{ data: params.data }] }"
        }
      }
    ]
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `interactOn` | `string` | 触发方式：`'click'`(点击触发)、`'change'`(数据变化触发) |
| `interactComponentId` | `string` | 目标组件的 `id`，即要与哪个组件交互 |
| `interactFn` | `object` | 函数映射表。键为目标组件的方法名，值为 JS 表达式字符串（`params` 为源组件传递的参数） |

### 4.8 交互动作配置 (interactActions)

**对应功能：被交互组件定义「我能提供什么交互」**

```json
{
  "interactActions": [
    {
      "interactType": "click",
      "interactName": "点击高亮",
      "componentEmitEvents": {
        "highlight": [
          { "value": "series_1", "label": "系列1" },
          { "value": "series_2", "label": "系列2" }
        ]
      }
    }
  ]
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `interactType` | `string` | 交互触发类型：`'click'`、`'change'` |
| `interactName` | `string` | 交互名称，显示在组件交互配置的选择器中 |
| `componentEmitEvents` | `object` | 该组件可向外暴露的事件/方法列表。键为方法名，值为可选参数列表 |

> 这是 **被交互组件** 的声明，告诉其他组件「我能响应这些交互」。其他组件在 `events.interactEvents` 中引用它。

### 4.9 数据请求配置（request）

**对应功能: 组件数据配置面板中的【请求配置】**

分为三种数据来源模式：

#### 4.9.1 静态数据模式

```json
{
    "request": {
        "requestDataType": 0,
        "requestParams"： { "Body": { ... }, "Header": {}, "Params": {} },
        "requestIntervalUnit": "second"
    }
}
```

适用组件 `option.dataset` 中的静态数据，不发起请求。

#### 4.9.2 AJAX 请求模式

```json
{
    "request": {
        "requestDataType": 1,
        "requestHttpType"： "get",
        "requestUrl": "/api/data",
        "requestInterval": 10,
        "requestIntervalUnit": "second",
        "requestContentType": 0,
        "requestParamsBodyType": "none",
        "requestSQLContent": { "sql": "select * from where" },
        "requestParams"： {
            "Body": { "form-data": {}, "x-www-form-urlencoded": {}, "json": "", "xml": ""},
            "Header": { "Authorization": "Bearer xxx" },
            "Params": { "page": 1 }
        },
    }
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `requestDataType` | `number` | `0` | 数据来源：`0`=静态数据、`1`=AJAX 请求、`2`=数据池 |
| `requestHttpType` | `string` | `'get'` | HTTP 方法：`'get'`、`'post'`、`'put'`、`'delete'`、`'patch'` |
| `requestUrl` | `string` | `''` | API 路径（与 `requestOriginUrl` 拼接为完整 URL） |
| `requestInterval` | `number` | `null` | 组件级别轮询间隔，覆盖全局配置 |
| `requestIntervalUnit` | `string` | `'second'` | 轮询时间单位 |
| `requestContentType` | `number` | `0` | 请求内容类型：`0`=普通请求、`1`=SQL 请求 |
| `requestParamsBodyType` | `string` | `'none'` | 请求体格式：`'none'`、`'form-data'`、`'x-www-form-urlencoded'`、`'json'`、`'xml'` |
| `requestSQLContent.sql` | `string` | `'select * from  where'` | SQL 查询语句（仅 `requestContentType=1` 时生效） |
| `requestParams` | `object` | 空对象 | 请求参数，结构与全局配置中的 `requestParams` 一致 |

### 4.10 图表配置 （option）

**对应能力：组件的具体数据与像是配置**

`option` 是组件最核心的部分，其结构因组件类型存在差异

#### ECharts 图表组件

```json
{
    "option": {
        "tooltip": { "trigger": "axis" },
        "legend": { "data": [ "销量" ] },
        "xAxis": { "type": "category", "data": ["Mon", "Tue", "Wed"] },
        "yAxis": { "type": "value" },
        "dataset": {
            "dimensions": ["product", "销量"],
            "source": [["Mon", 129], ["Tue", 200], ["Wed", 150]]
        },
        "series": [
            { "type": "line", "smooth": true, "name": "销量" }
        ]
    }
}
```

#### 文本组件

```json
{
    "option": {
        "dataset": "要显示的文本内容",
        "link": "",
        "linkHead": "http://",
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

#### 图片组件

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

### 4.11 图表样式配置 (chartStyle)

**对应功能：右侧面板中的图表样式配置（主题预设、标题、图例、坐标轴、系列、提示框等）**

`chartStyle` 是 ECharts 图表组件的样式配置，控制图表的视觉外观。仅对 `chartFrame: 'echarts'` 的组件生效。

```json
{
  "chartStyle": {
    "themeName": "catppuccin",
    "grid": { "top": 10, "bottom": 30, "left": 10, "right": 10 },
    "titleStyle": {
      "show": true,
      "fontSize": 14,
      "color": "#cdd6f4",
      "left": "center",
      "top": 8
    },
    "legend": {
      "show": true,
      "orient": "horizontal",
      "left": "center",
      "top": 38,
      "fontSize": 11,
      "icon": "circle",
      "textColor": "#cdd6f4"
    },
    "xAxis": {
      "show": true,
      "name": "",
      "labelFontSize": 11,
      "labelRotate": 0,
      "lineColor": "#45475a",
      "labelColor": "#a6adc8"
    },
    "yAxis": {
      "show": true,
      "name": "",
      "labelFontSize": 11,
      "min": null,
      "max": null,
      "splitLineShow": true,
      "splitLineColor": "#313244",
      "labelColor": "#a6adc8"
    },
    "series": {
      "smooth": true,
      "symbol": "circle",
      "symbolSize": 8,
      "barWidth": "50%",
      "barBorderRadius": 4,
      "lineWidth": 3,
      "showArea": true,
      "showLabel": true,
      "labelFontSize": 11,
      "color": "#89b4fa",
      "colorEnd": "#45475a",
      "areaOpacityStart": 0.4,
      "areaOpacityEnd": 0.02,
      "labelColor": "#cdd6f4"
    },
    "tooltip": {
      "show": true,
      "trigger": "axis",
      "backgroundColor": "#313244",
      "borderColor": "#45475a",
      "textColor": "#cdd6f4"
    },
    "backgroundColor": "transparent"
  }
}
```

#### themeName - 主题预设

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `themeName` | `string` | `'catppuccin'` | 当前主题名称。可选值：`'catppuccin'`、`'dracula'`、`'solarized'`、`'nord'`、`'onedark'`、`'gruvbox'`、`'tokyonight'`、`'rosepine'` |

> 切换主题会批量更新所有组件的颜色配置。

#### grid - 网格间距

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `grid.top` | `number` | `10` | 网格顶部间距 (px) |
| `grid.bottom` | `number` | `30` | 网格底部间距 (px) |
| `grid.left` | `number` | `10` | 网格左侧间距 (px) |
| `grid.right` | `number` | `10` | 网格右侧间距 (px) |

#### titleStyle - 标题样式

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `titleStyle.show` | `boolean` | `true` | 是否显示标题 |
| `titleStyle.fontSize` | `number` | `14` | 标题字号 |
| `titleStyle.color` | `string` | `'#cdd6f4'` | 标题颜色 |
| `titleStyle.left` | `number \| string` | `'center'` | 水平位置。预设值：`'left'`/`'center'`/`'right'`；或 px 数值；或百分比字符串如 `'50%'` |
| `titleStyle.top` | `number \| string` | `8` | 垂直位置。预设值：`'top'`/`'middle'`/`'bottom'`；或 px 数值；或百分比字符串如 `'50%'` |

> **定位互斥规则**：`left` 和 `right` 不能同时生效（`left` 优先），`top` 和 `bottom` 不能同时生效（`top` 优先）。因此只保留 `left` 和 `top`。

#### legend - 图例样式

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `legend.show` | `boolean` | `true` | 是否显示图例 |
| `legend.orient` | `'horizontal' \| 'vertical'` | `'horizontal'` | 排列方向 |
| `legend.left` | `number \| string` | `'center'` | 水平位置。预设值：`'left'`/`'center'`/`'right'`；或 px 数值；或百分比字符串如 `'50%'` |
| `legend.top` | `number \| string` | `38` | 垂直位置。预设值：`'top'`/`'middle'`/`'bottom'`；或 px 数值；或百分比字符串如 `'50%'` |
| `legend.fontSize` | `number` | `11` | 图例字号 |
| `legend.icon` | `'circle' \| 'rect' \| 'roundRect' \| 'triangle' \| 'diamond'` | `'circle'` | 图标形状 |
| `legend.textColor` | `string` | `'#cdd6f4'` | 图例文字颜色 |

#### xAxis - X 轴配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `xAxis.show` | `boolean` | `true` | 是否显示 X 轴 |
| `xAxis.name` | `string` | `''` | X 轴名称 |
| `xAxis.labelFontSize` | `number` | `11` | 轴标签字号 |
| `xAxis.labelRotate` | `number` | `0` | 轴标签旋转角度 (deg) |
| `xAxis.lineColor` | `string` | `'#45475a'` | 轴线颜色 |
| `xAxis.labelColor` | `string` | `'#a6adc8'` | 轴标签颜色 |

#### yAxis - Y 轴配置

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `yAxis.show` | `boolean` | `true` | 是否显示 Y 轴 |
| `yAxis.name` | `string` | `''` | Y 轴名称 |
| `yAxis.labelFontSize` | `number` | `11` | 轴标签字号 |
| `yAxis.min` | `number \| null` | `null` | Y 轴最小值（`null` 为自动） |
| `yAxis.max` | `number \| null` | `null` | Y 轴最大值（`null` 为自动） |
| `yAxis.splitLineShow` | `boolean` | `true` | 是否显示分割线 |
| `yAxis.splitLineColor` | `string` | `'#313244'` | 分割线颜色 |
| `yAxis.labelColor` | `string` | `'#a6adc8'` | 轴标签颜色 |

#### series - 系列样式

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `series.smooth` | `boolean` | `true` | 折线是否平滑（仅折线图） |
| `series.symbol` | `string` | `'circle'` | 标记图形（仅折线图） |
| `series.symbolSize` | `number` | `8` | 标记大小（仅折线图） |
| `series.barWidth` | `number \| string` | `'50%'` | 柱条宽度（仅柱状图） |
| `series.barBorderRadius` | `number` | `4` | 柱条圆角半径（仅柱状图） |
| `series.lineWidth` | `number` | `3` | 折线宽度（仅折线图） |
| `series.showArea` | `boolean` | `true` | 是否显示面积填充（仅折线图） |
| `series.showLabel` | `boolean` | `true` | 是否显示数据标签 |
| `series.labelFontSize` | `number` | `11` | 数据标签字号 |
| `series.color` | `string` | `'#89b4fa'` | 系列主色。柱状图为渐变起始色，折线图为线条和数据点颜色 |
| `series.colorEnd` | `string` | `'#45475a'` | 渐变结束色（仅柱状图） |
| `series.colorList` | `string[]` | `['#89b4fa', '#f38ba8', '#a6e3a1', '#fab387', '#cba6f7', '#94e2d5', '#f9e2af', '#74c7ec']` | 多色调色板（最多10色）。非空时覆盖 color/colorEnd，ECharts 自动为每个系列分配颜色 |
| `series.areaOpacityStart` | `number` | `0.4` | 面积填充起始透明度 0-1（仅折线图，showArea=true 时生效） |
| `series.areaOpacityEnd` | `number` | `0.02` | 面积填充结束透明度 0-1（仅折线图，showArea=true 时生效） |
| `series.labelColor` | `string` | `'#cdd6f4'` | 数据标签颜色 |
| `series.pieRadius` | `number` | `0` | 饼图内半径百分比，0=实心饼图，>0=环形图（仅饼图） |
| `series.pieRoseType` | `boolean` | `false` | 南丁格尔玫瑰模式（仅饼图） |
| `series.pieLabelPosition` | `'inside' \| 'outside' \| 'center'` | `'outside'` | 标签位置（仅饼图） |

#### tooltip - 提示框

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tooltip.show` | `boolean` | `true` | 是否显示提示框 |
| `tooltip.trigger` | `'axis' \| 'item' \| 'none'` | `'axis'` | 触发方式 |
| `tooltip.backgroundColor` | `string` | `'#313244'` | 提示框背景色 |
| `tooltip.borderColor` | `string` | `'#45475a'` | 提示框边框色 |
| `tooltip.textColor` | `string` | `'#cdd6f4'` | 提示框文字颜色 |

#### 其他

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `backgroundColor` | `string` | `'transparent'` | 图表背景色 |

### 4.12 分组组件

**对应能力：画布上的【成组】操作**

当一个组件 `isGroup: true` 时，它就是一个容器组，内部包含多个子组件

```json
{
    "id": "group-uuid",
    "isGroup": true,
    "key": "group",
    "charConfig": {
        "key": "group",
        "chartKey": "group",
        "title": "分组",
        "chartFrame": "common"
    },
    "attr": {
        "x": 100,
        "y": 100,
        "w": 600,
        "h": 500,
        "offsetX": 0,
        "offsetY": 0,
        "zIndex": 1
    },
    "option": {},
    "groupList": [
        {
          "id": "child-uuid-1",
          "key": "TextCommon",
          "attr": { "x": 0, "y": 0, "w": 200, "h": 50, ... },
          "option": { "dataset": "组内标题" }
        },
        {
          "id": "child-uuid-2",
          "key": "Decorate3",
          "attr": { "x": 0, "y": 60, "w": 600, "h": 440, ... }
        }
    ]
}
```

| 字段 | 说明 |
|------|------|
| `isGroup` | 固定为 `true` |
| `key` | 固定为 `'group'` |
| `groupList` | 子组件数组。子组件的 `attr.x/y` 是**相对于组容器左上角**的偏移量 |
| `attr.w/h` | 由系统自动计算为子组件的最小包围盒尺寸 |
| `attr.x/y` | 组容器在画布上的位置 |
| `option` | 固定空对象 `{}` |
| `chartConfig` | 固定为 group 元信息 |

> 将多个组件成组后，它们可以一起拖动、缩放。取消成组时会恢复子组件的绝对坐标。

---