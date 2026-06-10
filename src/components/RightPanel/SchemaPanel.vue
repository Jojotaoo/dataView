<template>
  <div class="panel-content schema-tab">
    <pre class="schema-view"><code v-html="highlightedSchema"></code></pre>
    <button class="copy-btn" @click="copySchema">
      {{ copied ? '已复制' : '复制 Schema' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDashboardStore } from '../../stores/dashboard'

const store = useDashboardStore()
const copied = ref(false)

const schemaJson = computed(() => {
  const storage = {
    editCanvasConfig: { ...store.editCanvasConfig },
    requestGlobalConfig: { ...store.requestGlobalConfig },
    componentList: store.components.map(c => ({
      id: c.id,
      key: c.key,
      parentId: c.parentId,
      chartConfig: c.chartConfig,
      attr: { ...c.attr },
      styles: { ...c.styles },
      status: { ...c.status },
      preview: { ...c.preview },
      filter: c.filter,
      option: { ...c.option },
    })),
  }
  return JSON.stringify(storage, null, 2)
})

const highlightedSchema = computed(() => {
  return syntaxHighlight(schemaJson.value)
})

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(?:[^"\\]|\\.)*")(\s*:)/g,
      (_, key, colon) => `<span class="json-key">${key}</span>${colon}`
    )
    .replace(
      /:\s*"(?:[^"\\]|\\.)*"/g,
      match => `: <span class="json-string">${match.slice(2)}</span>`
    )
    .replace(
      /:\s*(\d+(?:\.\d+)?)/g,
      (_, num) => `: <span class="json-number">${num}</span>`
    )
    .replace(
      /:\s*(true|false|null)/g,
      (_, val) => `: <span class="json-boolean">${val}</span>`
    )
}

async function copySchema() {
  try {
    await navigator.clipboard.writeText(schemaJson.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = schemaJson.value
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}
</script>

<style scoped>
.schema-tab {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.schema-view {
  background: #11111b;
  border: 1px solid #313244;
  border-radius: 8px;
  padding: 12px;
  overflow-x: auto;
  font-family: 'Cascadia Code', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
  font-size: 11px;
  line-height: 1.6;
  white-space: pre;
  margin: 0;
  min-height: 200px;
}
.copy-btn {
  padding: 8px 16px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.copy-btn:hover {
  background: #45475a;
  border-color: #585b70;
}
</style>
