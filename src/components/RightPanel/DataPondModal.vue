<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click.self="handleCancel">
      <div class="modal-content">
        <div class="modal-header">
          <span class="modal-title">{{ isEdit ? '编辑数据池' : '添加数据池' }}</span>
          <button class="modal-close" @click="handleCancel">✕</button>
        </div>

        <div class="modal-body">
          <div class="prop-group">
            <label class="prop-label">数据池名称</label>
            <input type="text" class="prop-input" v-model="form.dataPondName" placeholder="输入数据池名称" />
          </div>

          <div class="section-title">请求配置</div>

          <div class="prop-group">
            <label class="prop-label">请求路径</label>
            <div class="url-input-wrapper">
              <span
                v-if="globalOriginUrl"
                class="url-prefix"
                :title="globalOriginUrl"
              >{{ globalOriginUrl }}</span>
              <input
                type="text"
                class="prop-input"
                :class="{ 'has-prefix': globalOriginUrl }"
                v-model="form.dataPondRequestConfig.requestUrl"
                placeholder="/api/data"
              />
            </div>
          </div>

          <div class="prop-grid">
            <div class="prop-group">
              <label class="prop-label">请求方法</label>
              <select class="prop-select" v-model="form.dataPondRequestConfig.requestHttpType">
                <option value="get">GET</option>
                <option value="post">POST</option>
                <option value="put">PUT</option>
                <option value="patch">PATCH</option>
                <option value="delete">DELETE</option>
              </select>
            </div>
            <div class="prop-group">
              <label class="prop-label">Body 类型</label>
              <select class="prop-select" v-model="form.dataPondRequestConfig.requestParamsBodyType">
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
              <input type="number" class="prop-input" v-model.number="form.dataPondRequestConfig.requestInterval" placeholder="30" />
            </div>
            <div class="prop-group">
              <label class="prop-label">时间单位</label>
              <select class="prop-select" v-model="form.dataPondRequestConfig.requestIntervalUnit">
                <option value="second">秒</option>
                <option value="minute">分</option>
                <option value="hour">时</option>
                <option value="day">天</option>
              </select>
            </div>
          </div>

          <template v-if="form.dataPondRequestConfig.requestParamsBodyType !== 'none'">
            <div class="section-title">请求头 (Header)</div>
            <div class="prop-form">
              <div v-for="(val, key, idx) in form.dataPondRequestConfig.requestParams.Header" :key="'ph-' + idx" class="kv-row">
                <input type="text" class="prop-input kv-key" placeholder="key" :value="key" @input="updateHeaderKey(idx, ($event.target as HTMLInputElement).value)" />
                <input type="text" class="prop-input kv-val" placeholder="value" :value="val" @input="updateHeaderValue(idx, ($event.target as HTMLInputElement).value)" />
                <button class="kv-remove" @click="removeHeader(key)">✕</button>
              </div>
              <button class="add-btn" @click="addHeader">+ 添加请求头</button>
            </div>

            <div class="section-title">请求体 (Body)</div>
            <div class="prop-form">
              <template v-if="isKvBody">
                <div v-for="(val, key, idx) in kvBodyEntries" :key="'pb-' + idx" class="kv-row">
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
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="handleCancel">取消</button>
          <button class="btn-confirm" @click="handleConfirm" :disabled="!form.dataPondName.trim()">确定</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { DataPondItem, RequestConfigType } from '../../types'
import { useDashboardStore } from '../../stores/dashboard'

const props = defineProps<{
  visible: boolean
  editItem?: DataPondItem | null
}>()

const store = useDashboardStore()
const globalOriginUrl = computed(() => store.requestGlobalConfig.requestOriginUrl)

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', item: DataPondItem): void
}>()

const isEdit = computed(() => !!props.editItem)

const form = ref<{
  dataPondId: string
  dataPondName: string
  dataPondRequestConfig: RequestConfigType
}>({
  dataPondId: '',
  dataPondName: '',
  dataPondRequestConfig: {
    requestDataType: 1,
    requestHttpType: 'get',
    requestUrl: '',
    requestInterval: 30,
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
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.editItem) {
      form.value = JSON.parse(JSON.stringify(props.editItem))
    } else {
      form.value = {
        dataPondId: `pond-${Date.now()}`,
        dataPondName: '',
        dataPondRequestConfig: {
          requestDataType: 1,
          requestHttpType: 'get',
          requestUrl: '',
          requestInterval: 30,
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
    }
  }
})

const isKvBody = computed(() => {
  const t = form.value.dataPondRequestConfig.requestParamsBodyType
  return t === 'form-data' || t === 'x-www-form-urlencoded'
})

const kvBodyEntries = computed(() => {
  const t = form.value.dataPondRequestConfig.requestParamsBodyType as 'form-data' | 'x-www-form-urlencoded'
  return form.value.dataPondRequestConfig.requestParams.Body[t]
})

const bodyTextValue = computed({
  get: () => {
    const t = form.value.dataPondRequestConfig.requestParamsBodyType as 'json' | 'xml'
    return form.value.dataPondRequestConfig.requestParams.Body[t] ?? ''
  },
  set: (val: string) => {
    const t = form.value.dataPondRequestConfig.requestParamsBodyType as 'json' | 'xml'
    form.value.dataPondRequestConfig.requestParams.Body[t] = val
  },
})

function updateHeaderKey(idx: number, newKey: string) {
  const header = form.value.dataPondRequestConfig.requestParams.Header
  const keys = Object.keys(header)
  if (keys[idx] !== undefined) {
    const oldKey = keys[idx]
    if (oldKey === newKey) return
    header[newKey] = header[oldKey]
    delete header[oldKey]
  }
}

function updateHeaderValue(idx: number, value: string) {
  const header = form.value.dataPondRequestConfig.requestParams.Header
  const keys = Object.keys(header)
  if (keys[idx] !== undefined) {
    header[keys[idx]] = value
  }
}

function addHeader() {
  const header = form.value.dataPondRequestConfig.requestParams.Header
  header[`header_${Object.keys(header).length + 1}`] = ''
}

function removeHeader(key: string) {
  delete form.value.dataPondRequestConfig.requestParams.Header[key]
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

function handleCancel() {
  emit('update:visible', false)
}

function handleConfirm() {
  if (!form.value.dataPondName.trim()) return
  emit('confirm', JSON.parse(JSON.stringify(form.value)))
  emit('update:visible', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #1e1e2e;
  border: 1px solid #313244;
  border-radius: 12px;
  width: 480px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #313244;
}
.modal-title {
  font-size: 14px;
  font-weight: 600;
  color: #cdd6f4;
}
.modal-close {
  background: none;
  border: none;
  color: #6c7086;
  cursor: pointer;
  font-size: 14px;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.15s;
}
.modal-close:hover {
  background: #313244;
  color: #cdd6f4;
}
.modal-body {
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #313244;
}
.btn-cancel {
  padding: 6px 16px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-cancel:hover {
  background: #45475a;
}
.btn-confirm {
  padding: 6px 16px;
  background: #89b4fa;
  border: none;
  border-radius: 6px;
  color: #1e1e2e;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-confirm:hover {
  background: #74c7ec;
}
.btn-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.section-title {
  font-size: 11px;
  font-weight: 600;
  color: #89b4fa;
  margin: 4px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid #313244;
  user-select: none;
}
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
</style>
