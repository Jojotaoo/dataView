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

    <div class="section-title">全局请求参数</div>
    <div class="prop-form">
      <div class="subsection-label">Query Params</div>
      <div v-for="(val, key, idx) in store.requestGlobalConfig.requestParams.Params" :key="'qp-' + idx" class="kv-row">
        <input type="text" class="prop-input kv-key" placeholder="key" :value="key" disabled />
        <input type="text" class="prop-input kv-val" placeholder="value" :value="val" @input="updateRequestParam('Params', key, ($event.target as HTMLInputElement).value, idx)" />
      </div>
      <button class="add-btn" @click="addRequestParam('Params')">+ 添加参数</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDashboardStore } from '../../stores/dashboard'

const store = useDashboardStore()

function updateRequestGlobal(key: string, value: any) {
  store.updateRequestGlobalConfig({ [key]: value })
}

function updateRequestParam(section: string, _oldKey: string, value: string, idx: number) {
  const params = store.requestGlobalConfig.requestParams
  const target = (params as any)[section]
  if (target) {
    const keys = Object.keys(target)
    if (keys[idx] !== undefined) {
      target[keys[idx]] = value
    }
  }
}

function addRequestParam(section: string) {
  const params = store.requestGlobalConfig.requestParams
  const target = (params as any)[section]
  if (target) {
    target[`param_${Object.keys(target).length + 1}`] = ''
  }
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
.subsection-label {
  font-size: 11px;
  color: #a6adc8;
  font-weight: 500;
  margin-top: 8px;
  margin-bottom: 4px;
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
.kv-row { display: flex; gap: 4px; align-items: center; }
.kv-key { flex: 2; font-size: 11px; opacity: 0.7; }
.kv-val { flex: 3; font-size: 11px; }
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
