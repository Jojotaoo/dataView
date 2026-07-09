<template>
  <div class="scroll-list" :style="containerStyle">
    <div v-if="showHeader && dimensions.length > 0" class="scroll-header" :style="headerStyle">
      <div v-for="(dim, ci) in dimensions" :key="ci" class="scroll-cell" :style="cellStyle(ci)">
        {{ dim }}
      </div>
    </div>
    <div class="scroll-viewport" :style="viewportStyle">
      <div :class="contentClass" :style="contentStyle">
        <div v-for="(row, ri) in doubledSource" :key="ri" class="scroll-row" :style="rowStyle(ri)">
          <div v-for="(cell, ci) in row" :key="ci" class="scroll-cell" :style="cellStyle(ci)">
            {{ cell }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  option?: Record<string, any>
  width?: number
  height?: number
  scrollProps?: Record<string, any>
}>(), {
  option: () => ({}),
  width: 400,
  height: 300,
  scrollProps: () => ({}),
})

const sp = computed(() => props.scrollProps ?? {})

const scrollSpeed = computed(() => sp.value.scrollSpeed ?? 30)
const visibleRows = computed(() => sp.value.visibleRows ?? 5)
const rowHeight = computed(() => sp.value.rowHeight ?? 36)
const showHeader = computed(() => sp.value.showHeader ?? true)
const headerBg = computed(() => sp.value.headerBg ?? '#313244')
const headerColor = computed(() => sp.value.headerColor ?? '#cdd6f4')
const zebraOdd = computed(() => sp.value.zebraOdd ?? '#1e1e2e')
const zebraEven = computed(() => sp.value.zebraEven ?? '#181825')
const fontSize = computed(() => sp.value.fontSize ?? 13)
const textColor = computed(() => sp.value.textColor ?? '#cdd6f4')
const highlightColor = computed(() => sp.value.highlightColor ?? '#89b4fa')

const ds = computed(() => props.option?.dataset ?? { dimensions: [], source: [] })
const dimensions = computed(() => ds.value.dimensions ?? [])
const source = computed(() => ds.value.source ?? [])

const doubledSource = computed(() => [...source.value, ...source.value])

const headerHeight = computed(() => showHeader.value ? 32 : 0)
const totalContentHeight = computed(() => source.value.length * rowHeight.value)
const viewportHeight = computed(() => visibleRows.value * rowHeight.value)
const duration = computed(() => totalContentHeight.value / scrollSpeed.value)

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  fontFamily: "'Inter', 'PingFang SC', sans-serif",
}))

const headerStyle = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  height: headerHeight.value + 'px',
  background: headerColor.value ? headerBg.value : '#313244',
  borderBottom: '1px solid #45475a',
  flexShrink: '0',
}))

const viewportStyle = computed(() => ({
  height: viewportHeight.value + 'px',
  overflow: 'hidden',
}))

const contentClass = computed(() => 'scroll-content scroll-animate')

const contentStyle = computed(() => ({
  '--scroll-duration': duration.value + 's',
}))

function rowStyle(ri: number) {
  const bgColor = ri % 2 === 0 ? zebraOdd.value : zebraEven.value
  return {
    display: 'flex',
    alignItems: 'center',
    height: rowHeight.value + 'px',
    background: bgColor,
    borderBottom: '1px solid #313244',
  }
}

function cellStyle(ci: number) {
  const cols = dimensions.value.length
  const flexBasis = cols > 0 ? (100 / cols) + '%' : 'auto'
  return {
    flex: '1',
    padding: '0 12px',
    fontSize: fontSize.value + 'px',
    color: textColor.value,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    textAlign: ci === 0 ? 'left' : 'center',
  }
}
</script>

<style scoped>
.scroll-list {
  display: flex;
  flex-direction: column;
}

.scroll-header .scroll-cell {
  font-weight: 600;
  color: #cdd6f4;
}

.scroll-viewport {
  flex: 1;
  overflow: hidden;
}

.scroll-content {
  will-change: transform;
}

.scroll-row {
  transition: background 0.2s;
}

.scroll-row:hover {
  background: rgba(137, 180, 250, 0.1) !important;
}
</style>

<style>
@keyframes scrollUp {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}

.scroll-animate {
  animation: scrollUp var(--scroll-duration) linear infinite;
}
</style>
