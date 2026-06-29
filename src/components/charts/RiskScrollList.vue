<template>
  <div class="risk-scroll-list" :style="containerStyle">
    <div class="scroll-viewport" :style="viewportStyle">
      <div :class="scrollClass" :style="scrollContentStyle">
        <div
          v-for="(row, ri) in doubledSource"
          :key="ri"
          class="risk-list-item"
          :style="{
            ...itemStyle,
            '--item-hover-bg': itemHoverBg,
            background: useZebra ? (ri % 2 === 0 ? itemBgOdd : itemBgEven) : itemBgColor,
          }"
        >
          <span class="risk-dot" :style="dotStyle(row)"></span>
          <div class="risk-content">
            <div class="risk-main">
              <span class="company-name" :style="nameStyle">{{ getCell(row, 0) }}</span>
              <span class="risk-badge" :style="badgeStyle(row)">{{ getCell(row, 1) || '未标注' }}</span>
            </div>
            <div class="risk-sub" :style="riskSubStyle">
              <span class="risk-type">
                {{ getCell(row, 2) }}
                <span v-if="getCell(row, 4)" class="sub-tag" :style="subTagStyle(row)">{{ getCell(row, 4) }}</span>
              </span>
              <span class="risk-time" :style="timeStyle">{{ getCell(row, 3) || '—' }}</span>
            </div>
          </div>
        </div>
        <div v-if="source.length === 0" class="empty-state">暂无数据</div>
      </div>
    </div>
    <div v-if="showFooter" class="list-footer" :style="footerStyle">
      <span>共 {{ source.length }} 条记录</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  option?: Record<string, any>
  width?: number
  height?: number
  riskProps?: Record<string, any>
}>(), {
  option: () => ({}),
  width: 400,
  height: 400,
  riskProps: () => ({}),
})

const rp = computed(() => props.riskProps ?? {})

const ds = computed(() => props.option?.dataset ?? { dimensions: [], source: [] })
const source = computed(() => ds.value.source ?? [])
const doubledSource = computed(() => [...source.value, ...source.value])

const scrollSpeed = computed(() => rp.value.scrollSpeed ?? 30)
const visibleRows = computed(() => rp.value.visibleRows ?? 5)
const showFooter = computed(() => rp.value.showFooter ?? true)

const bgColor = computed(() => rp.value.bgColor ?? '#ffffff')
const borderRadius = computed(() => rp.value.borderRadius ?? 12)
const borderColor = computed(() => rp.value.borderColor ?? '#e8ecf1')
const shadow = computed(() => rp.value.shadow ?? '0 1px 4px rgba(0,0,0,0.04)')
const maxHeight = computed(() => rp.value.maxHeight ?? 500)
const itemPadding = computed(() => rp.value.itemPadding ?? '16px 24px')
const itemBorderColor = computed(() => rp.value.itemBorderColor ?? '#f0f2f5')
const itemBorderWidth = computed(() => rp.value.itemBorderWidth ?? 1)
const itemBorderRadius = computed(() => rp.value.itemBorderRadius ?? 0)
const itemGap = computed(() => rp.value.itemGap ?? 0)
const itemHoverBg = computed(() => rp.value.itemHoverBg ?? '#fafbfc')
const dotSize = computed(() => rp.value.dotSize ?? 10)
const nameFontSize = computed(() => rp.value.nameFontSize ?? 15)
const nameFontWeight = computed(() => rp.value.nameFontWeight ?? 600)
const nameColor = computed(() => rp.value.nameColor ?? '#1d2a3a')
const subFontSize = computed(() => rp.value.subFontSize ?? 13)
const subColor = computed(() => rp.value.subColor ?? '#6b7a8a')
const timeColor = computed(() => rp.value.timeColor ?? '#8c9aa8')
const typeTagBg = computed(() => rp.value.typeTagBg ?? '#f4f6f9')
const typeTagColor = computed(() => rp.value.typeTagColor ?? '#8c9aa8')
const footerBg = computed(() => rp.value.footerBg ?? '#fafbfc')
const footerColor = computed(() => rp.value.footerColor ?? '#8c9aa8')
const footerFontSize = computed(() => rp.value.footerFontSize ?? 13)
const footerAlign = computed(() => rp.value.footerAlign ?? 'right')

// Container padding props
const containerPaddingTop = computed(() => rp.value.containerPaddingTop ?? 0)
const containerPaddingRight = computed(() => rp.value.containerPaddingRight ?? 0)
const containerPaddingBottom = computed(() => rp.value.containerPaddingBottom ?? 0)
const containerPaddingLeft = computed(() => rp.value.containerPaddingLeft ?? 0)

// Item background color props
const itemBgColor = computed(() => rp.value.itemBgColor ?? '#ffffff')
const itemBgOdd = computed(() => rp.value.itemBgOdd ?? '#fafbfc')
const itemBgEven = computed(() => rp.value.itemBgEven ?? '#ffffff')
const useZebra = computed(() => rp.value.useZebra ?? false)

const riskTypes = computed(() => rp.value.riskTypes ?? [])
const defaultColor = computed(() => rp.value.defaultColor ?? '#b0bec5')
const badgeOpacity = computed(() => rp.value.badgeOpacity ?? 0.3)

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function getLevelStyle(level: string) {
  const found = riskTypes.value.find((t: any) => t.name === level)
  const color = found?.color ?? defaultColor.value
  return { color, bg: hexToRgba(color, badgeOpacity.value) }
}

function getCell(row: any[], ci: number): string {
  return row[ci] ?? ''
}

const totalContentHeight = computed(() => source.value.length * 56)
const viewportHeight = computed(() => visibleRows.value * 56)
const duration = computed(() => totalContentHeight.value / scrollSpeed.value)

const containerStyle = computed(() => ({
  width: '100%',
  height: '100%',
  background: bgColor.value,
  borderRadius: borderRadius.value + 'px',
  border: `0px solid ${borderColor.value}`,
  boxShadow: shadow.value,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
  padding: `${containerPaddingTop.value}px ${containerPaddingRight.value}px ${containerPaddingBottom.value}px ${containerPaddingLeft.value}px`,
}))

const viewportStyle = computed(() => ({
  flex: '1',
  overflow: 'hidden',
}))

const scrollClass = computed(() => 'scroll-content scroll-animate')

const scrollContentStyle = computed(() => ({
  '--scroll-duration': duration.value + 's',
}))

const itemStyle = computed(() => ({
  display: 'flex',
  alignItems: 'flex-start',
  padding: itemPadding.value,
  borderBottom: `${itemBorderWidth.value}px solid ${itemBorderColor.value}`,
  gap: '14px',
  transition: 'background 0.15s',
  cursor: 'default',
  marginBottom: itemGap.value + 'px',
  borderRadius: itemBorderRadius.value + 'px',
}))

const nameStyle = computed(() => ({
  fontWeight: nameFontWeight.value,
  fontSize: nameFontSize.value + 'px',
  color: nameColor.value,
}))

const timeStyle = computed(() => ({
  color: timeColor.value,
  fontSize: subFontSize.value + 'px',
  whiteSpace: 'nowrap' as const,
}))

function dotStyle(row: any[]) {
  const s = getLevelStyle(getCell(row, 1))
  return {
    flexShrink: '0',
    width: dotSize.value + 'px',
    height: dotSize.value + 'px',
    borderRadius: '50%',
    marginTop: '5px',
    background: s.color,
  }
}

function badgeStyle(row: any[]) {
  const s = getLevelStyle(getCell(row, 1))
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1px 12px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '22px',
    minWidth: '36px',
    letterSpacing: '0.3px',
    background: s.bg,
    color: s.color,
  }
}

function subTagStyle(row: any[]) {
  return {
    fontSize: '12px',
    color: typeTagColor.value,
    background: typeTagBg.value,
    padding: '0 10px',
    borderRadius: '30px',
    lineHeight: '22px',
    marginLeft: '6px',
  }
}

const riskSubStyle = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  flexWrap: 'wrap',
  fontSize: subFontSize.value + 'px',
  color: subColor.value,
}))

const footerStyle = computed(() => ({
  padding: '14px 24px',
  borderTop: `1px solid ${itemBorderColor.value}`,
  display: 'flex',
  justifyContent: footerAlign.value === 'center' ? 'center' : footerAlign.value === 'left' ? 'flex-start' : 'flex-end',
  background: footerBg.value,
  fontSize: footerFontSize.value + 'px',
  color: footerColor.value,
  flexShrink: '0',
}))
</script>

<style scoped>
.risk-scroll-list {
  position: relative;
  width: 100%;
  height: 100%;
}

.scroll-viewport {
  flex: 1;
  overflow: hidden;
}

.scroll-content {
  will-change: transform;
}

.risk-list-item:hover {
  background: var(--item-hover-bg, #fafbfc) !important;
}

.risk-content {
  flex: 1;
  min-width: 0;
}

.risk-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 6px;
}

.risk-sub {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.risk-time {
  white-space: nowrap;
}

.empty-state {
  padding: 40px 24px;
  text-align: center;
  color: #b0bec5;
}
</style>

<style>
@keyframes scrollUp {
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
}

.scroll-animate {
  animation: scrollUp var(--scroll-duration) linear infinite;
}
</style>