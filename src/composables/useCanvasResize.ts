import { ref, type Ref } from 'vue'

interface ResizeState {
  id: string
  startX: number
  startY: number
  compW: number
  compH: number
}

export function useCanvasResize(
  scale: Ref<number>,
  resizeComponent: (id: string, dw: number, dh: number, baseW: number, baseH: number, maxW?: number, maxH?: number) => void,
) {
  const resizeState = ref<ResizeState | null>(null)

  function startResize(event: MouseEvent, id: string, compW: number, compH: number) {
    resizeState.value = { id, startX: event.clientX, startY: event.clientY, compW, compH }
    window.addEventListener('mousemove', onResizeMove)
    window.addEventListener('mouseup', onResizeEnd)
    window.addEventListener('blur', onResizeEnd)
  }

  function onResizeMove(event: MouseEvent) {
    if (!resizeState.value) return
    const dx = (event.clientX - resizeState.value.startX) / scale.value
    const dy = (event.clientY - resizeState.value.startY) / scale.value
    resizeComponent(resizeState.value.id, dx, dy, resizeState.value.compW, resizeState.value.compH)
  }

  function onResizeEnd() {
    resizeState.value = null
    window.removeEventListener('mousemove', onResizeMove)
    window.removeEventListener('mouseup', onResizeEnd)
    window.removeEventListener('blur', onResizeEnd)
  }

  function cleanup() {
    resizeState.value = null
    window.removeEventListener('mousemove', onResizeMove)
    window.removeEventListener('mouseup', onResizeEnd)
    window.removeEventListener('blur', onResizeEnd)
  }

  return { resizeState, startResize, cleanup }
}
