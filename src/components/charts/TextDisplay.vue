<template>
  <div class="text-display" :style="containerStyle">
    <div class="text-content" :style="textStyle">{{ displayText }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = withDefaults(defineProps<{
  option?: Record<string, any>
  width?: number
  height?: number
  textProps?: Record<string, any>
}>(), {
  option: () => ({}),
  width: 400,
  height: 200,
  textProps: () => ({}),
})

const rawText = ref('文本内容')
const localBgColor = ref('transparent')
const localPadding = ref(12)
const localFontSize = ref(32)
const localFontWeight = ref('bold')
const localTextAlign = ref('center')
const localLineHeight = ref(1.5)
const localLetterSpacing = ref(0)
const localColorMode = ref('solid')
const localTextColor = ref('#cdd6f4')
const localGradientStart = ref('#89b4fa')
const localGradientEnd = ref('#cba6f7')
const localGradientDirection = ref('to right')

function buildDatasetMap(): Record<string, any> {
  const ds = props.option?.dataset
  if (!ds?.dimensions || !ds?.source?.length) return {}
  const row = ds.source[0]
  const map: Record<string, any> = {}
  ds.dimensions.forEach((dim: string, i: number) => {
    map[dim] = row[i]
  })
  return map
}

function replacePlaceholders(text: string, dataMap: Record<string, any>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return key in dataMap ? String(dataMap[key]) : `{{${key}}}`
  })
}

const displayText = computed(() => {
  const dataMap = buildDatasetMap()
  return replacePlaceholders(rawText.value, dataMap)
})

function syncFromProps() {
  const tp = props.textProps ?? {}
  rawText.value = tp.text ?? props.option?.title ?? '文本内容'
  localBgColor.value = tp.bgColor ?? 'transparent'
  localPadding.value = tp.padding ?? 12
  localFontSize.value = tp.fontSize ?? 32
  localFontWeight.value = tp.fontWeight ?? 'bold'
  localTextAlign.value = tp.textAlign ?? 'center'
  localLineHeight.value = tp.lineHeight ?? 1.5
  localLetterSpacing.value = tp.letterSpacing ?? 0
  localColorMode.value = tp.colorMode ?? 'solid'
  localTextColor.value = tp.textColor ?? '#cdd6f4'
  localGradientStart.value = tp.gradientStart ?? '#89b4fa'
  localGradientEnd.value = tp.gradientEnd ?? '#cba6f7'
  localGradientDirection.value = tp.gradientDirection ?? 'to right'
}

watch(() => props.textProps, syncFromProps, { deep: true, immediate: true })
watch(() => props.option, syncFromProps, { deep: true, immediate: true })

const containerStyle = ref({})
const textStyle = ref({})

function rebuildStyles() {
  containerStyle.value = {
    backgroundColor: localBgColor.value,
    padding: `${localPadding.value}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    boxSizing: 'border-box' as const,
    borderRadius: '8px',
  }

  const isGradient = localColorMode.value === 'gradient'
  const dir = localGradientDirection.value
  const gradientColors = `linear-gradient(${dir}, ${localGradientStart.value}, ${localGradientEnd.value})`

  const base: Record<string, any> = {
    fontSize: `${localFontSize.value}px`,
    fontWeight: localFontWeight.value,
    textAlign: localTextAlign.value,
    lineHeight: localLineHeight.value,
    letterSpacing: `${localLetterSpacing.value}px`,
    width: '100%',
    wordBreak: 'break-word' as const,
  }

  if (isGradient) {
    base.background = gradientColors
    base.backgroundClip = 'text'
    base.webkitBackgroundClip = 'text'
    base.webkitTextFillColor = 'transparent'
    base.color = 'transparent'
  } else {
    base.color = localTextColor.value
  }

  textStyle.value = base
}

watch([rawText, localBgColor, localPadding, localFontSize, localFontWeight, localTextAlign, localLineHeight, localLetterSpacing, localColorMode, localTextColor, localGradientStart, localGradientEnd, localGradientDirection], rebuildStyles, { immediate: true })
</script>

<style scoped>
.text-display {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
.text-content {
  user-select: none;
}
</style>
