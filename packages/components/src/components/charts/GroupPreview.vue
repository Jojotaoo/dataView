<template>
  <div class="group-preview">
    <div
      v-for="child in groupList"
      :key="child.id"
      class="preview-child"
      :style="{
        left: child.attr.x + 'px',
        top: child.attr.y + 'px',
        width: child.attr.w + 'px',
        height: child.attr.h + 'px',
      }"
    >
      <GroupPreview
        v-if="child.isGroup"
        :component="child"
      />
      <component
        v-else
        :is="componentMap[child.key]"
        v-bind="getComponentProps(child)"
      />
      <DataFetchManager :component-id="child.id" mode="preview" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { componentMap, getComponentProps } from '../../composables/useComponentRender'
import GroupPreview from './GroupPreview.vue'
import DataFetchManager from './DataFetchManager.vue'
import type { CreateComponentType } from '../../types'

const props = withDefaults(defineProps<{
  component?: CreateComponentType
}>(), {
  component: undefined,
})

const groupList = computed(() => props.component?.groupList ?? [])
</script>

<style scoped>
.group-preview {
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
