# Store 拆分方案

> 将单一 dashboard store 按职责拆分为多个独立 store，提高可读性和可维护性

---

## 目录

1. [当前问题分析](#一当前问题分析)
2. [拆分方案](#二拆分方案)
3. [依赖关系](#三依赖关系)
4. [详细实现](#四详细实现)
5. [迁移策略](#五迁移策略)

---

## 一、当前问题分析

### 1.1 文件概况

- **文件**: `src/stores/dashboard.ts`
- **行数**: 499 行
- **函数数量**: 30+ 个
- **状态数量**: 5 个 ref

### 1.2 职责分布

| 职责 | 函数数量 | 相关函数 |
|------|----------|----------|
| 组件管理 | 6 | `addComponent`, `removeComponent`, `findComponent`, `moveComponentDelta`, `resizeComponentDelta` |
| 选区管理 | 5 | `selectComponent`, `toggleSelectComponent`, `selectComponentsByRect`, `clearSelection` |
| 画布配置 | 2 | `editCanvasConfig`, `updateCanvasConfig` |
| 全局请求配置 | 5 | `requestGlobalConfig`, `updateRequestGlobalConfig`, `addDataPond`, `updateDataPond`, `removeDataPond` |
| 组件属性更新 | 8 | `updateComponentProp`, `updateComponentProps`, `updateComponentPosition`, `updateComponentSize`, `updateComponentAttr`, `updateComponentStyle`, `updateComponentOption`, `updateComponentFilter` |
| 图表样式 | 3 | `updateChartStyle`, `applyThemeToAll`, `saveCustomTheme` |
| 数据集操作 | 4 | `updateOptionDatasetDimension`, `updateOptionDatasetCell`, `addOptionDatasetRow`, `removeOptionDatasetRow` |
| 分组操作 | 2 | `groupSelectedComponents`, `ungroupComponent` |

### 1.3 核心问题

1. **职责混杂**: 画布配置、组件管理、选区管理、分组操作混在一起
2. **函数过多**: 30+ 个函数，难以快速理解每个函数的作用
3. **状态耦合**: 所有状态共享一个 store，修改某个功能可能影响其他功能
4. **可测试性差**: 无法独立测试某个功能模块

---

## 二、拆分方案

### 2.1 文件结构

```
stores/
├── index.ts                    # 统一导出
├── canvas.ts                   # 画布配置 + 全局请求配置
├── components.ts               # 组件管理 + 属性更新 + 数据集操作
├── selection.ts                # 选区管理
├── grouping.ts                 # 分组操作（依赖 components + selection）
└── utils.ts                    # 工具函数（保持不变）
```

### 2.2 各 Store 职责

#### `useCanvasStore` - 画布配置

**职责**: 管理画布级别配置和全局请求配置

| 状态/函数 | 类型 | 说明 |
|-----------|------|------|
| `config` | ref | 画布配置（宽高、背景、主题等） |
| `updateConfig` | function | 更新画布配置 |
| `requestConfig` | ref | 全局请求配置 |
| `updateRequestConfig` | function | 更新全局请求配置 |
| `addDataPond` | function | 添加数据池 |
| `updateDataPond` | function | 更新数据池 |
| `removeDataPond` | function | 删除数据池 |
| `saveCustomTheme` | function | 保存自定义主题 |

#### `useComponentStore` - 组件管理

**职责**: 管理组件的增删改查、属性更新、样式配置

| 状态/函数 | 类型 | 说明 |
|-----------|------|------|
| `components` | ref | 组件列表 |
| `addComponent` | function | 添加组件 |
| `removeComponent` | function | 删除组件 |
| `findComponent` | function | 查找组件 |
| `updateProps` | function | 更新组件 props |
| `updatePosition` | function | 更新组件位置 |
| `updateSize` | function | 更新组件尺寸 |
| `updateAttr` | function | 更新组件属性 |
| `updateStyle` | function | 更新组件样式 |
| `updateOption` | function | 更新组件数据 |
| `updateFilter` | function | 更新数据过滤 |
| `updateRequest` | function | 更新请求配置 |
| `updateChartStyle` | function | 更新图表样式 |
| `applyThemeToAll` | function | 应用主题到所有组件 |
| `updateDatasetDimension` | function | 更新数据维度 |
| `updateDatasetCell` | function | 更新数据单元格 |
| `addDatasetRow` | function | 添加数据行 |
| `removeDatasetRow` | function | 删除数据行 |
| `moveComponent` | function | 移动组件 |
| `resizeComponent` | function | 缩放组件 |
| `toggleStatus` | function | 切换锁定/隐藏状态 |
| `togglePreviewOverflow` | function | 切换预览溢出隐藏 |
| `toggleFilterShow` | function | 切换滤镜显示 |

#### `useSelectionStore` - 选区管理

**职责**: 管理组件选区状态

| 状态/函数 | 类型 | 说明 |
|-----------|------|------|
| `selectedId` | ref | 当前选中的组件 ID |
| `selectedIds` | ref | 多选的组件 ID 列表 |
| `selectedComponent` | computed | 当前选中的组件对象 |
| `select` | function | 选中组件 |
| `toggleSelect` | function | 切换选中状态 |
| `selectByRect` | function | 框选组件 |
| `clear` | function | 清除选区 |

#### `useGroupStore` - 分组操作

**职责**: 管理组件分组和取消分组

| 状态/函数 | 类型 | 说明 |
|-----------|------|------|
| `groupSelected` | function | 将选中组件分组 |
| `ungroup` | function | 取消分组 |

---

## 三、依赖关系

```
useCanvasStore (无依赖)
    ↓
useComponentStore (依赖 canvasStore)
    ↓
useSelectionStore (依赖 componentStore)
    ↓
useGroupStore (依赖 componentStore + selectionStore)
```

### 3.1 依赖说明

| Store | 依赖 | 原因 |
|-------|------|------|
| `canvasStore` | 无 | 独立的配置管理 |
| `componentStore` | `canvasStore` | 创建组件时可能需要读取画布配置 |
| `selectionStore` | `componentStore` | `selectedComponent` 需要从组件列表中查找 |
| `groupStore` | `componentStore` + `selectionStore` | 分组操作需要访问组件列表和选区状态 |

---

## 四、详细实现

### 4.1 `stores/canvas.ts`

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { EditCanvasConfigType, RequestGlobalConfigType, DataPondItem } from '../types'
import type { ChartThemePreset } from '../config/chartThemes'

export const useCanvasStore = defineStore('canvas', () => {
  // === 画布配置 ===
  const config = ref<EditCanvasConfigType>({
    projectName: '可视化大屏',
    width: 1920,
    height: 1080,
    background: '#11111b',
    backgroundImage: null,
    filterShow: false,
    opacity: 1,
    saturate: 1,
    contrast: 1,
    hueRotate: 0,
    brightness: 1,
    blendMode: 'normal',
    customTheme: null,
  })

  function updateConfig(partial: Partial<EditCanvasConfigType>) {
    Object.assign(config.value, partial)
  }

  function saveCustomTheme(preset: ChartThemePreset) {
    config.value.customTheme = preset
  }

  // === 全局请求配置 ===
  const requestConfig = ref<RequestGlobalConfigType>({
    requestOriginUrl: '',
    requestInterval: 30,
    requestIntervalUnit: 'second',
    requestHeader: {},
    requestDataPond: [],
  })

  function updateRequestConfig(partial: Partial<RequestGlobalConfigType>) {
    Object.assign(requestConfig.value, partial)
  }

  function addDataPond(item: DataPondItem) {
    requestConfig.value.requestDataPond.push(item)
  }

  function updateDataPond(id: string, item: Partial<DataPondItem>) {
    const pond = requestConfig.value.requestDataPond.find(p => p.dataPondId === id)
    if (pond) Object.assign(pond, item)
  }

  function removeDataPond(id: string) {
    const idx = requestConfig.value.requestDataPond.findIndex(p => p.dataPondId === id)
    if (idx >= 0) requestConfig.value.requestDataPond.splice(idx, 1)
  }

  return {
    config,
    updateConfig,
    saveCustomTheme,
    requestConfig,
    updateRequestConfig,
    addDataPond,
    updateDataPond,
    removeDataPond,
  }
})
```

### 4.2 `stores/components.ts`

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CanvasComponent, RequestConfigType } from '../types'
import { DEFAULT_ATTR, DEFAULT_STYLES, DEFAULT_STATUS, DEFAULT_PREVIEW, DEFAULT_CHART_STYLE } from '../types'
import { useIdGenerator } from '../composables/useId'
import { componentDefinitions } from '../config/componentDefinitions'
import { findInGroupList, removeFromGroupList } from './utils'
import { applyTheme, type ChartThemePreset } from '../config/chartThemes'

export const useComponentStore = defineStore('components', () => {
  const components = ref<CanvasComponent[]>([])
  const generateId = useIdGenerator()

  // === 基础操作 ===

  function addComponent(key: string) {
    const def = componentDefinitions.find(d => d.key === key)
    if (!def) return

    const id = generateId()
    const offset = components.value.length * 30
    const comp: CanvasComponent = {
      id,
      key: def.key,
      props: structuredClone(def.defaultProps),
      chartConfig: {
        key: def.key,
        chartKey: def.chartKey,
        conKey: def.conKey,
        title: def.title,
        category: def.category,
        categoryName: def.categoryName,
        package: def.package,
        chartFrame: def.chartFrame,
        image: def.image,
        icon: def.icon,
      },
      attr: {
        ...DEFAULT_ATTR,
        x: 50 + offset,
        y: 50 + offset,
        w: 400,
        h: 320,
        zIndex: components.value.length,
      },
      styles: { ...DEFAULT_STYLES },
      status: { ...DEFAULT_STATUS },
      preview: { ...DEFAULT_PREVIEW },
      option: structuredClone(def.defaultOption),
      chartStyle: structuredClone(DEFAULT_CHART_STYLE),
      request: {
        requestDataType: 0,
        requestHttpType: 'get',
        requestUrl: '',
        requestInterval: null,
        requestIntervalUnit: 'second',
        requestParamsBodyType: 'none',
        requestParams: {
          Params: {},
          Header: {},
          Body: {
            'form-data': {},
            'x-www-form-urlencoded': {},
            json: '',
            xml: '',
          },
        },
      },
    }
    components.value.push(comp)
    return comp
  }

  function removeComponent(id: string) {
    const index = components.value.findIndex(c => c.id === id)
    if (index !== -1) {
      components.value.splice(index, 1)
      return true
    }
    for (const group of components.value) {
      if (group.groupList && removeFromGroupList(group.groupList, id)) {
        return true
      }
    }
    return false
  }

  function findComponent(id: string): CanvasComponent | null {
    for (const comp of components.value) {
      if (comp.id === id) return comp
      if (comp.groupList) {
        const found = findInGroupList(comp.groupList, id)
        if (found) return found as CanvasComponent
      }
    }
    return null
  }

  // === 属性更新 ===

  function updateProps(id: string, props: Record<string, any>) {
    const comp = findComponent(id)
    if (comp) comp.props = { ...comp.props, ...props }
  }

  function updatePosition(id: string, x: number, y: number) {
    const comp = findComponent(id)
    if (comp) {
      comp.attr.x = x
      comp.attr.y = y
    }
  }

  function updateSize(id: string, w: number, h: number) {
    const comp = findComponent(id)
    if (comp) {
      comp.attr.w = w
      comp.attr.h = h
    }
  }

  function updateAttr(id: string, key: keyof typeof DEFAULT_ATTR, value: number) {
    const comp = findComponent(id)
    if (comp) (comp.attr as any)[key] = value
  }

  function updateStyle(id: string, key: string, value: any) {
    const comp = findComponent(id)
    if (comp) (comp.styles as any)[key] = value
  }

  function updateOption(id: string, key: string, value: any) {
    const comp = findComponent(id)
    if (comp) (comp.option as any)[key] = value
  }

  function updateFilter(id: string, value: string) {
    const comp = findComponent(id)
    if (comp) comp.filter = value
  }

  function updateRequest(id: string, request: Partial<RequestConfigType>) {
    const comp = findComponent(id)
    if (comp && comp.request) Object.assign(comp.request, request)
  }

  // === 图表样式 ===

  function updateChartStyle(id: string, path: string, value: any) {
    const comp = findComponent(id)
    if (!comp || !comp.chartStyle) return
    const keys = path.split('.')
    let target: any = comp.chartStyle
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]]
    }
    target[keys[keys.length - 1]] = value
  }

  function applyThemeToAll(preset: ChartThemePreset) {
    function applyToComp(comp: CanvasComponent) {
      if (comp.chartStyle) {
        const updated = applyTheme(comp.chartStyle, preset)
        Object.assign(comp.chartStyle, updated)
      }
      comp.groupList?.forEach(child => {
        if (child.chartStyle) {
          const updated = applyTheme(child.chartStyle, preset)
          Object.assign(child.chartStyle, updated)
        }
      })
    }
    components.value.forEach(applyToComp)
  }

  // === 数据集操作 ===

  function updateDatasetDimension(id: string, index: number, value: string) {
    const comp = findComponent(id)
    if (comp) {
      const opt = comp.option as any
      const dims = opt.dataset?.dimensions
      if (dims) {
        const clone = [...dims]
        clone[index] = value
        opt.dataset.dimensions = clone
      }
    }
  }

  function updateDatasetCell(id: string, rowIndex: number, colIndex: number, value: string) {
    const comp = findComponent(id)
    if (comp) {
      const opt = comp.option as any
      const src = opt.dataset?.source
      if (src?.[rowIndex]) {
        const currentVal = src[rowIndex][colIndex]
        const newVal = typeof currentVal === 'number' ? Number(value) : value
        const newRow = [...src[rowIndex]]
        newRow[colIndex] = newVal
        const newSource = [...src]
        newSource[rowIndex] = newRow
        opt.dataset.source = newSource
      }
    }
  }

  function addDatasetRow(id: string) {
    const comp = findComponent(id)
    if (comp) {
      const opt = comp.option as any
      const ds = opt.dataset
      if (!ds) return
      const colCount = ds.dimensions?.length ?? 2
      ds.source = [...ds.source, Array(colCount).fill('')]
    }
  }

  function removeDatasetRow(id: string, rowIndex: number) {
    const comp = findComponent(id)
    if (comp) {
      const opt = comp.option as any
      const src = opt.dataset?.source
      if (src) {
        opt.dataset.source = src.filter((_: unknown, i: number) => i !== rowIndex)
      }
    }
  }

  // === 移动/缩放 ===

  function moveComponent(id: string, dx: number, dy: number, baseX: number, baseY: number, pageW?: number, pageH?: number) {
    const comp = findComponent(id)
    if (!comp) return
    comp.attr.x = Math.round(Math.max(0, Math.min(baseX + dx, (pageW ?? 9999) - comp.attr.w)))
    comp.attr.y = Math.round(Math.max(0, Math.min(baseY + dy, (pageH ?? 9999) - comp.attr.h)))
  }

  function resizeComponent(id: string, dw: number, dh: number, baseW: number, baseH: number, maxW?: number, maxH?: number) {
    const comp = findComponent(id)
    if (!comp) return
    comp.attr.w = Math.max(100, Math.min(baseW + dw, maxW ?? 9999))
    comp.attr.h = Math.max(60, Math.min(baseH + dh, maxH ?? 9999))
  }

  // === 状态切换 ===

  function toggleStatus(id: string, statusKey: 'lock' | 'hide') {
    const comp = findComponent(id)
    if (comp) comp.status[statusKey] = !comp.status[statusKey]
  }

  function togglePreviewOverflow(id: string) {
    const comp = findComponent(id)
    if (comp) comp.preview.overFlowHidden = !comp.preview.overFlowHidden
  }

  function toggleFilterShow(id: string) {
    const comp = findComponent(id)
    if (comp) comp.styles.filterShow = !comp.styles.filterShow
  }

  return {
    components,
    addComponent,
    removeComponent,
    findComponent,
    updateProps,
    updatePosition,
    updateSize,
    updateAttr,
    updateStyle,
    updateOption,
    updateFilter,
    updateRequest,
    updateChartStyle,
    applyThemeToAll,
    updateDatasetDimension,
    updateDatasetCell,
    addDatasetRow,
    removeDatasetRow,
    moveComponent,
    resizeComponent,
    toggleStatus,
    togglePreviewOverflow,
    toggleFilterShow,
  }
})
```

### 4.3 `stores/selection.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useComponentStore } from './components'
import { rectsIntersect } from './utils'

export const useSelectionStore = defineStore('selection', () => {
  const componentStore = useComponentStore()

  const selectedId = ref<string | null>(null)
  const selectedIds = ref<string[]>([])

  const selectedComponent = computed(() => {
    if (!selectedId.value) return null
    return componentStore.findComponent(selectedId.value)
  })

  function select(id: string | null) {
    selectedId.value = id
    if (id === null) {
      selectedIds.value = []
    } else {
      selectedIds.value = [id]
    }
  }

  function toggleSelect(id: string) {
    const idx = selectedIds.value.indexOf(id)
    if (idx >= 0) {
      selectedIds.value.splice(idx, 1)
    } else {
      selectedIds.value.push(id)
    }
    if (selectedIds.value.length === 1) {
      selectedId.value = selectedIds.value[0]
    } else if (selectedIds.value.length > 1) {
      selectedId.value = id
    } else {
      selectedId.value = null
    }
  }

  function selectByRect(x: number, y: number, w: number, h: number) {
    const rect = { x, y, w, h }
    selectedIds.value = componentStore.components
      .filter(c => rectsIntersect(rect, { x: c.attr.x, y: c.attr.y, w: c.attr.w, h: c.attr.h }))
      .map(c => c.id)
    if (selectedIds.value.length === 0) {
      selectedId.value = null
    } else {
      selectedId.value = selectedIds.value[selectedIds.value.length - 1]
    }
  }

  function clear() {
    selectedIds.value = []
    selectedId.value = null
  }

  return {
    selectedId,
    selectedIds,
    selectedComponent,
    select,
    toggleSelect,
    selectByRect,
    clear,
  }
})
```

### 4.4 `stores/grouping.ts`

```typescript
import { defineStore } from 'pinia'
import { useComponentStore } from './components'
import { useSelectionStore } from './selection'
import { DEFAULT_STYLES, DEFAULT_STATUS, DEFAULT_PREVIEW } from '../types'
import type { CanvasComponent } from '../types'
import { useIdGenerator } from '../composables/useId'

export const useGroupStore = defineStore('grouping', () => {
  const componentStore = useComponentStore()
  const selectionStore = useSelectionStore()
  const generateId = useIdGenerator()

  function groupSelected() {
    if (selectionStore.selectedIds.length < 2) return
    const ids = new Set(selectionStore.selectedIds)
    const selected = componentStore.components.filter(c => ids.has(c.id))
    if (selected.length < 2) return

    const minX = Math.min(...selected.map(c => c.attr.x))
    const minY = Math.min(...selected.map(c => c.attr.y))
    const maxX = Math.max(...selected.map(c => c.attr.x + c.attr.w))
    const maxY = Math.max(...selected.map(c => c.attr.y + c.attr.h))

    const id = generateId()
    const group: CanvasComponent = {
      id,
      key: 'group',
      isGroup: true,
      props: {},
      chartConfig: {
        key: 'group',
        chartKey: 'group',
        conKey: '',
        title: '分组',
        category: '',
        categoryName: '',
        package: '',
        chartFrame: 'common',
        image: '',
      },
      attr: {
        x: minX, y: minY, w: maxX - minX, h: maxY - minY,
        offsetX: 0, offsetY: 0, zIndex: componentStore.components.length,
      },
      styles: { ...DEFAULT_STYLES },
      status: { ...DEFAULT_STATUS },
      preview: { ...DEFAULT_PREVIEW },
      option: {},
      groupList: selected.map(c => ({
        ...c,
        attr: { ...c.attr, x: c.attr.x - minX, y: c.attr.y - minY },
      })) as CanvasComponent[],
    }

    const idSet = new Set(selected.map(c => c.id))
    componentStore.components = componentStore.components.filter(c => !idSet.has(c.id))
    componentStore.components.push(group)

    selectionStore.selectedIds = [id]
    selectionStore.selectedId = id
  }

  function ungroup(groupId: string) {
    const comp = componentStore.components.find(c => c.id === groupId)
    if (!comp || !comp.isGroup || !comp.groupList) return

    const absChildren = comp.groupList.map(child => ({
      ...child,
      props: (child as any).props ?? {},
      attr: { ...child.attr, x: child.attr.x + comp.attr.x, y: child.attr.y + comp.attr.y },
    })) as CanvasComponent[]

    const idx = componentStore.components.findIndex(c => c.id === groupId)
    if (idx >= 0) {
      componentStore.components.splice(idx, 1, ...absChildren)
    }

    selectionStore.selectedIds = []
    selectionStore.selectedId = null
  }

  return { groupSelected, ungroup }
})
```

### 4.5 `stores/index.ts`

```typescript
export { useCanvasStore } from './canvas'
export { useComponentStore } from './components'
export { useSelectionStore } from './selection'
export { useGroupStore } from './grouping'
```

---

## 五、迁移策略

### 5.1 渐进式迁移

1. **第一步**: 创建新的 store 文件，实现新接口
2. **第二步**: 保留旧的 `useDashboardStore` 作为门面（Facade），内部调用新 store
3. **第三步**: 逐步更新组件使用新的 store
4. **第四步**: 移除旧的 `useDashboardStore`

### 5.2 向后兼容

```typescript
// stores/dashboard.ts (保留作为门面)
import { useCanvasStore } from './canvas'
import { useComponentStore } from './components'
import { useSelectionStore } from './selection'
import { useGroupStore } from './grouping'

export const useDashboardStore = defineStore('dashboard', () => {
  const canvasStore = useCanvasStore()
  const componentStore = useComponentStore()
  const selectionStore = useSelectionStore()
  const groupStore = useGroupStore()

  return {
    // 代理所有属性和方法
    components: computed(() => componentStore.components),
    selectedId: computed(() => selectionStore.selectedId),
    editCanvasConfig: computed(() => canvasStore.config),
    // ... 其他属性
    addComponent: componentStore.addComponent,
    removeComponent: componentStore.removeComponent,
    selectComponent: selectionStore.select,
    // ... 其他方法
  }
})
```

### 5.3 组件更新示例

**更新前**:
```typescript
import { useDashboardStore } from '../stores/dashboard'
const store = useDashboardStore()
store.addComponent('LineCommon')
store.selectComponent(id)
```

**更新后**:
```typescript
import { useComponentStore, useSelectionStore } from '../stores'
const componentStore = useComponentStore()
const selectionStore = useSelectionStore()
componentStore.addComponent('LineCommon')
selectionStore.select(id)
```

---

## 六、拆分优势

| 优势 | 说明 |
|------|------|
| **单一职责** | 每个 store 只负责一个领域 |
| **可读性** | 从 499 行减少到每个文件 100-150 行 |
| **可维护性** | 修改某个功能只需关注对应 store |
| **可测试性** | 可以独立测试每个 store |
| **类型安全** | 可以为每个 store 定义独立的类型 |
| **减少冲突** | 多人开发时减少代码冲突 |

---

*方案版本: v1.0*
*生成时间: 2026-06-18*
