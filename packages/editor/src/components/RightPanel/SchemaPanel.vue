<template>
  <div class="panel-content schema-tab">
    <div class="schema-actions">
      <button class="action-btn" @click="copySchema">
        {{ copied ? '✓ 已复制' : '复制 Schema' }}
      </button>
      <button class="action-btn primary" @click="applySchema">应用到画布</button>
    </div>
    <textarea
      ref="textareaRef"
      class="schema-input"
      v-model="schemaInput"
      spellcheck="false"
      placeholder="在此粘贴 Schema JSON..."
    ></textarea>
    <div v-if="message" :class="['schema-msg', success ? 'success' : 'error']">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDashboardStore } from 'jojotaoo_components'
import { useChartSchema } from '../../composables/useChartSchema'
import { useDatasetStore } from '../../stores/dataset'

const store = useDashboardStore()
const datasetStore = useDatasetStore()
const { schema: currentSchema } = useChartSchema()
const copied = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const message = ref('')
const success = ref(false)

const schemaInput = ref(JSON.stringify(currentSchema.value, null, 2))

watch(currentSchema, (val) => {
  if (document.activeElement !== textareaRef.value) {
    schemaInput.value = JSON.stringify(val, null, 2)
  }
})

async function copySchema() {
  try {
    await navigator.clipboard.writeText(schemaInput.value)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = schemaInput.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function applySchema() {
  message.value = ''
  try {
    const parsed = JSON.parse(schemaInput.value)

    if (!parsed.componentList || !Array.isArray(parsed.componentList)) {
      message.value = 'Schema 格式错误：缺少 componentList 字段'
      success.value = false
      return
    }

    store.loadSchema(parsed)
    datasetStore.hydrate(parsed.datasetBindings)
    message.value = '✓ 已应用到画布'
    success.value = true
    setTimeout(() => {
      message.value = ''
    }, 3000)
  } catch (e: any) {
    message.value = 'JSON 解析错误：' + (e.message || '格式不正确')
    success.value = false
  }
}
</script>

<style scoped>
.schema-tab {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.schema-actions {
  display: flex;
  gap: 8px;
}
.action-btn {
  flex: 1;
  padding: 8px 12px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.action-btn:hover {
  background: #45475a;
  border-color: #585b70;
}
.action-btn.primary {
  background: #89b4fa;
  border-color: #89b4fa;
  color: #1e1e2e;
  font-weight: 600;
}
.action-btn.primary:hover {
  background: #74a8fa;
}
.schema-input {
  width: 100%;
  min-height: 300px;
  max-height: calc(100vh - 300px);
  background: #11111b;
  border: 1px solid #313244;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
  font-size: 11px;
  line-height: 1.6;
  color: #cdd6f4;
  resize: vertical;
  outline: none;
  tab-size: 2;
}
.schema-input:focus {
  border-color: #89b4fa;
}
.schema-msg {
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 4px;
}
.schema-msg.success {
  color: #a6e3a1;
  background: rgba(166, 227, 161, 0.1);
}
.schema-msg.error {
  color: #f38ba8;
  background: rgba(243, 139, 168, 0.1);
}
</style>
