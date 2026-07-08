<template>
  <div class="header-line-wrap">
    <div class="header-line" :style="lineStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  componentId?: string
  option?: Record<string, any>
  width?: number
  height?: number
  lineProps?: Record<string, any>
}>(), {
  componentId: '',
  option: () => ({}),
  width: 400,
  height: 1,
  lineProps: () => ({}),
})

const lp = computed(() => props.lineProps ?? {})

const lineStyle = computed(() => {
  const color = lp.value.lineColor ?? '#00c8ff'
  const opacity = lp.value.lineOpacity ?? 0.3
  const direction = lp.value.lineDirection ?? 'right'
  const h = lp.value.height ?? 1
  const marginX = lp.value.marginX ?? 24

  const dir = direction === 'left' ? '270deg' : direction === 'center' ? '90deg' : '90deg'
  const dirLabel = direction === 'left' ? 'left' : 'center'
  const gradient = dirLabel === 'center'
    ? `linear-gradient(90deg, transparent, ${color}, transparent)`
    : direction === 'left'
      ? `linear-gradient(270deg, transparent, ${color})`
      : `linear-gradient(90deg, transparent, ${color})`

  return {
    height: h + 'px',
    background: gradient,
    opacity,
    marginRight: direction === 'right' ? marginX + 'px' : '0',
    marginLeft: direction === 'left' ? marginX + 'px' : '0',
  }
})
</script>

<style scoped>
.header-line-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.header-line {
  flex: 1;
  height: 1px;
  min-width: 40px;
  border-radius: 1px;
}
</style>
