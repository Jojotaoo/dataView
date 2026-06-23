# 交互配置 UI 实现方案

## 一、目标

为非研发人员提供可视化交互配置界面，通过下拉选择 + 表单填写完成组件间交互配置，零代码。

## 二、面板结构

右侧面板新增第三个 Tab（组件选中时）：

```
[组件配置] [数据源] [交互]
```

### 交互面板布局

```
┌─────────────────────────────────────┐
│  交互配置                            │
│                                      │
│  ┌─ 我触发的交互 ──────────────────┐ │
│  │                                  │ │
│  │  当 [点击 ▾] 此组件时            │ │
│  │  → 筛选 [柱状图 ▾] 的数据        │ │
│  │    参数名 [城市 ▾]              │ │
│  │    取值来源 [点击项的名称 ▾]     │ │
│  │                                  │ │
│  │  [+ 添加交互]                    │ │
│  └──────────────────────────────────┘ │
│                                      │
│  ┌─ 我能响应的交互 ────────────────┐ │
│  │  ✅ 数据筛选 (setFilter)         │ │
│  │  ✅ 请求参数变更 (setRequestParams)│ │
│  │  ✅ 清除筛选 (clearFilter)       │ │
│  └──────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 三、涉及文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `src/stores/dashboard.ts` | **修改** | 新增 5 个方法 + 1 个状态 |
| `src/components/RightPanel/InteractionPanel.vue` | **新建** | 交互配置面板主体 |
| `src/components/RightPanel/index.vue` | **修改** | 新增「交互」Tab + 导入 |
| `src/types/events.ts` | 无需修改 | 已有类型定义 |
| `src/components/RightPanel/chart-props/shared-form-styles.css` | 无需修改 | 已有样式足够 |

## 四、实现步骤

### 步骤 1：Store 新增方法

在 `src/stores/dashboard.ts` 中添加以下内容：

```ts
// 运行时交互筛选状态（不序列化，仅运行时存在）
const interactFilters = ref<Record<string, Record<string, any>>>({})

// 更新组件的 events 配置
function updateComponentEvents(id: string, events: EventsType) {
  const comp = findComponent(id)
  if (comp) comp.events = events
}

// 更新组件的 interactActions（声明自己能响应的交互）
function updateComponentInteractActions(id: string, actions: InteractActionItem[]) {
  const comp = findComponent(id)
  if (comp) comp.interactActions = actions
}

// 执行交互动作（源组件 dispatch 时调用）
function applyInteractAction(targetId: string, method: string, params: any) {
  if (method === 'setFilter') {
    if (typeof params === 'object' && params !== null) {
      interactFilters.value[targetId] = {
        ...interactFilters.value[targetId],
        ...params,
      }
    } else {
      interactFilters.value[targetId] = {
        ...interactFilters.value[targetId],
        _primary: params,
      }
    }
  } else if (method === 'setData') {
    const target = findComponent(targetId)
    if (target) target.option.dataset = params
  } else if (method === 'clearFilter') {
    delete interactFilters.value[targetId]
  } else if (method === 'setRequestParams') {
    const target = findComponent(targetId)
    if (target?.request?.requestParams) {
      target.request.requestParams.Params = {
        ...target.request.requestParams.Params,
        ...params,
      }
    }
  } else if (method === 'setRequestUrl') {
    const target = findComponent(targetId)
    if (target?.request) {
      target.request.requestUrl = params
    }
  }
}

// 清除筛选
function clearInteractFilters(targetId?: string) {
  if (targetId) {
    delete interactFilters.value[targetId]
  } else {
    interactFilters.value = {}
  }
}
```

在 `return` 中导出：

```ts
return {
  // ... 已有
  interactFilters,
  updateComponentEvents,
  updateComponentInteractActions,
  applyInteractAction,
  clearInteractFilters,
}
```

### 步骤 2：新建 InteractionPanel.vue

文件路径：`src/components/RightPanel/InteractionPanel.vue`

```vue
<template>
  <div class="panel-content">
    <!-- 我触发的交互 -->
    <details class="style-section" :open="true">
      <summary class="style-summary">我触发的交互</summary>
      <div class="prop-form" style="padding: 8px;">
        <div v-if="interactEvents.length === 0" class="static-hint">
          暂无交互配置，点击下方按钮添加
        </div>

        <div v-for="(item, index) in interactEvents" :key="index"
             class="interact-card">
          <div class="interact-card-header">
            <span class="interact-card-title">交互 {{ index + 1 }}</span>
            <button class="kv-remove" @click="removeInteract(index)">×</button>
          </div>

          <!-- 触发事件 -->
          <div class="prop-group row">
            <label class="prop-label">触发事件</label>
            <select class="prop-select" v-model="item.interactOn">
              <option value="click">点击</option>
              <option value="dblclick">双击</option>
              <option value="mouseenter">鼠标移入</option>
              <option value="mouseleave">鼠标移出</option>
            </select>
          </div>

          <!-- 目标组件 -->
          <div class="prop-group row">
            <label class="prop-label">目标组件</label>
            <select class="prop-select" v-model="item.interactComponentId">
              <option value="">请选择</option>
              <option v-for="c in otherComponents" :key="c.id" :value="c.id">
                {{ c.chartConfig.title }}
              </option>
            </select>
          </div>

          <!-- 执行动作 -->
          <div class="prop-group row">
            <label class="prop-label">执行动作</label>
            <select class="prop-select" v-model="item.method">
              <option value="setFilter">筛选数据</option>
              <option value="setRequestParams">修改请求参数</option>
              <option value="setData">设置数据</option>
              <option value="clearFilter">清除筛选</option>
            </select>
          </div>

          <!-- setFilter: 筛选字段 -->
          <div class="prop-group row" v-if="item.method === 'setFilter'">
            <label class="prop-label">筛选字段</label>
            <select class="prop-select" v-model="item.filterKey">
              <option value="">请选择</option>
              <option v-for="dim in getTargetDimensions(item.interactComponentId)"
                      :key="dim" :value="dim">{{ dim }}</option>
            </select>
          </div>

          <!-- setFilter: 取值来源 -->
          <div class="prop-group row" v-if="item.method === 'setFilter'">
            <label class="prop-label">取值来源</label>
            <select class="prop-select" v-model="item.valueSource">
              <option value="name">点击项的名称</option>
              <option value="value">点击项的值</option>
              <option value="data">点击项的数据</option>
              <option value="custom">自定义字段</option>
            </select>
          </div>

          <!-- setFilter: 自定义字段 -->
          <div class="prop-group row" v-if="item.method === 'setFilter' && item.valueSource === 'custom'">
            <label class="prop-label">字段名</label>
            <input class="prop-input" v-model="item.customField" placeholder="如: params.data.city" />
          </div>

          <!-- setRequestParams: 参数配置 -->
          <div class="prop-group" v-if="item.method === 'setRequestParams'">
            <label class="prop-label">请求参数</label>
            <div class="kv-row">
              <input class="prop-input kv-key" placeholder="参数名"
                     v-model="item.paramKey" />
              <input class="prop-input kv-val" placeholder="取值来源"
                     v-model="item.paramValue" />
            </div>
            <span class="prop-hint">可选值: name / value / data / 自定义字段</span>
          </div>

          <!-- setData: 数据配置 -->
          <div class="prop-group" v-if="item.method === 'setData'">
            <label class="prop-label">数据字段</label>
            <div class="kv-row">
              <input class="prop-input kv-key" placeholder="字段名"
                     v-model="item.dataKey" />
              <input class="prop-input kv-val" placeholder="取值来源"
                     v-model="item.dataValue" />
            </div>
          </div>
        </div>

        <button class="add-btn" @click="addInteract">+ 添加交互</button>
      </div>
    </details>

    <!-- 我能响应的交互 -->
    <details class="style-section" :open="true">
      <summary class="style-summary">我能响应的交互</summary>
      <div class="prop-form" style="padding: 8px;">
        <div v-if="!comp.interactActions || comp.interactActions.length === 0"
             class="static-hint">
          此组件未声明可响应的交互
        </div>
        <div v-for="action in comp.interactActions" :key="action.interactType"
             class="action-item">
          <span class="action-check">✅</span>
          <span class="action-name">{{ action.interactName }}</span>
          <span class="action-key">{{ action.interactType }}</span>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'
import type { InteractEventItem } from '../../types/events'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

// 当前组件的交互事件列表
const interactEvents = computed(() => comp.value.events?.interactEvents ?? [])

// 排除自身后的其他组件
const otherComponents = computed(() =>
  store.components.filter(c => c.id !== comp.value.id)
)

// 获取目标组件的 dimensions
function getTargetDimensions(targetId: string) {
  const target = store.findComponent(targetId)
  return target?.option?.dataset?.dimensions ?? []
}

// 添加交互
function addInteract() {
  if (!comp.value.events) {
    comp.value.events = {}
  }
  if (!comp.value.events.interactEvents) {
    comp.value.events.interactEvents = []
  }
  comp.value.events.interactEvents.push({
    interactOn: 'click',
    interactComponentId: '',
    interactFn: {},
    // UI 临时字段（不序列化）
    method: 'setFilter',
    filterKey: '',
    valueSource: 'name',
    customField: '',
    paramKey: '',
    paramValue: '',
    dataKey: '',
    dataValue: '',
  } as any)
}

// 删除交互
function removeInteract(index: number) {
  comp.value.events?.interactEvents?.splice(index, 1)
}
</script>

<style>
@import './chart-props/shared-form-styles.css';

.interact-card {
  border: 1px solid #313244;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 8px;
  background: #181825;
}

.interact-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.interact-card-title {
  font-size: 11px;
  font-weight: 600;
  color: #89b4fa;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid #313244;
}

.action-item:last-child {
  border-bottom: none;
}

.action-check {
  font-size: 12px;
}

.action-name {
  font-size: 12px;
  color: #cdd6f4;
  flex: 1;
}

.action-key {
  font-size: 10px;
  color: #6c7086;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
}
</style>
```

### 步骤 3：修改 RightPanel/index.vue

**文件路径：** `src/components/RightPanel/index.vue`

**改动 1：** tabs computed 中添加 `{ key: 'interact', label: '交互' }`

```ts
const tabs = computed(() => {
  if (store.selectedComponent) {
    return [
      { key: 'props', label: '组件配置' },
      { key: 'datasource', label: '数据源' },
      { key: 'interact', label: '交互' },  // 新增
    ]
  }
  return [
    { key: 'page', label: '画布配置' },
    { key: 'request', label: '数据请求' },
    { key: 'schema', label: 'Schema' },
  ]
})
```

**改动 2：** template 中添加 InteractionPanel

```html
<ComponentProps v-show="activeTab === 'props'" v-if="store.selectedComponent" />
<ComponentDatasource v-show="activeTab === 'datasource'" v-if="store.selectedComponent" />
<InteractionPanel v-show="activeTab === 'interact'" v-if="store.selectedComponent" />
```

**改动 3：** import 新组件

```ts
import InteractionPanel from './InteractionPanel.vue'
```

## 五、数据映射规则

UI 配置 → Schema `interactEvents` 的转换：

| UI 字段 | 生成的 interactFn |
|---------|-------------------|
| method=setFilter + valueSource=name | `{ "setFilter": "name" }` |
| method=setFilter + valueSource=value | `{ "setFilter": "value" }` |
| method=setFilter + valueSource=custom + customField=city | `{ "setFilter": "city" }` |
| method=setRequestParams + paramKey=城市 + paramValue=name | `{ "setRequestParams": "{ 城市: name }" }` |
| method=setData + dataKey=list + dataValue=data | `{ "setData": "data" }` |
| method=clearFilter | `{ "clearFilter": "" }` |

## 六、完整配置流程示例

1. 选中**地图**组件
2. 点击「交互」Tab
3. 点击「+ 添加交互」
4. 设置：
   - 触发事件：**点击**
   - 目标组件：**柱状图**
   - 执行动作：**筛选数据**
   - 筛选字段：**城市**
   - 取值来源：**点击项的名称**
5. 完成！用户点击地图的某个城市时，柱状图自动筛选该城市的数据

## 七、扩展方式

未来新增交互类型只需：
1. 在 `applyInteractAction` 中添加一个 `else if` 分支
2. 在 InteractionPanel 的「执行动作」select 中添加一个 option

不需要修改 composable 或组件代码。
