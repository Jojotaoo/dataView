<template>
  <div class="image-display" :style="containerStyle">
    <img
      v-if="imageUrl"
      class="image-content"
      :src="imageUrl"
      :style="imageStyle"
      alt=""
      @error="onImageError"
    />
    <div v-else class="image-placeholder">
      <span class="placeholder-icon">🖼️</span>
      <span class="placeholder-text">请设置图片URL</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef } from 'vue'

const props = withDefaults(defineProps<{
  componentId?: string
  option?: Record<string, any>
  width?: number
  height?: number
  imageProps?: Record<string, any>
}>(), {
  componentId: '',
  option: () => ({}),
  width: 400,
  height: 300,
  imageProps: () => ({}),
})

const imageUrl = ref('')
const localImageScale = ref<string>('cover')
const localBorderRadius = ref(0)
const localOpacity = ref(1)
const localBorderWidth = ref(0)
const localBorderColor = ref('#45475a')
const localBgColor = ref('transparent')

function syncFromProps() {
  const ip = props.imageProps ?? {}
  imageUrl.value = props.option?.dataset ?? ''
  localImageScale.value = ip.imageScale ?? 'cover'
  localBorderRadius.value = ip.borderRadius ?? 0
  localOpacity.value = ip.opacity ?? 1
  localBorderWidth.value = ip.borderWidth ?? 0
  localBorderColor.value = ip.borderColor ?? '#45475a'
  localBgColor.value = ip.bgColor ?? 'transparent'
}

function onImageError() {
  imageUrl.value = ''
}

const containerStyle = ref({})
const imageStyle = ref({})

function rebuildStyles() {
  containerStyle.value = {
    backgroundColor: localBgColor.value,
    borderRadius: `${localBorderRadius.value}px`,
    width: '100%',
    height: '100%',
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  imageStyle.value = {
    width: '100%',
    height: '100%',
    objectFit: localImageScale.value,
    borderRadius: `${localBorderRadius.value}px`,
    opacity: localOpacity.value,
    border: localBorderWidth.value > 0 ? `${localBorderWidth.value}px solid ${localBorderColor.value}` : 'none',
  }
}

watch(() => props.imageProps, syncFromProps, { deep: true, immediate: true })
watch(() => props.option, syncFromProps, { deep: true, immediate: true })
watch([imageUrl, localImageScale, localBorderRadius, localOpacity, localBorderWidth, localBorderColor, localBgColor], rebuildStyles, { immediate: true })
</script>

<style scoped>
.image-display {
  position: relative;
  width: 100%;
  height: 100%;
}
.image-content {
  display: block;
  user-select: none;
}
.image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  background: rgba(69, 71, 90, 0.2);
  border: 2px dashed #45475a;
  border-radius: 6px;
  color: #6c7086;
  font-size: 13px;
}
.placeholder-icon {
  font-size: 32px;
}
.placeholder-text {
  font-size: 13px;
}
</style>
