<template>
  <div class="right-panel">
    <div class="tabs">
      <button
        v-for="t in tabs"
        :key="t.key"
        class="tab"
        :class="{ active: activeTab === t.key }"
        @click="activeTab = t.key"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- ==================== 组件配置（有选中组件时展示） ==================== -->
    <div v-show="activeTab === 'props'" v-if="store.selectedComponent" class="panel-content">
      <div class="section-title">基本信息</div>
      <div class="prop-form">
        <div class="prop-group">
          <label class="prop-label">组件名称</label>
          <div class="prop-value-static">{{ store.selectedComponent.chartConfig.title }}</div>
        </div>
        <div class="prop-group">
          <label class="prop-label">组件类型</label>
          <div class="prop-value-static">{{ store.selectedComponent.key }}</div>
        </div>
      </div>

      <div class="section-title">位置与尺寸</div>
      <div class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">X (px)</label>
          <input type="number" class="prop-input" :value="store.selectedComponent.attr.x" @input="updateAttr('x', $event)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">Y (px)</label>
          <input type="number" class="prop-input" :value="store.selectedComponent.attr.y" @input="updateAttr('y', $event)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">宽度 (px)</label>
          <input type="number" class="prop-input" :value="store.selectedComponent.attr.w" @input="updateAttr('w', $event)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">高度 (px)</label>
          <input type="number" class="prop-input" :value="store.selectedComponent.attr.h" @input="updateAttr('h', $event)" />
        </div>
      </div>

      <div class="section-title">状态控制</div>
      <div class="prop-form">
        <div class="prop-group row">
          <label class="prop-label">锁定</label>
          <label class="switch">
            <input type="checkbox" :checked="store.selectedComponent.status.lock" @change="toggleStatus('lock')" />
            <span class="switch-slider"></span>
          </label>
        </div>
        <div class="prop-group row">
          <label class="prop-label">隐藏</label>
          <label class="switch">
            <input type="checkbox" :checked="store.selectedComponent.status.hide" @change="toggleStatus('hide')" />
            <span class="switch-slider"></span>
          </label>
        </div>
        <div class="prop-group row">
          <label class="prop-label">预览裁剪</label>
          <label class="switch">
            <input type="checkbox" :checked="store.selectedComponent.preview.overFlowHidden" @change="togglePreviewOverflow()" />
            <span class="switch-slider"></span>
          </label>
        </div>
      </div>

      <div class="section-title">滤镜与变换</div>
      <div class="prop-form">
        <div class="prop-group row">
          <label class="prop-label">启用滤镜</label>
          <label class="switch">
            <input type="checkbox" :checked="store.selectedComponent.styles.filterShow" @change="toggleFilterShow()" />
            <span class="switch-slider"></span>
          </label>
        </div>
        <template v-if="store.selectedComponent.styles.filterShow">
          <div class="prop-group">
            <label class="prop-label">不透明度 ({{ store.selectedComponent.styles.opacity }})</label>
            <input type="range" min="0" max="1" step="0.05" class="prop-range" :value="store.selectedComponent.styles.opacity" @input="updateStyle('opacity', parseFloat(($event.target as HTMLInputElement).value))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">饱和度 ({{ store.selectedComponent.styles.saturate }})</label>
            <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="store.selectedComponent.styles.saturate" @input="updateStyle('saturate', parseFloat(($event.target as HTMLInputElement).value))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">对比度 ({{ store.selectedComponent.styles.contrast }})</label>
            <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="store.selectedComponent.styles.contrast" @input="updateStyle('contrast', parseFloat(($event.target as HTMLInputElement).value))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">色相旋转 ({{ store.selectedComponent.styles.hueRotate }}deg)</label>
            <input type="range" min="0" max="360" step="1" class="prop-range" :value="store.selectedComponent.styles.hueRotate" @input="updateStyle('hueRotate', parseInt(($event.target as HTMLInputElement).value))" />
          </div>
          <div class="prop-group">
            <label class="prop-label">亮度 ({{ store.selectedComponent.styles.brightness }})</label>
            <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="store.selectedComponent.styles.brightness" @input="updateStyle('brightness', parseFloat(($event.target as HTMLInputElement).value))" />
          </div>
        </template>
        <div class="prop-group">
          <label class="prop-label">Z 轴旋转 ({{ store.selectedComponent.styles.rotateZ }}deg)</label>
          <input type="range" min="-180" max="180" step="1" class="prop-range" :value="store.selectedComponent.styles.rotateZ" @input="updateStyle('rotateZ', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">X 轴旋转 ({{ store.selectedComponent.styles.rotateX }}deg)</label>
          <input type="range" min="-180" max="180" step="1" class="prop-range" :value="store.selectedComponent.styles.rotateX" @input="updateStyle('rotateX', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">Y 轴旋转 ({{ store.selectedComponent.styles.rotateY }}deg)</label>
          <input type="range" min="-180" max="180" step="1" class="prop-range" :value="store.selectedComponent.styles.rotateY" @input="updateStyle('rotateY', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">X 倾斜 ({{ store.selectedComponent.styles.skewX }}deg)</label>
          <input type="range" min="-90" max="90" step="1" class="prop-range" :value="store.selectedComponent.styles.skewX" @input="updateStyle('skewX', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">Y 倾斜 ({{ store.selectedComponent.styles.skewY }}deg)</label>
          <input type="range" min="-90" max="90" step="1" class="prop-range" :value="store.selectedComponent.styles.skewY" @input="updateStyle('skewY', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">混合模式</label>
          <select class="prop-select" :value="store.selectedComponent.styles.blendMode" @change="updateStyle('blendMode', ($event.target as HTMLSelectElement).value)">
            <option v-for="m in blendModes" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
      </div>

      <div class="section-title">图表配置</div>
      <div class="prop-form">
        <div class="prop-group">
          <label class="prop-label">标题</label>
          <input type="text" class="prop-input" :value="store.selectedComponent.option.title" @input="updateOption('title', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>
      <div v-if="store.selectedComponent.option.dataset" class="prop-form">
        <div class="section-subtitle">数据集 (Dataset)</div>
        <div class="prop-group">
          <label class="prop-label">维度</label>
          <div class="dimension-row">
            <input
              v-for="(dim, di) in store.selectedComponent.option.dataset.dimensions"
              :key="di"
              type="text" class="prop-input dim-input"
              :value="dim"
              @input="updateDimension(di, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
        <div class="prop-group">
          <label class="prop-label">数据表</label>
          <div class="data-table">
            <div class="table-header">
              <span v-for="dim in store.selectedComponent.option.dataset.dimensions" :key="dim" class="th">{{ dim }}</span>
              <span class="th th-action"></span>
            </div>
            <div v-for="(row, ri) in store.selectedComponent.option.dataset.source" :key="ri" class="table-row">
              <input
                v-for="(cell, ci) in row"
                :key="ci"
                type="text" class="prop-input cell-input"
                :value="cell"
                @input="updateSourceCell(ri, ci, ($event.target as HTMLInputElement).value)"
              />
              <button class="cell-remove" @click="removeSourceRow(ri)">✕</button>
            </div>
          </div>
          <button class="add-btn" @click="addSourceRow">+ 添加行</button>
        </div>
      </div>

      <div class="section-title">数据过滤</div>
      <div class="prop-form">
        <div class="prop-group">
          <label class="prop-label">过滤表达式</label>
          <textarea class="prop-textarea" rows="3" placeholder="data.filter(item => item.value > 100)" :value="store.selectedComponent.filter" @input="updateFilter(($event.target as HTMLTextAreaElement).value)"></textarea>
        </div>
      </div>
    </div>

    <!-- ==================== 画布配置（无选中组件时展示） ==================== -->
    <div v-show="activeTab === 'page'" v-if="!store.selectedComponent" class="panel-content">
      <div class="section-title">项目信息</div>
      <div class="prop-form">
        <div class="prop-group">
          <label class="prop-label">项目名称</label>
          <input type="text" class="prop-input" :value="store.editCanvasConfig.projectName" @input="store.updateCanvasConfig({ projectName: ($event.target as HTMLInputElement).value })" />
        </div>
      </div>

      <div class="section-title">画布尺寸</div>
      <div class="prop-grid">
        <div class="prop-group">
          <label class="prop-label">宽度 (px)</label>
          <input type="number" class="prop-input" :value="store.editCanvasConfig.width" @input="store.updateCanvasConfig({ width: Number(($event.target as HTMLInputElement).value) })" />
        </div>
        <div class="prop-group">
          <label class="prop-label">高度 (px)</label>
          <input type="number" class="prop-input" :value="store.editCanvasConfig.height" @input="store.updateCanvasConfig({ height: Number(($event.target as HTMLInputElement).value) })" />
        </div>
      </div>

      <div class="section-title">背景设置</div>
      <div class="prop-form">
        <div class="prop-group">
          <label class="prop-label">背景颜色</label>
          <input type="color" class="prop-color" :value="store.editCanvasConfig.background" @input="store.updateCanvasConfig({ background: ($event.target as HTMLInputElement).value })" />
        </div>
        <div class="prop-group">
          <label class="prop-label">背景图片 URL</label>
          <input type="text" class="prop-input" placeholder="输入图片链接或留空" :value="store.editCanvasConfig.backgroundImage ?? ''" @input="store.updateCanvasConfig({ backgroundImage: ($event.target as HTMLInputElement).value || null })" />
        </div>
      </div>

      <div class="section-title">全局滤镜</div>
      <div class="prop-form">
        <div class="prop-group row">
          <label class="prop-label">启用滤镜</label>
          <label class="switch">
            <input type="checkbox" :checked="store.editCanvasConfig.filterShow" @change="store.updateCanvasConfig({ filterShow: !store.editCanvasConfig.filterShow })" />
            <span class="switch-slider"></span>
          </label>
        </div>
        <template v-if="store.editCanvasConfig.filterShow">
          <div class="prop-group">
            <label class="prop-label">不透明度 ({{ store.editCanvasConfig.opacity }})</label>
            <input type="range" min="0" max="1" step="0.05" class="prop-range" :value="store.editCanvasConfig.opacity" @input="store.updateCanvasConfig({ opacity: parseFloat(($event.target as HTMLInputElement).value) })" />
          </div>
          <div class="prop-group">
            <label class="prop-label">饱和度 ({{ store.editCanvasConfig.saturate }})</label>
            <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="store.editCanvasConfig.saturate" @input="store.updateCanvasConfig({ saturate: parseFloat(($event.target as HTMLInputElement).value) })" />
          </div>
          <div class="prop-group">
            <label class="prop-label">对比度 ({{ store.editCanvasConfig.contrast }})</label>
            <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="store.editCanvasConfig.contrast" @input="store.updateCanvasConfig({ contrast: parseFloat(($event.target as HTMLInputElement).value) })" />
          </div>
          <div class="prop-group">
            <label class="prop-label">色相旋转 ({{ store.editCanvasConfig.hueRotate }}deg)</label>
            <input type="range" min="0" max="360" step="1" class="prop-range" :value="store.editCanvasConfig.hueRotate" @input="store.updateCanvasConfig({ hueRotate: parseInt(($event.target as HTMLInputElement).value) })" />
          </div>
          <div class="prop-group">
            <label class="prop-label">亮度 ({{ store.editCanvasConfig.brightness }})</label>
            <input type="range" min="0" max="5" step="0.1" class="prop-range" :value="store.editCanvasConfig.brightness" @input="store.updateCanvasConfig({ brightness: parseFloat(($event.target as HTMLInputElement).value) })" />
          </div>
        </template>
        <div class="prop-group">
          <label class="prop-label">Z 轴旋转 ({{ store.editCanvasConfig.rotateZ }}deg)</label>
          <input type="range" min="-180" max="180" step="1" class="prop-range" :value="store.editCanvasConfig.rotateZ" @input="store.updateCanvasConfig({ rotateZ: parseInt(($event.target as HTMLInputElement).value) })" />
        </div>
        <div class="prop-group">
          <label class="prop-label">X 轴旋转 ({{ store.editCanvasConfig.rotateX }}deg)</label>
          <input type="range" min="-180" max="180" step="1" class="prop-range" :value="store.editCanvasConfig.rotateX" @input="store.updateCanvasConfig({ rotateX: parseInt(($event.target as HTMLInputElement).value) })" />
        </div>
        <div class="prop-group">
          <label class="prop-label">Y 轴旋转 ({{ store.editCanvasConfig.rotateY }}deg)</label>
          <input type="range" min="-180" max="180" step="1" class="prop-range" :value="store.editCanvasConfig.rotateY" @input="store.updateCanvasConfig({ rotateY: parseInt(($event.target as HTMLInputElement).value) })" />
        </div>
        <div class="prop-group">
          <label class="prop-label">X 倾斜 ({{ store.editCanvasConfig.skewX }}deg)</label>
          <input type="range" min="-90" max="90" step="1" class="prop-range" :value="store.editCanvasConfig.skewX" @input="store.updateCanvasConfig({ skewX: parseInt(($event.target as HTMLInputElement).value) })" />
        </div>
        <div class="prop-group">
          <label class="prop-label">Y 倾斜 ({{ store.editCanvasConfig.skewY }}deg)</label>
          <input type="range" min="-90" max="90" step="1" class="prop-range" :value="store.editCanvasConfig.skewY" @input="store.updateCanvasConfig({ skewY: parseInt(($event.target as HTMLInputElement).value) })" />
        </div>
        <div class="prop-group">
          <label class="prop-label">混合模式</label>
          <select class="prop-select" :value="store.editCanvasConfig.blendMode" @change="store.updateCanvasConfig({ blendMode: ($event.target as HTMLSelectElement).value })">
            <option v-for="m in blendModes" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- ==================== 数据请求 ==================== -->
    <div v-show="activeTab === 'request'" class="panel-content">
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

    <!-- ==================== Schema ==================== -->
    <div v-show="activeTab === 'schema'" class="panel-content schema-tab">
      <pre class="schema-view"><code v-html="highlightedSchema"></code></pre>
      <button class="copy-btn" @click="copySchema">
        {{ copied ? '已复制' : '复制 Schema' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDashboardStore } from '../stores/dashboard'

const store = useDashboardStore()

const tabs = computed(() => [
  ...(store.selectedComponent ? [{ key: 'props', label: '组件配置' }] : [{ key: 'page', label: '画布配置' }]),
  { key: 'request', label: '数据请求' },
  { key: 'schema', label: 'Schema' },
])

const activeTab = ref<string>(store.selectedComponent ? 'props' : 'page')
const copied = ref(false)

watch(() => store.selectedComponent, (comp) => {
  if (comp) {
    activeTab.value = 'props'
  } else {
    activeTab.value = 'page'
  }
})

const blendModes = [
  'normal', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
  'color-dodge', 'color-burn', 'hard-light', 'soft-light',
  'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity',
]

function updateAttr(key: string, event: Event) {
  if (!store.selectedComponent) return
  const value = Number((event.target as HTMLInputElement).value)
  if (isNaN(value)) return
  const comp = store.components.find(c => c.id === store.selectedComponent!.id)
  if (comp) {
    (comp.attr as any)[key] = value
  }
}

function updateStyle(key: string, value: any) {
  if (!store.selectedComponent) return
  const comp = store.components.find(c => c.id === store.selectedComponent!.id)
  if (comp) {
    (comp.styles as any)[key] = value
  }
}

function updateOption(key: string, value: any) {
  if (!store.selectedComponent) return
  const comp = store.components.find(c => c.id === store.selectedComponent!.id)
  if (comp) {
    comp.option[key] = value
  }
}

function updateDimension(di: string | number, value: string) {
  if (!store.selectedComponent) return
  const ds = store.selectedComponent.option.dataset
  const idx = Number(di)
  if (ds?.dimensions) {
    ds.dimensions[idx] = value
  }
}

function updateSourceCell(ri: string | number, ci: string | number, value: string) {
  if (!store.selectedComponent) return
  const ds = store.selectedComponent.option.dataset
  const r = Number(ri)
  const c = Number(ci)
  if (ds?.source?.[r]) {
    ds.source[r][c] = value
  }
}

function addSourceRow() {
  if (!store.selectedComponent) return
  const ds = store.selectedComponent.option.dataset
  if (!ds) return
  const colCount = ds.dimensions?.length ?? 2
  ds.source.push(Array(colCount).fill(''))
}

function removeSourceRow(ri: string | number) {
  if (!store.selectedComponent) return
  const ds = store.selectedComponent.option.dataset
  if (ds?.source) {
    ds.source.splice(Number(ri), 1)
  }
}

function updateFilter(value: string) {
  if (!store.selectedComponent) return
  const comp = store.components.find(c => c.id === store.selectedComponent!.id)
  if (comp) {
    comp.filter = value
  }
}

function toggleStatus(key: 'lock' | 'hide') {
  if (!store.selectedComponent) return
  const comp = store.components.find(c => c.id === store.selectedComponent!.id)
  if (comp) {
    comp.status[key] = !comp.status[key]
  }
}

function togglePreviewOverflow() {
  if (!store.selectedComponent) return
  const comp = store.components.find(c => c.id === store.selectedComponent!.id)
  if (comp) {
    comp.preview.overFlowHidden = !comp.preview.overFlowHidden
  }
}

function toggleFilterShow() {
  if (!store.selectedComponent) return
  const comp = store.components.find(c => c.id === store.selectedComponent!.id)
  if (comp) {
    comp.styles.filterShow = !comp.styles.filterShow
  }
}

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
.right-panel {
  width: 280px;
  min-width: 280px;
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
  flex-wrap: wrap;
}

.tab {
  flex: 1;
  min-width: 60px;
  padding: 10px 8px;
  background: none;
  border: none;
  color: #6c7086;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  user-select: none;
  text-align: center;
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
  left: 8px;
  right: 8px;
  height: 2px;
  background: #89b4fa;
  border-radius: 1px 1px 0 0;
}

.panel-content {
  padding: 12px;
  flex: 1;
  overflow-y: auto;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #89b4fa;
  margin: 16px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #313244;
  user-select: none;
}

.section-title:first-child {
  margin-top: 0;
}

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

.prop-group.row {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.prop-label {
  font-size: 11px;
  color: #a6adc8;
  font-weight: 500;
}

.prop-value-static {
  font-size: 12px;
  color: #cdd6f4;
  padding: 6px 0;
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

.prop-input:focus {
  border-color: #89b4fa;
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

.prop-color {
  width: 100%;
  height: 32px;
  border: 1px solid #45475a;
  border-radius: 6px;
  background: #313244;
  cursor: pointer;
  padding: 2px;
}

.prop-range {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #45475a;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.prop-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  background: #89b4fa;
  border-radius: 50%;
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

.prop-textarea:focus {
  border-color: #89b4fa;
}

.kv-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.kv-key {
  flex: 2;
  font-size: 11px;
  opacity: 0.7;
}

.kv-val {
  flex: 3;
  font-size: 11px;
}

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

.switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  flex-shrink: 0;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: #45475a;
  border-radius: 20px;
  transition: 0.2s;
}

.switch-slider::before {
  content: '';
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  bottom: 3px;
  background: #cdd6f4;
  border-radius: 50%;
  transition: 0.2s;
}

.switch input:checked + .switch-slider {
  background: #89b4fa;
}

.switch input:checked + .switch-slider::before {
  transform: translateX(16px);
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

.section-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: #a6adc8;
  margin: 4px 0;
}

.dimension-row {
  display: flex;
  gap: 4px;
}

.dim-input {
  flex: 1;
  font-size: 11px;
}

.data-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
}

.table-header {
  display: flex;
  gap: 4px;
  padding: 4px 0;
  border-bottom: 1px solid #45475a;
  margin-bottom: 2px;
}

.th {
  flex: 1;
  font-size: 10px;
  color: #6c7086;
  font-weight: 600;
  text-transform: uppercase;
  padding: 0 4px;
}

.th-action {
  flex: 0 0 24px;
}

.table-row {
  display: flex;
  gap: 4px;
  align-items: center;
}

.cell-input {
  flex: 1;
  font-size: 11px;
  padding: 4px 6px;
}

.cell-remove {
  flex: 0 0 24px;
  height: 24px;
  background: none;
  border: none;
  color: #6c7086;
  cursor: pointer;
  font-size: 11px;
  border-radius: 4px;
  transition: all 0.15s;
}

.cell-remove:hover {
  background: #f38ba8;
  color: #1e1e2e;
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
