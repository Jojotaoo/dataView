<template>
  <div
    class="container-preview"
    :style="{ backgroundColor: bgColor }"
  >
    <div
      v-for="child in children"
      :key="child.id"
      class="preview-child"
      :style="{
        left: child.position.x + 'px',
        top: child.position.y + 'px',
        width: child.size.width + 'px',
        height: child.size.height + 'px',
      }"
    >
      <BarChart
        v-if="child.type === 'bar-chart'"
        :title="child.props.title"
        :width="child.size.width"
        :height="child.size.height"
        :bg-color="child.props.bgColor"
        :data="child.props.data"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BarChart from './BarChart.vue'

const props = withDefaults(defineProps<{
  bgColor?: string
  parentId?: string
  allComponents?: {
    id: string
    type: string
    parentId?: string | null
    props: Record<string, any>
    position: { x: number; y: number }
    size: { width: number; height: number }
  }[]
}>(), {
  bgColor: 'rgba(30, 30, 46, 0.6)',
  parentId: '',
  allComponents: () => [],
})

const children = computed(() =>
  props.allComponents.filter(c => c.parentId === props.parentId)
)
</script>

<style scoped>
.container-preview {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.preview-child {
  position: absolute;
  border-radius: 4px;
  overflow: hidden;
}
</style>
