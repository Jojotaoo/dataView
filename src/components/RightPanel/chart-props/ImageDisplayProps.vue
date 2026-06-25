<template>
  <div class="chart-style-panel">
    <details class="style-section" :open="true">
      <summary class="style-summary">图片设置</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">图片URL</label>
          <input type="text" class="prop-input" v-model="imageUrl" placeholder="输入图片URL地址" />
        </div>
        <div class="prop-group">
          <label class="prop-label">或上传本地图片</label>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            class="file-input-hidden"
            @change="onFileUpload"
          />
          <button class="upload-btn" @click="triggerFileUpload">
            📁 选择图片文件
          </button>
        </div>
        <div class="prop-group">
          <label class="prop-label">缩放模式</label>
          <select class="prop-select" :value="comp.props?.imageScale ?? 'cover'" @change="onImageProp('imageScale', ($event.target as HTMLSelectElement).value)">
            <option value="cover">覆盖 (Cover)</option>
            <option value="contain">包含 (Contain)</option>
            <option value="fill">填充 (Fill)</option>
            <option value="none">无 (None)</option>
            <option value="scale-down">缩放 (Scale Down)</option>
          </select>
        </div>
        <div class="prop-group">
          <label class="prop-label">圆角 ({{ comp.props?.borderRadius ?? 0 }}px)</label>
          <input type="range" min="0" max="50" step="1" class="prop-range" :value="comp.props?.borderRadius ?? 0" @input="onImageProp('borderRadius', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">透明度 ({{ comp.props?.opacity ?? 1 }})</label>
          <input type="range" min="0" max="1" step="0.1" class="prop-range" :value="comp.props?.opacity ?? 1" @input="onImageProp('opacity', parseFloat(($event.target as HTMLInputElement).value))" />
        </div>
      </div>
    </details>
    <details class="style-section" :open="true">
      <summary class="style-summary">边框与背景</summary>
      <div class="prop-form" style="padding: 8px;">
        <div class="prop-group">
          <label class="prop-label">边框宽度 ({{ comp.props?.borderWidth ?? 0 }}px)</label>
          <input type="range" min="0" max="10" step="1" class="prop-range" :value="comp.props?.borderWidth ?? 0" @input="onImageProp('borderWidth', parseInt(($event.target as HTMLInputElement).value))" />
        </div>
        <div class="prop-group">
          <label class="prop-label">边框颜色</label>
          <input type="color" class="prop-color" :value="comp.props?.borderColor ?? '#45475a'" @input="onImageProp('borderColor', ($event.target as HTMLInputElement).value)" />
        </div>
        <div class="prop-group">
          <label class="prop-label">背景色</label>
          <input type="color" class="prop-color" :value="comp.props?.bgColor === 'transparent' ? '#1e1e2e' : (comp.props?.bgColor ?? '#1e1e2e')" @input="onImageProp('bgColor', ($event.target as HTMLInputElement).value)" />
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useDashboardStore } from '../../../stores/dashboard'

const store = useDashboardStore()
const comp = computed(() => store.selectedComponent!)
const fileInputRef = ref<HTMLInputElement | null>(null)

const imageUrl = computed({
  get: () => comp.value?.option?.dataset ?? '',
  set: (val: string) => {
    if (!store.selectedComponent) return
    store.updateComponentOption(store.selectedComponent.id, 'dataset', val)
  },
})

function onImageProp(key: string, value: any) {
  if (!store.selectedComponent) return
  const props = { ...(store.selectedComponent.props ?? {}), [key]: value }
  store.updateComponentProps(store.selectedComponent.id, props)
}

function triggerFileUpload() {
  fileInputRef.value?.click()
}

function onFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string
    if (store.selectedComponent) {
      store.updateComponentOption(store.selectedComponent.id, 'dataset', dataUrl)
    }
  }
  reader.readAsDataURL(file)

  target.value = ''
}
</script>

<style>
@import './shared-form-styles.css';
.file-input-hidden {
  display: none;
}
.upload-btn {
  width: 100%;
  padding: 8px 12px;
  background: var(--ctp-surface0, #313244);
  border: 1px solid var(--ctp-surface1, #45475a);
  border-radius: 6px;
  color: var(--ctp-text, #cdd6f4);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.upload-btn:hover {
  background: var(--ctp-surface1, #45475a);
  border-color: var(--ctp-blue, #89b4fa);
}
</style>
