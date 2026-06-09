<template>
  <div class="right-panel">
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'props' }"
        @click="activeTab = 'props'"
      >
        属性配置
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'page' }"
        @click="activeTab = 'page'"
      >
        页面配置
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'schema' }"
        @click="activeTab = 'schema'"
      >
        Schema
      </button>
    </div>

    <div v-show="activeTab === 'props'" class="panel-content">
      <div v-if="store.selectedComponent" class="prop-form">
        <div class="prop-group">
          <label class="prop-label">组件名称</label>
          <div class="prop-value-static">{{ store.selectedComponent.name }}</div>
        </div>
        <div class="prop-group">
          <label class="prop-label">X (px)</label>
          <input
            type="number"
            class="prop-input"
            :value="store.selectedComponent.x"
            @input="updatePosition('x', $event)"
          />
        </div>
        <div class="prop-group">
          <label class="prop-label">Y (px)</label>
          <input
            type="number"
            class="prop-input"
            :value="store.selectedComponent.y"
            @input="updatePosition('y', $event)"
          />
        </div>
        <div class="prop-group">
          <label class="prop-label">宽度 (px)</label>
          <input
            type="number"
            class="prop-input"
            :value="store.selectedComponent.width"
            @input="updateSize('width', $event)"
          />
        </div>
        <div class="prop-group">
          <label class="prop-label">高度 (px)</label>
          <input
            type="number"
            class="prop-input"
            :value="store.selectedComponent.height"
            @input="updateSize('height', $event)"
          />
        </div>
        <div class="divider" />
        <div
          v-for="prop in currentDef?.props ?? []"
          :key="prop.key"
          class="prop-group"
        >
          <label class="prop-label">{{ prop.label }}</label>
          <input
            v-if="prop.type === 'text'"
            type="text"
            class="prop-input"
            :value="store.selectedComponent.props[prop.key]"
            @input="updateProp(prop.key, ($event.target as HTMLInputElement).value)"
          />
          <input
            v-if="prop.type === 'number'"
            type="number"
            class="prop-input"
            :value="store.selectedComponent.props[prop.key]"
            @input="updateProp(prop.key, Number(($event.target as HTMLInputElement).value))"
          />
          <input
            v-if="prop.type === 'color'"
            type="color"
            class="prop-color"
            :value="store.selectedComponent.props[prop.key]"
            @input="updateProp(prop.key, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
      <div v-else class="empty-config">
        <p>请选择一个组件进行配置</p>
      </div>
    </div>

    <div v-show="activeTab === 'page'" class="panel-content">
      <div class="prop-form">
        <div class="prop-group">
          <label class="prop-label">页面宽度 (px)</label>
          <input
            type="number"
            class="prop-input"
            :value="store.pageConfig.width"
            @input="store.updatePageConfig({ width: Number(($event.target as HTMLInputElement).value) })"
          />
        </div>
        <div class="prop-group">
          <label class="prop-label">页面高度 (px)</label>
          <input
            type="number"
            class="prop-input"
            :value="store.pageConfig.height"
            @input="store.updatePageConfig({ height: Number(($event.target as HTMLInputElement).value) })"
          />
        </div>
        <div class="prop-group">
          <label class="prop-label">背景颜色</label>
          <input
            type="color"
            class="prop-color"
            :value="store.pageConfig.bgColor"
            @input="store.updatePageConfig({ bgColor: ($event.target as HTMLInputElement).value })"
          />
        </div>
        <div class="prop-group">
          <label class="prop-label">背景图片 URL</label>
          <input
            type="text"
            class="prop-input"
            placeholder="输入图片链接或留空"
            :value="store.pageConfig.bgImage"
            @input="store.updatePageConfig({ bgImage: ($event.target as HTMLInputElement).value })"
          />
        </div>
      </div>
    </div>

    <div v-show="activeTab === 'schema'" class="panel-content schema-tab">
      <pre class="schema-view"><code v-html="highlightedSchema"></code></pre>
      <button class="copy-btn" @click="copySchema">
        {{ copied ? '已复制' : '复制 Schema' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDashboardStore } from '../stores/dashboard'

const store = useDashboardStore()
const activeTab = ref<'props' | 'page' | 'schema'>('props')
const copied = ref(false)

const currentDef = computed(() => {
  if (!store.selectedComponent) return null
  return store.componentDefinitions.find(d => d.type === store.selectedComponent!.type) ?? null
})

const schemaJson = computed(() => {
  return JSON.stringify(
    {
      page: '可视化大屏',
      pageConfig: {
        width: store.pageConfig.width,
        height: store.pageConfig.height,
        bgColor: store.pageConfig.bgColor,
        bgImage: store.pageConfig.bgImage,
      },
      components: store.components.map(c => ({
        id: c.id,
        type: c.type,
        name: c.name,
        parentId: c.parentId,
        props: c.props,
        position: { x: c.x, y: c.y },
        size: { width: c.width, height: c.height },
      })),
    },
    null,
    2
  )
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

function updateProp(key: string, value: any) {
  if (!store.selectedComponent) return
  store.updateComponentProp(store.selectedComponent.id, key, value)
}

function updatePosition(axis: 'x' | 'y', event: Event) {
  if (!store.selectedComponent) return
  const value = Number((event.target as HTMLInputElement).value)
  if (!isNaN(value)) {
    store.updateComponentPosition(
      store.selectedComponent.id,
      axis === 'x' ? value : store.selectedComponent.x,
      axis === 'y' ? value : store.selectedComponent.y
    )
  }
}

function updateSize(dim: 'width' | 'height', event: Event) {
  if (!store.selectedComponent) return
  const value = Number((event.target as HTMLInputElement).value)
  if (!isNaN(value) && value > 0) {
    store.updateComponentSize(
      store.selectedComponent.id,
      dim === 'width' ? value : store.selectedComponent.width,
      dim === 'height' ? value : store.selectedComponent.height
    )
  }
}

async function copySchema() {
  try {
    await navigator.clipboard.writeText(schemaJson.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback
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
.right-panel {
  width: 260px;
  min-width: 260px;
  background: #1e1e2e;
  border-left: 1px solid #313244;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #313244;
  flex-shrink: 0;
}

.tab {
  flex: 1;
  padding: 12px 16px;
  background: none;
  border: none;
  color: #6c7086;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  user-select: none;
}

.tab:hover {
  color: #a6adc8;
  background: #313244;
}

.tab.active {
  color: #cdd6f4;
}

.tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 16px;
  height: 2px;
  background: #89b4fa;
  border-radius: 1px 1px 0 0;
}

.panel-content {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
}

.prop-form {
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
  font-size: 12px;
  color: #a6adc8;
  font-weight: 500;
}

.prop-value-static {
  font-size: 13px;
  color: #cdd6f4;
  padding: 6px 0;
}

.prop-input {
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  color: #cdd6f4;
  outline: none;
  transition: border-color 0.15s;
}

.prop-input:focus {
  border-color: #89b4fa;
}

.prop-color {
  width: 100%;
  height: 36px;
  border: 1px solid #45475a;
  border-radius: 6px;
  background: #313244;
  cursor: pointer;
  padding: 2px;
}

.divider {
  height: 1px;
  background: #313244;
  margin: 4px 0;
}

.empty-config {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.empty-config p {
  color: #6c7086;
  font-size: 13px;
  text-align: center;
  margin: 0;
}

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

<style>
.json-key {
  color: #89b4fa;
}

.json-string {
  color: #a6e3a1;
}

.json-number {
  color: #fab387;
}

.json-boolean {
  color: #cba6f7;
}
</style>
