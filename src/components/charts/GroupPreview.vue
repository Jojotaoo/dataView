<template>
  <div class="group-preview" :style="{ backgroundColor: 'rgba(137, 180, 250, 0.04)' }">
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
      <BarChart
        v-else-if="child.key === 'BarCommon'"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :chart-style="(child as any).chartStyle"
      />
      <LineChart
        v-else-if="child.key === 'LineCommon'"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :chart-style="(child as any).chartStyle"
      />
      <PieChart
        v-else-if="child.key === 'PieCommon'"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :chart-style="(child as any).chartStyle"
      />
      <ScrollList
        v-else-if="child.key === 'ScrollList'"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :scroll-props="(child as any).props"
      />
      <MapChart
        v-else-if="child.key === 'HeilongjiangMap'"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :bg-color="(child as any).props?.bgColor"
        :chart-style="(child as any).chartStyle"
        geo-key="heilongjiang"
      />
      <TextDisplay
        v-else-if="child.key === 'TextDisplay'"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :text-props="(child as any).props"
      />
      <DataFetchManager :component-id="child.id" mode="preview" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BarChart from './BarChart.vue'
import LineChart from './LineChart.vue'
import PieChart from './PieChart.vue'
import ScrollList from './ScrollList.vue'
import MapChart from './MapChart.vue'
import TextDisplay from './TextDisplay.vue'
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
