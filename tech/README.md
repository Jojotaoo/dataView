# 可视化大屏搭建系统 - 技术方案

## 技术栈

| 层面 | 技术 | 说明 |
|------|------|------|
| 框架 | Vue 3 (Composition API) | 响应式 UI |
| 状态管理 | Pinia | 全局状态管理 |
| 构建工具 | Vite | 开发/构建 |
| 图表 | ECharts | 柱状图渲染 |
| 语言 | TypeScript | 类型安全 |

## 项目结构

```
src/
├── main.ts                        # 入口，挂载 Pinia + App
├── App.vue                        # 主布局，三栏 + 预览控制
├── style.css                      # 全局样式
├── types/index.ts                 # 类型定义
├── stores/dashboard.ts            # Pinia store
├── vite-env.d.ts                  # Vue SFC 类型声明
└── components/
    ├── LeftPanel.vue              # 左侧组件库（拖拽源）
    ├── CanvasArea.vue             # 中间画布（拖放目标 + 编辑）
├── RightPanel.vue             # 右侧配置面板（属性/页面配置/Schema）
├── PreviewRenderer.vue        # 全屏预览渲染器
    └── charts/
        └── BarChart.vue           # ECharts 柱状图
```

## 核心架构

### 三栏布局

```
┌─────────────────────────────────────────────────┐
│  Header (标题 + 预览按钮)                        │
├──────────┬──────────────────────┬───────────────┤
│  Left    │     Canvas           │   Right       │
│  Panel   │     Area             │   Panel       │
│          │                     │               │
│ 组件库   │  拖放 → 编辑 → 移动  │ 属性/页面/Schema│
│ 拖拽源   │                     │               │
├──────────┴──────────────────────┴───────────────┤
│              全屏预览模式 (独立渲染器)            │
└─────────────────────────────────────────────────┘
```

### 数据流

```
LeftPanel                    CanvasArea
   │  click/drag                │  drop/move/select
   ▼                           ▼
┌────────────────────────────────────────────────┐
│              Pinia Store (dashboard.ts)         │
│                                                │
│  components: CanvasComponent[]                 │
│  selectedId: string | null                     │
│  pageConfig: PageConfig                        │
│  componentDefinitions: ComponentDefinition[]   │
│                                                │
│  actions: addComponent/removeComponent         │
│          selectComponent/updateComponentProp   │
│          updateComponentPosition               │
│          updatePageConfig                      │
└────────────────────────────────────────────────┘
   │                           │
   ▼                           ▼
RightPanel                 PreviewRenderer
 属性/页面/Schema Tab      读取 schema JSON 渲染
```

### Schema 数据格式

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
      "props": {
        "title": "柱状图",
        "bgColor": "#1e1e2e",
        "data": [
          { "label": "一月", "value": 120 }
        ]
      },
      "position": { "x": 50, "y": 50 },
      "size": { "width": 400, "height": 300 }
    }
  ]
}
```

## 组件注册机制

1. 在 `stores/dashboard.ts` 的 `componentDefinitions` 数组中注册组件定义
2. 每个定义包含：type、name、icon、props 配置、defaultProps
3. 左侧面板自动遍历定义列表渲染拖拽项
4. CanvasArea 根据 `comp.type` 动态分发到对应的渲染组件
5. PreviewRenderer 读取 schema 中的 `comp.type` 同样分发渲染

## 页面配置 (PageConfig)

- 存储在 Pinia store 的 `pageConfig` 对象中
- 包含：`width`、`height`、`bgColor`、`bgImage`
- 画布尺寸和背景跟随页面配置
- 预览模式同样读取 `pageConfig` 渲染背景
- Schema 中结构化为 `pageConfig` 字段

## 预览渲染器 (PreviewRenderer)

- 独立于编辑态，仅依赖 schema JSON 数据
- 全屏 fixed 覆盖层，z-index: 1000
- 组件不带编辑装饰（无边框、标题栏、删除按钮）
- 退出方式：点击退出按钮 或 Esc 键
- 支持扩展：未来可独立部署为纯展示页面

## 扩展方式

### 新增图表类型

1. 在 `src/components/charts/` 下新建组件
2. 在 `stores/dashboard.ts` 的 `componentDefinitions` 中添加定义
3. 在 `CanvasArea.vue` 的模板中添加 `v-if` 分支
4. 在 `PreviewRenderer.vue` 的模板中添加 `v-if` 分支
