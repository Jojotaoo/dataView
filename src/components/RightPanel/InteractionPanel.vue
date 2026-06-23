<template>
  <div class="panel-content">
    <details class="style-section" :open="true">
      <summary class="style-summary">我触发的交互</summary>
      <div class="prop-form" style="padding: 8px;">
        <div v-if="interactEvents.length === 0" class="static-hint">
          暂无交互配置，点击下方按钮添加
        </div>

        <div v-for="(item, index) in interactEvents" :key="index" class="interact-card">
          <div class="interact-card-header">
            <span class="interact-card-title">交互 {{ index + 1 }}</span>
            <button class="kv-remove" @click="removeInteract(index)">×</button>
          </div>

          <div class="prop-group row">
            <label class="prop-label">触发事件</label>
            <select class="prop-select" v-model="item.interactOn">
              <option value="click">点击</option>
              <option value="dblclick">双击</option>
              <option value="mouseenter">鼠标移入</option>
              <option value="mouseleave">鼠标移出</option>
            </select>
          </div>

          <div class="prop-group row">
            <label class="prop-label">目标组件</label>
            <div class="multi-select-dropdown" @click.stop>
              <div class="multi-select-trigger" @click="toggleDropdown(index)">
                <span class="multi-select-text">
                  {{ getSelectedText(item.interactComponentIds) }}
                </span>
                <span class="multi-select-arrow" :class="{ open: openDropdownIndex === index }">&#9662;</span>
              </div>
              <div v-if="openDropdownIndex === index" class="multi-select-options">
                <div v-for="c in otherComponents" :key="c.id" class="multi-select-option"
                     @click.stop="toggleComponentSelection(item.interactComponentIds, c.id)">
                  <input type="checkbox" :checked="item.interactComponentIds.includes(c.id)" />
                  <span>{{ c.chartConfig.title }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="prop-group row">
            <label class="prop-label">执行动作</label>
            <select class="prop-select" v-model="item._method">
              <option value="setFilter">筛选数据</option>
              <option value="setRequestParams">修改请求参数</option>
              <option value="setData">设置数据</option>
              <option value="clearFilter">清除筛选</option>
              <option value="clearOverrides">清除交互参数</option>
            </select>
          </div>

          <div class="prop-group row" v-if="item._method === 'setFilter'">
            <label class="prop-label">筛选字段</label>
            <select class="prop-select" v-model="item._filterKey">
              <option value="">请选择</option>
              <option v-for="dim in getTargetDimensions(item.interactComponentIds)" :key="dim" :value="dim">
                {{ dim }}
              </option>
            </select>
          </div>

          <div class="prop-group row" v-if="item._method === 'setFilter'">
            <label class="prop-label">取值来源</label>
            <select class="prop-select" v-model="item._valueSource">
              <option value="name">点击项的名称</option>
              <option value="value">点击项的值</option>
              <option value="data">点击项的数据</option>
              <option value="custom">自定义字段</option>
            </select>
          </div>

          <div class="prop-group row" v-if="item._method === 'setFilter' && item._valueSource === 'custom'">
            <label class="prop-label">字段名</label>
            <input class="prop-input" v-model="item._customField" placeholder="如: city" />
          </div>

          <div class="prop-group" v-if="item._method === 'setRequestParams'">
            <label class="prop-label">请求参数</label>
            <div class="kv-row">
              <input class="prop-input kv-key" placeholder="参数名" v-model="item._paramKey" />
              <input class="prop-input kv-val" placeholder="取值来源" v-model="item._paramValue" />
            </div>
            <span class="prop-hint">取值来源: name / value / data / 自定义字段</span>
          </div>

          <div class="prop-group" v-if="item._method === 'setData'">
            <label class="prop-label">数据字段</label>
            <div class="kv-row">
              <input class="prop-input kv-key" placeholder="字段名" v-model="item._dataKey" />
              <input class="prop-input kv-val" placeholder="取值来源" v-model="item._dataValue" />
            </div>
          </div>
        </div>

        <button class="add-btn" @click="addInteract">+ 添加交互</button>
      </div>
    </details>

    <details class="style-section" :open="true">
      <summary class="style-summary">我能响应的交互</summary>
      <div class="prop-form" style="padding: 8px;">
        <div v-if="!comp.interactActions || comp.interactActions.length === 0" class="static-hint">
          此组件未声明可响应的交互
        </div>
        <div v-for="action in comp.interactActions" :key="action.interactType" class="action-item">
          <span class="action-check">✅</span>
          <span class="action-name">{{ action.interactName }}</span>
          <span class="action-key">{{ action.interactType }}</span>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'

interface InteractEventItemUI {
  interactOn: string
  interactComponentIds: string[]
  interactFn: Record<string, string>
  _method: string
  _filterKey: string
  _valueSource: string
  _customField: string
  _paramKey: string
  _paramValue: string
  _dataKey: string
  _dataValue: string
}

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)
const openDropdownIndex = ref<number | null>(null)

const interactEvents = computed<InteractEventItemUI[]>(() => {
  return (comp.value?.events?.interactEvents as unknown as InteractEventItemUI[]) ?? []
})

const otherComponents = computed(() =>
  store.components.filter(c => c.id !== comp.value.id)
)

function getTargetDimensions(targetIds: string[]) {
  const firstId = targetIds?.[0]
  if (!firstId) return []
  const target = store.findComponent(firstId)
  return target?.option?.dataset?.dimensions ?? []
}

function toggleDropdown(index: number) {
  openDropdownIndex.value = openDropdownIndex.value === index ? null : index
}

function toggleComponentSelection(ids: string[], componentId: string) {
  const idx = ids.indexOf(componentId)
  if (idx >= 0) {
    ids.splice(idx, 1)
  } else {
    ids.push(componentId)
  }
}

function getSelectedText(ids: string[]): string {
  if (!ids || ids.length === 0) return '请选择'
  const names = ids
    .map(id => store.findComponent(id)?.chartConfig.title)
    .filter(Boolean)
  if (names.length === 0) return '请选择'
  if (names.length === 1) return names[0]
  return `已选 ${names.length} 个`
}

function resolveValueSource(valueSource: string, customField: string): string {
  if (valueSource === 'custom') return `params.${customField || 'name'}`
  return `params.${valueSource}`
}

function buildInteractFn(item: InteractEventItemUI): Record<string, string> {
  const method = item._method || 'setFilter'
  if (method === 'setFilter') {
    const expr = resolveValueSource(item._valueSource || 'name', item._customField || '')
    const key = item._filterKey || '_primary'
    return { setFilter: key === '_primary' ? expr : `{ ${key}: ${expr} }` }
  } else if (method === 'setRequestParams') {
    const key = item._paramKey || 'param'
    const val = item._paramValue || 'name'
    return { setRequestParams: `{ ${key}: params.${val} }` }
  } else if (method === 'setData') {
    const key = item._dataKey || 'data'
    const val = item._dataValue || 'data'
    return { setData: `{ ${key}: params.${val} }` }
  } else if (method === 'clearFilter') {
    return { clearFilter: '' }
  } else if (method === 'clearOverrides') {
    return { clearOverrides: '' }
  }
  return {}
}

watchEffect(() => {
  const events = comp.value?.events?.interactEvents as unknown as InteractEventItemUI[] | undefined
  if (!events) return
  for (const item of events) {
    item.interactFn = buildInteractFn(item)
  }
})

function addInteract() {
  if (!comp.value) return
  store.addInteractEvent(comp.value.id, {
    interactOn: 'click',
    interactComponentIds: [],
    interactFn: {},
    _method: 'setFilter',
    _filterKey: '',
    _valueSource: 'name',
    _customField: '',
    _paramKey: '',
    _paramValue: '',
    _dataKey: '',
    _dataValue: '',
  } as InteractEventItemUI)
}

function removeInteract(index: number) {
  if (!comp.value) return
  store.removeInteractEvent(comp.value.id, index)
}
</script>

<style>
@import './chart-props/shared-form-styles.css';

.panel-content {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
}

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

.add-btn {
  width: 100%;
  padding: 6px 0;
  background: #313244;
  border: 1px dashed #45475a;
  border-radius: 4px;
  color: #6c7086;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
  margin-top: 4px;
}

.add-btn:hover {
  background: #45475a;
  color: #cdd6f4;
  border-color: #89b4fa;
}

.multi-select-dropdown {
  position: relative;
  flex: 1;
}

.multi-select-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: #181825;
  border: 1px solid #313244;
  border-radius: 4px;
  cursor: pointer;
  min-height: 24px;
}

.multi-select-text {
  font-size: 11px;
  color: #cdd6f4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.multi-select-arrow {
  font-size: 10px;
  color: #6c7086;
  transition: transform 0.2s;
}

.multi-select-arrow.open {
  transform: rotate(180deg);
}

.multi-select-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 4px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
}

.multi-select-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 11px;
  color: #cdd6f4;
}

.multi-select-option:hover {
  background: #313244;
}

.multi-select-option input[type="checkbox"] {
  margin: 0;
  cursor: pointer;
}
</style>
