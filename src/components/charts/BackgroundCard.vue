<template>
  <div class="bg-card" :style="cardStyle">
    <div class="title-area">
      <div class="page-title" :style="titleStyle">
        <span v-if="showDecorator" class="decorator" :style="decoratorStyle"></span>
        {{ titleText }}
      </div>
      <div v-if="showSubtitle" class="page-sub" :style="subStyle">{{ subText }}</div>
    </div>
    <div class="content-area" :style="contentStyle">
      <!-- 留空，纯装饰背景卡片 -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  componentId?: string
  option?: Record<string, any>
  width?: number
  height?: number
  bgProps?: Record<string, any>
}>(), {
  componentId: '',
  option: () => ({}),
  width: 900,
  height: 900,
  bgProps: () => ({}),
})

const bp = computed(() => props.bgProps ?? {})

const cardWidth = computed(() => bp.value.cardWidth ?? 900)
const cardHeight = computed(() => bp.value.cardHeight ?? 900)
const cardBgColor = computed(() => bp.value.cardBgColor ?? '#ffffff')
const cardBorderRadius = computed(() => bp.value.cardBorderRadius ?? 16)
const cardBorderColor = computed(() => bp.value.cardBorderColor ?? '#e8ecf1')
const cardBorderWidth = computed(() => bp.value.cardBorderWidth ?? 1)
const cardShadow = computed(() => bp.value.cardShadow ?? '0 2px 12px rgba(0,0,0,0.06)')
const cardPadding = computed(() => bp.value.cardPadding ?? '40px 48px')

const titleText = computed(() => bp.value.titleText ?? '标题')
const titleFontSize = computed(() => bp.value.titleFontSize ?? 32)
const titleFontWeight = computed(() => bp.value.titleFontWeight ?? 600)
const titleColor = computed(() => bp.value.titleColor ?? '#1d2a3a')
const titleLineHeight = computed(() => bp.value.titleLineHeight ?? 1.3)

const showDecorator = computed(() => bp.value.showDecorator ?? true)
const decoratorColor = computed(() => bp.value.decoratorColor ?? '#e34d59')
const decoratorWidth = computed(() => bp.value.decoratorWidth ?? 6)
const decoratorHeight = computed(() => bp.value.decoratorHeight ?? 32)
const decoratorRadius = computed(() => bp.value.decoratorRadius ?? 3)

const showSubtitle = computed(() => bp.value.showSubtitle ?? false)
const subText = computed(() => bp.value.subText ?? '')
const subFontSize = computed(() => bp.value.subFontSize ?? 16)
const subColor = computed(() => bp.value.subColor ?? '#8c9aa8')
const subMarginTop = computed(() => bp.value.subMarginTop ?? 8)
const subPaddingLeft = computed(() => bp.value.subPaddingLeft ?? 20)

const cardStyle = computed(() => ({
  width: '100%',
  height: '100%',
  minWidth: '200px',
  minHeight: '150px',
  backgroundColor: cardBgColor.value,
  borderRadius: `${cardBorderRadius.value}px`,
  border: `${cardBorderWidth.value}px solid ${cardBorderColor.value}`,
  boxShadow: cardShadow.value,
  padding: cardPadding.value,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  boxSizing: 'border-box' as const,
}))

const titleStyle = computed(() => ({
  fontSize: `${titleFontSize.value}px`,
  fontWeight: titleFontWeight.value,
  color: titleColor.value,
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  lineHeight: titleLineHeight.value,
}))

const decoratorStyle = computed(() => ({
  content: '""',
  display: 'inline-block',
  width: `${decoratorWidth.value}px`,
  height: `${decoratorHeight.value}px`,
  backgroundColor: decoratorColor.value,
  borderRadius: `${decoratorRadius.value}px`,
  flexShrink: 0,
}))

const subStyle = computed(() => ({
  fontSize: `${subFontSize.value}px`,
  color: subColor.value,
  marginTop: `${subMarginTop.value}px`,
  paddingLeft: `${subPaddingLeft.value}px`,
}))

const contentStyle = computed(() => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#d0d5dd',
  fontSize: '18px',
  letterSpacing: '1px',
  userSelect: 'none' as const,
}))
</script>

<style scoped>
.bg-card {
  position: relative;
  width: 100%;
  height: 100%;
}

.title-area {
  flex-shrink: 0;
}

.page-title {
  user-select: none;
}

.page-sub {
  user-select: none;
}

.content-area {
  min-height: 0;
}
</style>