<template>
  <div class="panel-content">
    <div class="section-title">请求源与轮询</div>
    <div class="prop-form">
      <div class="prop-group">
        <label class="prop-label">请求源地址</label>
        <input type="text" class="prop-input" placeholder="https://api.example.com" :value="store.requestGlobalConfig.requestOriginUrl" @input="updateRequestGlobal('requestOriginUrl', ($event.target as HTMLInputElement).value)" />
      </div>
      <div class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">轮询间隔</label>
          <input type="number" class="prop-input" :value="store.requestGlobalConfig.requestInterval" @input="updateRequestGlobal('requestInterval', Number(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">时间单位</label>
          <select class="prop-select" :value="store.requestGlobalConfig.requestIntervalUnit" @change="updateRequestGlobal('requestIntervalUnit', ($event.target as HTMLSelectElement).value)">
            <option value="second">秒</option>
            <option value="minute">分</option>
            <option value="hour">时</option>
            <option value="day">天</option>
          </select>
        </div>
      </div>
    </div>

    <div class="section-title">Query Params</div>
    <div class="prop-form">
      <div v-for="(val, key, idx) in store.requestGlobalConfig.requestParams.Params" :key="'qp-' + idx" class="kv-row">
        <input type="text" class="prop-input kv-key" placeholder="key" :value="key" disabled />
        <input type="text" class="prop-input kv-val" placeholder="value" :value="val" @input="updateParamValue('Params', idx, ($event.target as HTMLInputElement).value)" />
        <button class="kv-remove" @click="removeParam('Params', key)">✕</button>
      </div>
      <button class="add-btn" @click="addParam('Params')">+ 添加参数</button>
    </div>

    <div class="section-title">请求头 (Header)</div>
    <div class="prop-form">
      <div v-for="(val, key, idx) in store.requestGlobalConfig.requestParams.Header" :key="'qh-' + idx" class="kv-row">
        <input type="text" class="prop-input kv-key" placeholder="key" :value="key" @input="updateHeaderKey(idx, ($event.target as HTMLInputElement).value)" />
        <input type="text" class="prop-input kv-val" placeholder="value" :value="val" @input="updateParamValue('Header', idx, ($event.target as HTMLInputElement).value)" />
        <button class="kv-remove" @click="removeParam('Header', key)">✕</button>
      </div>
      <button class="add-btn" @click="addParam('Header')">+ 添加请求头</button>
    </div>

    <div class="section-title">请求体 (Body)</div>
    <div class="prop-form">
      <div class="body-tabs">
        <button v-for="tab in bodyTabs" :key="tab.key" class="body-tab" :class="{ active: activeBodyTab === tab.key }" @click="activeBodyTab = tab.key">{{ tab.label }}</button>
      </div>
      <template v-if="isKvBody(activeBodyTab)">
        <div v-for="(val, key, idx) in kvBodyEntries" :key="'bb-' + idx" class="kv-row">
          <input type="text" class="prop-input kv-key" placeholder="key" :value="key" disabled />
          <input type="text" class="prop-input kv-val" placeholder="value" :value="val" @input="updateBodyKvValue(idx, ($event.target as HTMLInputElement).value)" />
          <button class="kv-remove" @click="removeBodyKv(key)">✕</button>
        </div>
        <button class="add-btn" @click="addBodyKv">+ 添加字段</button>
      </template>
      <template v-else>
        <textarea class="prop-textarea" rows="6" :value="bodyTextValue" @input="updateBodyText(($event.target as HTMLTextAreaElement).value)"></textarea>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'

const store = useDashboardStore()

const activeBodyTab = ref<'form-data' | 'x-www-form-urlencoded' | 'json' | 'xml'>('json')

const bodyTabs = [
  { key: 'form-data' as const, label: 'form-data' },
  { key: 'x-www-form-urlencoded' as const, label: 'urlencoded' },
  { key: 'json' as const, label: 'JSON' },
  { key: 'xml' as const, label: 'XML' },
]

function isKvBody(tab: string): tab is 'form-data' | 'x-www-form-urlencoded' {
  return tab === 'form-data' || tab === 'x-www-form-urlencoded'
}

const kvBodyEntries = computed(() => store.requestGlobalConfig.requestParams.Body[activeBodyTab.value] as Record<string, string>)

const bodyTextValue = computed(() => {
  const body = store.requestGlobalConfig.requestParams.Body
  return body[activeBodyTab.value as 'json' | 'xml'] as string
})

function updateRequestGlobal(key: string, value: any) {
  store.updateRequestGlobalConfig({ [key]: value })
}

function getSection(section: string): Record<string, string> | null {
  const target = store.requestGlobalConfig.requestParams[section as 'Params' | 'Header']
  return target ?? null
}

function updateParamValue(section: 'Params' | 'Header', idx: number, value: string) {
  const target = getSection(section)
  if (!target) return
  const keys = Object.keys(target)
  if (keys[idx] !== undefined) {
    target[keys[idx]] = value
  }
}

function updateHeaderKey(idx: number, newKey: string) {
  const target = getSection('Header')
  if (!target) return
  const keys = Object.keys(target)
  if (keys[idx] !== undefined) {
    const oldKey = keys[idx]
    if (oldKey === newKey) return
    target[newKey] = target[oldKey]
    delete target[oldKey]
  }
}

function addParam(section: 'Params' | 'Header') {
  const target = getSection(section)
  if (!target) return
  target[`${section.toLowerCase()}_${Object.keys(target).length + 1}`] = ''
}

function removeParam(section: 'Params' | 'Header', key: string) {
  const target = getSection(section)
  if (!target) return
  delete target[key]
}

function updateBodyKvValue(idx: number, value: string) {
  const target = kvBodyEntries.value
  if (!target) return
  const keys = Object.keys(target)
  if (keys[idx] !== undefined) {
    target[keys[idx]] = value
  }
}

function addBodyKv() {
  const target = kvBodyEntries.value
  if (!target) return
  target[`field_${Object.keys(target).length + 1}`] = ''
}

function removeBodyKv(key: string) {
  const target = kvBodyEntries.value
  if (!target) return
  delete target[key]
}

function updateBodyText(value: string) {
  const body = store.requestGlobalConfig.requestParams.Body
  if (activeBodyTab.value === 'json') body.json = value
  else if (activeBodyTab.value === 'xml') body.xml = value
}
</script>

<style scoped>
.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #89b4fa;
  margin: 16px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #313244;
  user-select: none;
}
.section-title:first-child { margin-top: 0; }
.prop-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.prop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.prop-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.prop-label {
  font-size: 11px;
  color: #a6adc8;
  font-weight: 500;
}
.prop-input {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.prop-input:focus { border-color: #89b4fa; }
.prop-select {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  cursor: pointer;
}
.prop-textarea {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 6px 8px;
  font-size: 12px;
  color: #cdd6f4;
  outline: none;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  resize: vertical;
  width: 100%;
}
.prop-textarea:focus { border-color: #89b4fa; }
.kv-row { display: flex; gap: 4px; align-items: center; }
.kv-key { flex: 2; font-size: 11px; opacity: 0.7; }
.kv-val { flex: 3; font-size: 11px; }
.kv-remove {
  flex: 0 0 22px;
  height: 22px;
  background: none;
  border: none;
  color: #6c7086;
  cursor: pointer;
  font-size: 10px;
  border-radius: 4px;
  transition: all 0.15s;
}
.kv-remove:hover { background: #f38ba8; color: #1e1e2e; }
.add-btn {
  padding: 4px 8px;
  background: #313244;
  border: 1px dashed #45475a;
  border-radius: 4px;
  color: #6c7086;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.add-btn:hover {
  background: #45475a;
  color: #cdd6f4;
  border-color: #89b4fa;
}
.body-tabs {
  display: flex;
  gap: 2px;
  background: #313244;
  border-radius: 6px;
  padding: 3px;
}
.body-tab {
  flex: 1;
  padding: 4px 8px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #6c7086;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.15s;
}
.body-tab.active {
  background: #45475a;
  color: #cdd6f4;
}
.body-tab:hover:not(.active) { color: #a6adc8; }
</style>
