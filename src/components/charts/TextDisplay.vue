<template>
  <div class="text-display" :style="containerStyle">
    <div class="text-content" :style="textStyle">{{ displayText }}</div>
    <div v-if="displaySubText" class="text-subtitle" :style="subtitleStyle">{{ displaySubText }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue'
import { useInteractFilter } from '../../composables/useInteractFilter'

const props = withDefaults(defineProps<{
  componentId?: string
  option?: Record<string, any>
  width?: number
  height?: number
  textProps?: Record<string, any>
}>(), {
  componentId: '',
  option: () => ({}),
  width: 400,
  height: 200,
  textProps: () => ({}),
})

const componentIdRef = toRef(props, 'componentId')
const dimensions = computed(() => props.option?.dataset?.dimensions ?? [])
const source = computed(() => props.option?.dataset?.source ?? [])
const { filteredSource } = useInteractFilter(componentIdRef, dimensions, source)

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

const rawSubText = ref('')
const localSubFontSize = ref(16)
const localSubFontWeight = ref('normal')
const localSubTextColor = ref('#a6adc8')
const localSubTextAlign = ref('center')
const localSubLineHeight = ref(1.5)
const localTextDefault = ref('')
const localSubTextDefault = ref('')

function buildDatasetMap(): Record<string, any> {
  const ds = props.option?.dataset
  if (!('source' in ds) && !('dimensions' in ds)) {
    return ds
  } 
  if (!ds?.dimensions || !filteredSource.value.length) return {}
  const row = filteredSource.value[0]
  const map: Record<string, any> = {}
  ds.dimensions.forEach((dim: string, i: number) => {
    map[dim] = row[i]
  })
  return map
}

function replacePlaceholders(text: string, dataMap: Record<string, any>, defaultValue: string = ''): string {
  return text.replace(/\{\{(.+?)\}\}/g, (_, key) => {
    const trimmedKey = key.trim()
    if (trimmedKey in dataMap) return String(dataMap[trimmedKey])
    return defaultValue || `{{${trimmedKey}}}`
  })
}

const displayText = computed(() => {
  const dataMap = buildDatasetMap()
  return replacePlaceholders(rawText.value, dataMap, localTextDefault.value)
})

const displaySubText = computed(() => {
  if (!rawSubText.value) return ''
  const dataMap = buildDatasetMap()
  return replacePlaceholders(rawSubText.value, dataMap, localSubTextDefault.value)
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

  rawSubText.value = tp.subText ?? ''
  localSubFontSize.value = tp.subFontSize ?? 16
  localSubFontWeight.value = tp.subFontWeight ?? 'normal'
  localSubTextColor.value = tp.subTextColor ?? '#a6adc8'
  localSubTextAlign.value = tp.subTextAlign ?? 'center'
  localSubLineHeight.value = tp.subLineHeight ?? 1.5
  localTextDefault.value = tp.textDefault ?? ''
  localSubTextDefault.value = tp.subTextDefault ?? ''
}

watch(() => props.textProps, syncFromProps, { deep: true, immediate: true })
watch(() => props.option, syncFromProps, { deep: true, immediate: true })

const containerStyle = ref({})
const textStyle = ref({})
const subtitleStyle = ref({})

function rebuildStyles() {
  containerStyle.value = {
    backgroundColor: localBgColor.value,
    padding: `${localPadding.value}px`,
    display: 'flex',
    flexDirection: 'column',
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

  subtitleStyle.value = {
    fontSize: `${localSubFontSize.value}px`,
    fontWeight: localSubFontWeight.value,
    textAlign: localSubTextAlign.value,
    lineHeight: localSubLineHeight.value,
    color: localSubTextColor.value,
    marginTop: '8px',
    width: '100%',
    wordBreak: 'break-word' as const,
  }
}

watch([rawText, localBgColor, localPadding, localFontSize, localFontWeight, localTextAlign, localLineHeight, localLetterSpacing, localColorMode, localTextColor, localGradientStart, localGradientEnd, localGradientDirection, rawSubText, localSubFontSize, localSubFontWeight, localSubTextColor, localSubTextAlign, localSubLineHeight, localTextDefault, localSubTextDefault], rebuildStyles, { immediate: true })
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
.text-subtitle {
  user-select: none;
}
</style>
