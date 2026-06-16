<template>
  <div class="request-form">
    <div class="prop-group">
      <label class="prop-label">请求路径</label>
      <div class="url-input-wrapper">
        <span
          v-if="originUrl"
          class="url-prefix"
          :title="originUrl"
        >{{ originUrl }}</span>
        <input
          type="text"
          class="prop-input"
          :class="{ 'has-prefix': originUrl }"
          :value="request.requestUrl"
          @input="update('requestUrl', ($event.target as HTMLInputElement).value)"
          placeholder="/api/chart/data"
        />
      </div>
    </div>

    <div class="prop-grid">
      <div class="prop-group">
        <label class="prop-label">请求方法</label>
        <select
          class="prop-select"
          :value="request.requestHttpType"
          @change="update('requestHttpType', ($event.target as HTMLSelectElement).value)"
        >
          <option value="get">GET</option>
          <option value="post">POST</option>
          <option value="put">PUT</option>
          <option value="patch">PATCH</option>
          <option value="delete">DELETE</option>
        </select>
      </div>
      <div class="prop-group">
        <label class="prop-label">Body 类型</label>
        <select
          class="prop-select"
          :value="request.requestParamsBodyType"
          @change="update('requestParamsBodyType', ($event.target as HTMLSelectElement).value)"
        >
          <option value="none">无</option>
          <option value="json">JSON</option>
          <option value="form-data">form-data</option>
          <option value="x-www-form-urlencoded">urlencoded</option>
          <option value="xml">XML</option>
        </select>
      </div>
    </div>

    <div class="prop-grid">
      <div class="prop-group">
        <label class="prop-label">轮询间隔</label>
        <input
          type="number"
          class="prop-input"
          :value="request.requestInterval ?? ''"
          @input="updateInterval(($event.target as HTMLInputElement).value)"
          placeholder="使用全局"
        />
      </div>
      <div class="prop-group">
        <label class="prop-label">时间单位</label>
        <select
          class="prop-select"
          :value="request.requestIntervalUnit"
          @change="update('requestIntervalUnit', ($event.target as HTMLSelectElement).value)"
        >
          <option value="second">秒</option>
          <option value="minute">分</option>
          <option value="hour">时</option>
          <option value="day">天</option>
        </select>
      </div>
    </div>

    <div class="section-subtitle">Query Params</div>
    <div class="prop-form">
      <div v-for="(val, key, idx) in request.requestParams.Params" :key="'qp-' + idx" class="kv-row">
        <input type="text" class="prop-input kv-key" placeholder="key" :value="key" @input="updateParamKey(idx, ($event.target as HTMLInputElement).value)" />
        <input type="text" class="prop-input kv-val" placeholder="value" :value="val" @input="updateParamValue(idx, ($event.target as HTMLInputElement).value)" />
        <button class="kv-remove" @click="removeParam(key)">✕</button>
      </div>
      <button class="add-btn" @click="addParam">+ 添加参数</button>
    </div>

    <div class="section-subtitle">请求头 (Header) <span class="hint">（可选，覆盖全局同名项）</span></div>
    <div class="prop-form">
      <div v-for="(val, key, idx) in request.requestParams.Header" :key="'h-' + idx" class="kv-row">
        <input type="text" class="prop-input kv-key" placeholder="key" :value="key" @input="updateHeaderKey(idx, ($event.target as HTMLInputElement).value)" />
        <input type="text" class="prop-input kv-val" placeholder="value" :value="val" @input="updateHeaderValue(idx, ($event.target as HTMLInputElement).value)" />
        <button class="kv-remove" @click="removeHeader(key)">✕</button>
      </div>
      <button class="add-btn" @click="addHeader">+ 添加请求头</button>
    </div>

    <template v-if="request.requestParamsBodyType !== 'none'">
      <div class="section-subtitle">请求体 (Body)</div>
      <div class="prop-form">
        <template v-if="isKvBody">
          <div v-for="(val, key, idx) in kvBodyEntries" :key="'b-' + idx" class="kv-row">
            <input type="text" class="prop-input kv-key" placeholder="key" :value="key" disabled />
            <input type="text" class="prop-input kv-val" placeholder="value" :value="val" @input="updateBodyKvValue(idx, ($event.target as HTMLInputElement).value)" />
            <button class="kv-remove" @click="removeBodyKv(key)">✕</button>
          </div>
          <button class="add-btn" @click="addBodyKv">+ 添加字段</button>
        </template>
        <template v-else>
          <textarea class="prop-textarea" rows="4" v-model="bodyTextValue"></textarea>
        </template>
      </div>
    </template>

    <button class="send-btn" @click="emit('testRequest')">发送请求</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RequestConfigType } from '../../../types'

const props = defineProps<{
  request: RequestConfigType
  originUrl: string
}>()

const emit = defineEmits<{
  (e: 'update', request: Partial<RequestConfigType>): void
  (e: 'testRequest'): void
}>()

const isKvBody = computed(() => {
  const t = props.request.requestParamsBodyType
  return t === 'form-data' || t === 'x-www-form-urlencoded'
})

const kvBodyEntries = computed(() => {
  const t = props.request.requestParamsBodyType as 'form-data' | 'x-www-form-urlencoded'
  return props.request.requestParams?.Body[t] ?? {}
})

const bodyTextValue = computed({
  get: () => {
    const t = props.request.requestParamsBodyType as 'json' | 'xml'
    return props.request.requestParams?.Body[t] ?? ''
  },
  set: (val: string) => {
    const t = props.request.requestParamsBodyType as 'json' | 'xml'
    if (props.request.requestParams) {
      props.request.requestParams.Body[t] = val
    }
  },
})

function update(key: string, value: any) {
  emit('update', { [key]: value })
}

function updateInterval(value: string) {
  const num = value === '' ? null : Number(value)
  emit('update', { requestInterval: isNaN(num as number) ? null : num })
}

function updateHeaderKey(idx: number, newKey: string) {
  if (!props.request.requestParams) return
  const header = props.request.requestParams.Header
  const keys = Object.keys(header)
  if (keys[idx] !== undefined) {
    const oldKey = keys[idx]
    if (oldKey === newKey) return
    header[newKey] = header[oldKey]
    delete header[oldKey]
  }
}

function updateHeaderValue(idx: number, value: string) {
  if (!props.request.requestParams) return
  const header = props.request.requestParams.Header
  const keys = Object.keys(header)
  if (keys[idx] !== undefined) {
    header[keys[idx]] = value
  }
}

function addHeader() {
  if (!props.request.requestParams) return
  const header = props.request.requestParams.Header
  header[`header_${Object.keys(header).length + 1}`] = ''
}

function removeHeader(key: string) {
  if (!props.request.requestParams) return
  delete props.request.requestParams.Header[key]
}

function updateParamKey(idx: number, newKey: string) {
  if (!props.request.requestParams) return
  const params = props.request.requestParams.Params
  const keys = Object.keys(params)
  if (keys[idx] !== undefined) {
    const oldKey = keys[idx]
    if (oldKey === newKey) return
    params[newKey] = params[oldKey]
    delete params[oldKey]
  }
}

function updateParamValue(idx: number, value: string) {
  if (!props.request.requestParams) return
  const params = props.request.requestParams.Params
  const keys = Object.keys(params)
  if (keys[idx] !== undefined) {
    params[keys[idx]] = value
  }
}

function addParam() {
  if (!props.request.requestParams) return
  const params = props.request.requestParams.Params
  params[`param_${Object.keys(params).length + 1}`] = ''
}

function removeParam(key: string) {
  if (!props.request.requestParams) return
  delete props.request.requestParams.Params[key]
}

function updateBodyKvValue(idx: number, value: string) {
  if (!props.request.requestParams) return
  const t = props.request.requestParamsBodyType as 'form-data' | 'x-www-form-urlencoded'
  const target = props.request.requestParams.Body[t]
  if (!target) return
  const keys = Object.keys(target)
  if (keys[idx] !== undefined) {
    target[keys[idx]] = value
  }
}

function addBodyKv() {
  if (!props.request.requestParams) return
  const t = props.request.requestParamsBodyType as 'form-data' | 'x-www-form-urlencoded'
  const target = props.request.requestParams.Body[t]
  if (!target) return
  target[`field_${Object.keys(target).length + 1}`] = ''
}

function removeBodyKv(key: string) {
  if (!props.request.requestParams) return
  const t = props.request.requestParamsBodyType as 'form-data' | 'x-www-form-urlencoded'
  const target = props.request.requestParams.Body[t]
  if (!target) return
  delete target[key]
}
</script>

<style scoped>
.request-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
.prop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.prop-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.section-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: #89b4fa;
  margin: 4px 0;
}
.hint {
  font-size: 10px;
  font-weight: 400;
  color: #6c7086;
}
.url-input-wrapper {
  display: flex;
  align-items: center;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  overflow: hidden;
  max-width: 100%;
}
.url-prefix {
  padding: 6px 8px;
  font-size: 12px;
  color: #a6adc8;
  background: #45475a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-right: 1px solid #313244;
  line-height: 1.4;
  max-width: 50%;
  flex-shrink: 0;
}
.prop-input.has-prefix {
  border: none !important;
  border-radius: 0 !important;
  background: transparent !important;
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
.kv-key { flex: 2; font-size: 11px; }
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
.send-btn {
  width: 100%;
  padding: 8px 12px;
  background: #89b4fa;
  border: none;
  border-radius: 6px;
  color: #1e1e2e;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.send-btn:hover {
  background: #74c7ec;
}
.send-btn:active {
  background: #89dceb;
}
</style>
