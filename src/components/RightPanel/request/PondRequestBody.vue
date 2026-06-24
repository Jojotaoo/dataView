<template>
  <div class="pond-body">
    <div class="section-title">请求头 (Header)</div>
    <div class="prop-form">
      <div v-for="(val, key, idx) in header" :key="'ph-' + idx" class="kv-row">
        <input type="text" class="prop-input kv-key" placeholder="key" :value="key" @input="emit('updateHeaderKey', idx, ($event.target as HTMLInputElement).value)" />
        <input type="text" class="prop-input kv-val" placeholder="value" :value="val" @input="emit('updateHeaderValue', idx, ($event.target as HTMLInputElement).value)" />
        <button class="kv-remove" @click="emit('removeHeader', key)">✕</button>
      </div>
      <button class="add-btn" @click="emit('addHeader')">+ 添加请求头</button>
    </div>

    <div class="section-title">请求体 (Body)</div>
    <div class="prop-form">
      <template v-if="isKvBody">
        <div v-for="(val, key, idx) in bodyEntries" :key="'pb-' + idx" class="kv-row">
          <input type="text" class="prop-input kv-key" placeholder="key" :value="key" @input="emit('updateBodyKvKey', idx, ($event.target as HTMLInputElement).value)" />
          <input type="text" class="prop-input kv-val" placeholder="value" :value="val" @input="emit('updateBodyKvValue', idx, ($event.target as HTMLInputElement).value)" />
          <button class="kv-remove" @click="emit('removeBodyKv', key)">✕</button>
        </div>
        <button class="add-btn" @click="emit('addBodyKv')">+ 添加字段</button>
      </template>
      <template v-else>
        <textarea class="prop-textarea" rows="4" v-model="bodyTextValue"></textarea>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  bodyType: string
  header: Record<string, string>
  body: {
    'form-data': Record<string, string>
    'x-www-form-urlencoded': Record<string, string>
    json: string
    xml: string
  }
}>()

const emit = defineEmits<{
  (e: 'updateHeaderKey', idx: number, newKey: string): void
  (e: 'updateHeaderValue', idx: number, value: string): void
  (e: 'addHeader'): void
  (e: 'removeHeader', key: string): void
  (e: 'updateBodyKvKey', idx: number, newKey: string): void
  (e: 'updateBodyKvValue', idx: number, value: string): void
  (e: 'addBodyKv'): void
  (e: 'removeBodyKv', key: string): void
  (e: 'updateBodyText', value: string): void
}>()

const isKvBody = computed(() => {
  return props.bodyType === 'form-data' || props.bodyType === 'x-www-form-urlencoded'
})

const bodyEntries = computed(() => {
  const t = props.bodyType as 'form-data' | 'x-www-form-urlencoded'
  return props.body[t] ?? {}
})

const bodyTextValue = computed({
  get: () => {
    const t = props.bodyType as 'json' | 'xml'
    return props.body[t] ?? ''
  },
  set: (val: string) => {
    emit('updateBodyText', val)
  },
})
</script>

<style scoped>
.pond-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
.kv-row { display: flex; gap: 4px; align-items: center; }
.kv-key { flex: 2; font-size: 11px; }
.kv-val { flex: 3; font-size: 11px; }
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
</style>
