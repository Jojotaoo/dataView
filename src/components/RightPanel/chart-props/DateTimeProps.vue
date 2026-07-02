<template>
  <div class="chart-style-panel">
    <details class="style-section" :open="true">
      <summary class="style-summary">显示内容</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">显示字段</label>
          <el-checkbox-group v-model="showFields" @change="onShowFieldsChange">
            <el-checkbox label="year">年</el-checkbox>
            <el-checkbox label="date">月日</el-checkbox>
            <el-checkbox label="weekday">星期</el-checkbox>
            <el-checkbox label="time">时分秒</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="prop-group">
          <label class="prop-label">实时更新</label>
          <el-switch v-model="autoUpdate" @change="onProp('autoUpdate', $event)" />
        </div>
        <div class="prop-group" v-if="autoUpdate">
          <label class="prop-label">刷新间隔</label>
          <el-input-number
            v-model="refreshInterval"
            :min="100"
            :max="60000"
            :step="100"
            size="small"
            @change="onProp('refreshInterval', $event)"
          />
          <span class="prop-hint">毫秒</span>
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">样式设置</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">字体大小</label>
          <el-slider
            v-model="fontSize"
            :min="12"
            :max="72"
            :step="1"
            show-input
            input-size="small"
            @change="onProp('fontSize', $event)"
          />
        </div>
        <div class="prop-group">
          <label class="prop-label">字体颜色</label>
          <el-color-picker
            v-model="textColor"
            show-alpha
            @change="onProp('textColor', $event)"
          />
        </div>
        <div class="prop-group">
          <label class="prop-label">对齐方式</label>
          <el-select v-model="textAlign" size="small" @change="onProp('textAlign', $event)">
            <el-option label="居左" value="left" />
            <el-option label="居中" value="center" />
            <el-option label="居右" value="right" />
          </el-select>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDashboardStore } from '../../../stores/dashboard'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)

const showFields = ref<string[]>(getDefaultFields())

function getDefaultFields(): string[] {
  const fields: string[] = []
  const p = comp.value?.props
  if (p?.showYear !== false) fields.push('year')
  if (p?.showDate !== false) fields.push('date')
  if (p?.showWeekday !== false) fields.push('weekday')
  if (p?.showTime !== false) fields.push('time')
  return fields
}

watch(comp, () => {
  showFields.value = getDefaultFields()
}, { deep: true })

const autoUpdate = computed({
  get: () => comp.value?.props?.autoUpdate !== false,
  set: (val: boolean) => onProp('autoUpdate', val),
})

const refreshInterval = computed({
  get: () => comp.value?.props?.refreshInterval ?? 1000,
  set: (val: number) => onProp('refreshInterval', val),
})

const fontSize = computed({
  get: () => comp.value?.props?.fontSize ?? 24,
  set: (val: number) => onProp('fontSize', val),
})

const textColor = computed({
  get: () => comp.value?.props?.textColor ?? '#cdd6f4',
  set: (val: string) => onProp('textColor', val),
})

const textAlign = computed({
  get: () => comp.value?.props?.textAlign ?? 'center',
  set: (val: string) => onProp('textAlign', val),
})

function onShowFieldsChange(val: string[]) {
  if (!store.selectedComponent) return
  const props = {
    ...(store.selectedComponent.props ?? {}),
    showYear: val.includes('year'),
    showDate: val.includes('date'),
    showWeekday: val.includes('weekday'),
    showTime: val.includes('time'),
  }
  store.updateComponentProps(store.selectedComponent.id, props)
}

function onProp(key: string, value: any) {
  if (!store.selectedComponent) return
  const props = { ...(store.selectedComponent.props ?? {}), [key]: value }
  store.updateComponentProps(store.selectedComponent.id, props)
}
</script>

<style>
@import './shared-form-styles.css';
.prop-hint {
  font-size: 12px;
  color: #a6adc8;
  margin-left: 8px;
}
</style>
