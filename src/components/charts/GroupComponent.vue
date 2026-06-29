<template>
  <div class="group-component" :style="{ backgroundColor: 'rgba(137, 180, 250, 0.06)' }">
    <div
      v-for="child in groupList"
      :key="child.id"
      class="group-child"
      :class="{ selected: isSelected(child.id) }"
      :style="childStyle(child)"
      :data-comp-id="child.id"
      @click.stop="onChildClick($event, child.id)"
    >
      <GroupComponent
        v-if="child.isGroup"
        :component="child"
        :scale="scale"
      />
      <BarChart
        v-else-if="child.key === 'BarCommon'"
        :component-id="child.id"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :chart-style="(child as any).chartStyle"
      />
      <LineChart
        v-else-if="child.key === 'LineCommon'"
        :component-id="child.id"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :chart-style="(child as any).chartStyle"
      />
      <PieChart
        v-else-if="child.key === 'PieCommon'"
        :component-id="child.id"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :chart-style="(child as any).chartStyle"
      />
      <PieGridChart
        v-else-if="child.key === 'PieGrid'"
        :component-id="child.id"
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
        :component-id="child.id"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :bg-color="(child as any).props?.bgColor"
        :chart-style="(child as any).chartStyle"
        geo-key="heilongjiang"
      />
      <TextDisplay
        v-else-if="child.key === 'TextDisplay'"
        :component-id="child.id"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :text-props="(child as any).props"
      />
      <BackgroundCard
        v-else-if="child.key === 'BackgroundCard'"
        :component-id="child.id"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :bg-props="(child as any).props"
      />
      <RiskScrollList
        v-else-if="child.key === 'RiskScrollList'"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :risk-props="(child as any).props"
      />
      <ImageDisplay
        v-else-if="child.key === 'ImageDisplay'"
        :component-id="child.id"
        :option="child.option"
        :width="child.attr.w"
        :height="child.attr.h"
        :image-props="(child as any).props"
      />
      <DataFetchManager :component-id="child.id" mode="design" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BarChart from './BarChart.vue'
import LineChart from './LineChart.vue'
import PieChart from './PieChart.vue'
import PieGridChart from './PieGridChart.vue'
import ScrollList from './ScrollList.vue'
import MapChart from './MapChart.vue'
import TextDisplay from './TextDisplay.vue'
import BackgroundCard from './BackgroundCard.vue'
import RiskScrollList from './RiskScrollList.vue'
import ImageDisplay from './ImageDisplay.vue'
import GroupComponent from './GroupComponent.vue'
import DataFetchManager from './DataFetchManager.vue'
import { useDashboardStore } from '../../stores/dashboard'
import type { CanvasComponent } from '../../types'
import type { CreateComponentType } from '../../types'

const store = useDashboardStore()

const props = withDefaults(defineProps<{
  component?: CanvasComponent
  scale?: number
}>(), {
  component: undefined,
  scale: 1,
})

const groupList = computed(() => props.component?.groupList ?? [])

function childStyle(child: CreateComponentType) {
  return {
    left: child.attr.x + 'px',
    top: child.attr.y + 'px',
    width: child.attr.w + 'px',
    height: child.attr.h + 'px',
  }
}

function isSelected(id: string) {
  return store.selectedIds.includes(id)
}

function onChildClick(event: MouseEvent, id: string) {
  if (event.ctrlKey || event.metaKey) {
    store.toggleSelectComponent(id)
  } else {
    store.selectComponent(id)
  }
}
</script>

<style scoped>
.group-component {
  width: 100%;
  height: 100%;
  border: 2px dashed #585b70;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}

.group-child {
  position: absolute;
  border: 2px solid #45475a;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.15s;
  cursor: default;
}

.group-child.selected {
  border-color: #89b4fa;
  box-shadow: 0 0 8px rgba(137, 180, 250, 0.3);
}
</style>
