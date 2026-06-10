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
        left: child.attr.x + 'px',
        top: child.attr.y + 'px',
        width: child.attr.w + 'px',
        height: child.attr.h + 'px',
      }"
    >
      <BarChart
        v-if="child.key === 'BarCommon'"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
      />
      <LineChart
        v-else-if="child.key === 'LineCommon'"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BarChart from './BarChart.vue'
import LineChart from './LineChart.vue'
import type { CreateComponentType } from '../../types'

const props = withDefaults(defineProps<{
  bgColor?: string
  parentId?: string
  allComponents?: CreateComponentType[]
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
