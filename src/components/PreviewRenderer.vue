<template>
  <div class="preview-overlay" @keydown.escape="$emit('close')">
    <div class="preview-header">
      <h2 class="preview-title">{{ schema.page }} - 预览</h2>
      <button class="exit-btn" @click="$emit('close')">
        ✕ 退出预览
      </button>
    </div>
    <div
      class="preview-stage"
      :style="{
        backgroundColor: schema.pageConfig?.bgColor ?? '#11111b',
        backgroundImage: schema.pageConfig?.bgImage
          ? `url(${schema.pageConfig.bgImage})`
          : undefined,
        backgroundSize: schema.pageConfig?.bgImage ? 'cover' : undefined,
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }"
    >
      <div
        v-for="comp in rootComponents"
        :key="comp.id"
        class="preview-component"
        :style="{
          left: comp.position.x + 'px',
          top: comp.position.y + 'px',
          width: comp.size.width + 'px',
          height: comp.size.height + 'px',
        }"
      >
        <ContainerPreview
          v-if="comp.type === 'container'"
          :bg-color="comp.props.bgColor"
          :parent-id="comp.id"
          :all-components="schema.components"
        />
        <BarChart
          v-else-if="comp.type === 'bar-chart'"
          :title="comp.props.title"
          :width="comp.size.width"
          :height="comp.size.height"
          :bg-color="comp.props.bgColor"
          :data="comp.props.data"
        />
      </div>
      <div v-if="rootComponents.length === 0" class="preview-empty">
        暂无组件
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BarChart from './charts/BarChart.vue'
import ContainerPreview from './charts/ContainerPreview.vue'

type SchemaComponent = {
  id: string
  type: string
  name: string
  parentId?: string | null
  props: Record<string, any>
  position: { x: number; y: number }
  size: { width: number; height: number }
}

const props = defineProps<{
  schema: {
    page: string
    pageConfig?: {
      width: number
      height: number
      bgColor: string
      bgImage: string
    }
    components: SchemaComponent[]
  }
}>()

defineEmits<{
  close: []
}>()

const rootComponents = computed(() =>
  props.schema.components.filter(c => !c.parentId)
)
</script>

<style scoped>
.preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #11111b;
  display: flex;
  flex-direction: column;
}

.preview-header {
  height: 48px;
  min-height: 48px;
  background: #181825;
  border-bottom: 1px solid #313244;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
}

.preview-title {
  font-size: 16px;
  font-weight: 700;
  color: #cdd6f4;
  margin: 0;
  user-select: none;
}

.exit-btn {
  padding: 6px 16px;
  background: #313244;
  border: 1px solid #45475a;
  border-radius: 6px;
  color: #cdd6f4;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.exit-btn:hover {
  background: #f38ba8;
  color: #1e1e2e;
  border-color: #f38ba8;
}

.preview-stage {
  flex: 1;
  position: relative;
  overflow: auto;
}

.preview-component {
  position: absolute;
  border-radius: 6px;
  overflow: hidden;
}

.preview-empty {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #6c7086;
  font-size: 16px;
  user-select: none;
}
</style>
