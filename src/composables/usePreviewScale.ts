import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function usePreviewScale(
  designWidth: Ref<number>,
  designHeight: Ref<number>,
  containerRef: Ref<HTMLElement | undefined>,
) {
  const scale = ref(1)

  function updateScale() {
    if (!containerRef.value) return
    const { clientWidth, clientHeight } = containerRef.value
    scale.value = Math.min(
      clientWidth / designWidth.value,
      clientHeight / designHeight.value,
    )
  }

  onMounted(() => {
    updateScale()
    window.addEventListener('resize', updateScale)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateScale)
  })

  return { scale }
}
